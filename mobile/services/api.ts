import axios from "axios";
import * as SecureStore from "expo-secure-store";
import type {
  LoginRequest,
  AuthResponse,
  SpecificationListResponse,
  Specification,
  SpecDetailResponse,
  SpecDetail,
  SpecVersionListResponse,
  SpecVersion,
} from "@/types/api";

const BASE_URL =
  "http://spec-app-alb-463432889.ap-southeast-1.elb.amazonaws.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function login(email: string, password: string) {
  const payload: LoginRequest = { email, password };
  const { data } = await api.post<AuthResponse>("/api/auth/login", payload);

  await SecureStore.setItemAsync("accessToken", data.data.accessToken);
  await SecureStore.setItemAsync("refreshToken", data.data.refreshToken);
  if (data.data.user?.name) {
    await SecureStore.setItemAsync("userName", data.data.user.name);
  }

  return data.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync("accessToken");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("userName");
}

export async function getSpecifications(): Promise<Specification[]> {
  const { data } = await api.get<SpecificationListResponse>("/api/specs");
  return data?.data?.items ?? [];
}

export async function getSpecDetail(mainId: string, versionId: string): Promise<SpecDetail> {
  const { data } = await api.get<SpecDetailResponse>(`/api/specs/${mainId}/versions/${versionId}`);
  return data?.data;
}

export async function getSpecVersions(
  mainId: string
): Promise<SpecVersion[]> {
  const { data } = await api.get<SpecVersionListResponse>(
    `/api/specs/${mainId}/versionsId`
  );
  return data?.data?.items ?? [];
}

export async function markAsReviewed(id: string): Promise<void> {
  await api.patch(`/api/specs/${id}/status`, { status: "REVIEWED" });
}

export default api;


