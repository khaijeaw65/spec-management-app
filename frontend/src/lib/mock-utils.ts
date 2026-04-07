import type { ApiResponse } from "@/types/api.types";

export const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export function mockResponse<T>(data: T, status = 200): ApiResponse<T> {
  return { status, message: "success", data };
}
