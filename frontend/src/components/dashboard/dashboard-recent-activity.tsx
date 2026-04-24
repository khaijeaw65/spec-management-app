"use client";

import { Card } from "@heroui/react";
import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { SpecStatusBadge } from "@/components/specs/spec-status-badge";
import { formatRelativeTime } from "@/lib/format-relative-time";
import type { SpecificationListItem } from "@/types/spec.types";

type DashboardRecentActivityProps = {
  items: readonly SpecificationListItem[];
};

function RelativeTime({ iso }: Readonly<{ iso: string }>) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatRelativeTime(iso));
  }, [iso]);

  return (
    <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
      {label ?? "…"}
    </span>
  );
}

export function DashboardRecentActivity({
  items,
}: Readonly<DashboardRecentActivityProps>) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Recent activity
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Latest updates across your specifications.
        </p>
      </div>
      <Card.Root className="border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <Card.Content className="divide-y divide-zinc-100 p-0 dark:divide-zinc-800">
          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No specifications yet. Create one to see activity here.
            </p>
          ) : null}
          {items.map((spec) => (
            <Link
              key={spec.id}
              href={`/specifications/${spec.id}/${spec.versionId}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                <FileText className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  {spec.title}
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {spec.templateLabel} · v{spec.version}
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-3 sm:flex">
                <RelativeTime iso={spec.updatedAt} />
                <SpecStatusBadge status={spec.status} />
                <ArrowRight
                  className="size-4 text-zinc-300 dark:text-zinc-600"
                  aria-hidden
                />
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:hidden">
                <SpecStatusBadge status={spec.status} />
                <RelativeTime iso={spec.updatedAt} />
              </div>
            </Link>
          ))}
        </Card.Content>
      </Card.Root>
    </section>
  );
}
