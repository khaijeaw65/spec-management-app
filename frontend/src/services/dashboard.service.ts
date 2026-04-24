import type { DashboardStatCountDto, DashboardStatKind } from "@spec-app/schemas";

import { api } from "@/lib/api/client";

/** `GET /specs/dashboard/counts/:kind` — one dashboard card metric. */
export async function getDashboardStatCount(
  kind: DashboardStatKind,
): Promise<DashboardStatCountDto> {
  const { data } = await api.get<DashboardStatCountDto>(
    `/specs/dashboard/counts/${kind}`,
  );
  return data;
}
