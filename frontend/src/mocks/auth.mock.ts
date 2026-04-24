import type { LoginDto } from "@spec-app/schemas";

import { delay, mockResponse } from "@/lib/mock-utils";
import type { ApiResponse } from "@/types/api.types";

export async function mockLogin(
  credentials: LoginDto,
): Promise<ApiResponse<{ email: string }>> {
  await delay(500);
  return mockResponse({ email: credentials.email });
}
