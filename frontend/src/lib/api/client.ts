import type { LoginResponseDto } from "@spec-app/schemas";
import axios, { AxiosError } from "axios";
import { getSession, signOut } from "next-auth/react";

import type { ApiResponse } from "@/types/api.types";

import { persistRefreshedTokens } from "./auth-bridge";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (typeof window !== "undefined" && !baseURL) {
  console.warn("NEXT_PUBLIC_API_URL is not set");
}

/** Axios instance: `baseURL` = API origin + `/api` (Nest global prefix). */
export const api = axios.create({
  baseURL: baseURL ? `${baseURL}/api` : "/api",
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

function unwrapApiResponse<T>(raw: unknown): T {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    "status" in raw &&
    "message" in raw
  ) {
    return (raw as ApiResponse<T>).data;
  }
  return raw as T;
}

async function postRefresh(refreshToken: string): Promise<LoginResponseDto | null> {
  if (!baseURL) return null;

  try {
    const res = await axios.post<ApiResponse<LoginResponseDto>>(
      `${baseURL}/api/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } },
    );
    return res.data?.data ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (
      response.config.responseType === "blob" ||
      response.config.responseType === "arraybuffer"
    ) {
      return response;
    }
    response.data = unwrapApiResponse(response.data);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Only HTTP 401 may trigger refresh + a single replay. Any other status (or no
    // response) is rejected here — no retry.
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const url = String(originalRequest.url ?? "");
    if (url.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    const session = await getSession();
    const refreshToken = session?.refreshToken;
    if (!refreshToken) {
      await signOut({ callbackUrl: "/login" });
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const tokens = await postRefresh(refreshToken);
          if (!tokens) {
            await signOut({ callbackUrl: "/login" });
            return null;
          }
          await persistRefreshedTokens({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          });
          return tokens.accessToken;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const newAccess = await refreshPromise;
    if (!newAccess) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
    return api.request(originalRequest);
  },
);
