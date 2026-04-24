import type { LoginDto } from "@spec-app/schemas";

import { mockLogin } from "@/mocks/auth.mock";
import type { ApiResponse } from "@/types/api.types";

// TODO: replace with real API call
export async function login(
  credentials: LoginDto,
): Promise<ApiResponse<{ email: string }>> {
  return mockLogin(credentials);
}
