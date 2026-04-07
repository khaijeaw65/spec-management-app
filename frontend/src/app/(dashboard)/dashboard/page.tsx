import { Plus } from "lucide-react";
import Link from "next/link";

import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { DashboardWorkflow } from "@/components/dashboard/dashboard-workflow";
import { MOCK_SPECIFICATIONS } from "@/mocks/spec.mock";

function computeStats() {
  const list = MOCK_SPECIFICATIONS;
  return {
    total: list.length,
    reviewed: list.filter((s) => s.status === "REVIEWED").length,
    processing: list.filter((s) => s.status === "PROCESSING").length,
    failed: list.filter((s) => s.status === "FAILED").length,
  };
}

function recentSpecs() {
  return [...MOCK_SPECIFICATIONS]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 5);
}

export default function DashboardPage() {
  const stats = computeStats();
  const recent = recentSpecs();

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              Specification Management
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-zinc-600">
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
        <DashboardStats
          total={stats.total}
          reviewed={stats.reviewed}
          processing={stats.processing}
          failed={stats.failed}
        />
        <DashboardWorkflow />
        <DashboardRecentActivity items={recent} />
      </div>
    </div>
  );
}
