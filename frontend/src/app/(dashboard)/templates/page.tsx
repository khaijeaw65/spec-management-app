import Link from "next/link";
import { Plus } from "lucide-react";

import { TemplatesList } from "@/components/templates/templates-list";

export default function TemplatesPage() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-200 bg-white px-6 py-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Templates
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Manage reusable structures for generated specifications.
            </p>
          </div>
          <Link
            href="/templates/create"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="size-4" aria-hidden />
            New Template
          </Link>
        </div>
      </div>
      <div className="p-6">
        <TemplatesList />
      </div>
    </div>
  );
}
