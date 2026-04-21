import type { DashboardStatKind, SpecListQuery } from "@spec-app/schemas";

import { SPEC_LIST_PAGE_SIZE } from "@/lib/spec-list-utils";

/** React Query keys for spec list + filter metadata (no raw tokens in keys). */

/** Recent activity strip on the dashboard (stable key for polling helpers). */
export const DASHBOARD_RECENT_LIST_PARAMS: SpecListQuery & { limit: number } = {
  page: 1,
  limit: 5,
  sort: "LAST_UPDATED",
};

export const specQueryKeys = {
  dashboardCount: (kind: DashboardStatKind) =>
    ["spec", "dashboard", "counts", kind] as const,
  languages: () => ["spec", "languages"] as const,
  statuses: () => ["spec", "statuses"] as const,
  list: (params: SpecListQuery & { limit: number }) =>
    ["spec", "list", params] as const,
  detail: (mainId: string, versionId: string) =>
    ["spec", "detail", mainId, versionId] as const,
};

export const dashboardRecentListQueryKey = specQueryKeys.list(
  DASHBOARD_RECENT_LIST_PARAMS,
);

export function buildSpecListQueryParams(args: {
  search: string;
  status?: SpecListQuery["status"];
  language?: SpecListQuery["language"];
  sort?: SpecListQuery["sort"];
  page: number;
}): SpecListQuery & { limit: number } {
  return {
    search: args.search.trim() ? args.search.trim() : undefined,
    status: args.status,
    language: args.language,
    sort: args.sort,
    page: args.page,
    limit: SPEC_LIST_PAGE_SIZE,
  };
}
