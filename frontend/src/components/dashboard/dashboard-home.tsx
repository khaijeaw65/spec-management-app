"use client";

import type { DashboardStatKind } from "@spec-app/schemas";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardWorkflow } from "@/components/dashboard/dashboard-workflow";
import {
  DASHBOARD_RECENT_LIST_PARAMS,
  dashboardRecentListQueryKey,
  specQueryKeys,
} from "@/lib/spec-query-keys";
import {
  mapSpecDtoToSpecificationListItem,
  SPEC_IN_FLIGHT_POLL_MS,
  specListResponseHasInFlight,
} from "@/lib/spec-list-utils";
import { getDashboardStatCount } from "@/services/dashboard.service";
import { getSpecs } from "@/services/spec.service";

const DASHBOARD_COUNT_KINDS = [
  "total",
  "reviewed",
  "processing",
  "failed",
] as const satisfies readonly DashboardStatKind[];

export function DashboardHome() {
  const recentQuery = useQuery({
    queryKey: dashboardRecentListQueryKey,
    queryFn: () => getSpecs(DASHBOARD_RECENT_LIST_PARAMS),
    refetchInterval: (query) =>
      specListResponseHasInFlight(query.state.data)
        ? SPEC_IN_FLIGHT_POLL_MS
        : false,
  });

  const shouldPoll = specListResponseHasInFlight(recentQuery.data);

  const countQueries = useQueries({
    queries: DASHBOARD_COUNT_KINDS.map((kind) => ({
      queryKey: specQueryKeys.dashboardCount(kind),
      queryFn: () => getDashboardStatCount(kind),
      refetchInterval: shouldPoll ? SPEC_IN_FLIGHT_POLL_MS : false,
    })),
  });

  const recentItems = useMemo(() => {
    const items = recentQuery.data?.items;
    if (!items?.length) return [];
    return items.map(mapSpecDtoToSpecificationListItem);
  }, [recentQuery.data?.items]);

  const countsDisplay = useMemo(
    () => ({
      total: countQueries[0]?.data?.count ?? 0,
      reviewed: countQueries[1]?.data?.count ?? 0,
      processing: countQueries[2]?.data?.count ?? 0,
      failed: countQueries[3]?.data?.count ?? 0,
    }),
    [countQueries],
  );

  const isPending =
    recentQuery.isPending ||
    countQueries.some((q) => q.isPending);

  const isError =
    recentQuery.isError ||
    countQueries.some((q) => q.isError);

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Specification Management
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
              Transform meeting notes into structured, unambiguous project
              specifications — AI runs only in controlled workflow steps, not as
              a chat.
            </p>
          </div>
          <Link
            href="/specifications/create"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden />
            Create specification
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 p-6">
        {isError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            Could not load dashboard data. Refresh the page or try again later.
          </p>
        ) : null}
        {isPending ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(["a", "b", "c", "d"] as const).map((id) => (
              <div
                key={id}
                className="h-[88px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
              />
            ))}
          </div>
        ) : (
          <DashboardStats
            total={countsDisplay.total}
            reviewed={countsDisplay.reviewed}
            processing={countsDisplay.processing}
            failed={countsDisplay.failed}
          />
        )}
        <DashboardWorkflow />
        {isPending ? (
          <div className="h-64 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
        ) : (
          <DashboardRecentActivity items={recentItems} />
        )}
      </div>
    </div>
  );
}
