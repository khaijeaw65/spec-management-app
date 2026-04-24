"use client";

import { Skeleton } from "@heroui/react";

import { SPEC_LIST_PAGE_SIZE } from "@/lib/spec-list-utils";

export function SpecificationsListRowSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Skeleton.Root className="size-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton.Root className="h-5 w-3/5 max-w-md rounded-md" />
          <Skeleton.Root className="h-4 w-4/5 max-w-lg rounded-md" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
        <Skeleton.Root className="h-6 w-16 rounded-md" />
        <Skeleton.Root className="h-6 w-20 rounded-md" />
        <Skeleton.Root className="h-4 w-24 rounded-md" />
        <Skeleton.Root className="size-9 rounded-md" />
      </div>
    </div>
  );
}

/** Shown while the specifications query has no data yet (inside {@link SpecificationsList}). */
export function SpecificationsListPendingBody() {
  return (
    <div
      className="space-y-4"
      aria-busy="true"
      aria-label="Loading specifications"
    >
      <Skeleton.Root className="h-4 w-48 rounded-md" />
      <ul className="space-y-2">
        {Array.from({ length: SPEC_LIST_PAGE_SIZE }, (_, i) => (
          <li key={i}>
            <SpecificationsListRowSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Route-level placeholder for `/specifications` while the segment loads.
 */
export function SpecificationsPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton.Root className="h-8 w-56 rounded-md" />
            <Skeleton.Root className="h-4 w-72 max-w-full rounded-md" />
          </div>
          <Skeleton.Root className="h-10 w-28 shrink-0 rounded-lg" />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4" aria-busy="true" aria-label="Loading specifications">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <Skeleton.Root className="h-10 w-full rounded-lg" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Skeleton.Root className="h-12 w-full rounded-lg" />
              <Skeleton.Root className="h-12 w-full rounded-lg" />
              <Skeleton.Root className="h-12 w-full rounded-lg" />
            </div>
          </div>
          <SpecificationsListPendingBody />
        </div>
      </div>
    </div>
  );
}
