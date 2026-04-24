"use client";

import { Card, Skeleton } from "@heroui/react";

/**
 * Full-page placeholder while a specification detail route loads.
 * Mirrors the layout of {@link SpecificationDetailView} for a stable transition.
 */
export function SpecificationDetailSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl">
          <Skeleton.Root className="mb-4 h-4 w-40 rounded-md" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton.Root className="h-9 w-full max-w-xl rounded-md sm:h-10" />
              <Skeleton.Root className="h-4 w-full max-w-2xl rounded-md" />
              <Skeleton.Root className="h-4 w-full max-w-lg rounded-md" />
              <div className="flex flex-wrap gap-2">
                <Skeleton.Root className="h-7 w-24 rounded-full" />
                <Skeleton.Root className="h-7 w-20 rounded-full" />
                <Skeleton.Root className="h-7 w-14 rounded-full" />
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Skeleton.Root className="size-10 rounded-lg" />
              <Skeleton.Root className="h-10 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div
        className="mx-auto max-w-7xl space-y-6 p-6"
        aria-busy="true"
        aria-label="Loading specification"
      >
        <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <Card.Content className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {["a", "b", "c", "d"].map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton.Root className="h-3 w-20 rounded-md" />
                  <Skeleton.Root className="h-5 w-full max-w-[12rem] rounded-md" />
                </div>
              ))}
            </div>
          </Card.Content>
        </Card.Root>

        <Skeleton.Root className="h-12 w-full rounded-xl" />

        <div className="space-y-3 border-b border-zinc-200 pb-px dark:border-zinc-800">
          <div className="flex gap-1">
            <Skeleton.Root className="h-10 w-28 rounded-t-lg" />
            <Skeleton.Root className="h-10 w-40 rounded-t-lg" />
            <Skeleton.Root className="h-10 w-24 rounded-t-lg" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton.Root className="h-32 w-full rounded-xl" />
          <Skeleton.Root className="h-32 w-full rounded-xl" />
          <Skeleton.Root className="h-28 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
