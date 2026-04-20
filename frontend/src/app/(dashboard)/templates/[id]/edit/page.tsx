"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { TemplateForm } from "@/components/templates/template-form";
import { templateQueryKeys } from "@/lib/template-query-keys";
import { getTemplateById } from "@/services/template.service";

export default function EditTemplatePage() {
  const params = useParams();
  const id = String(params.id ?? "");

  const { data, isPending, isError } = useQuery({
    queryKey: templateQueryKeys.detail(id),
    queryFn: () => getTemplateById(id),
    enabled: Boolean(id),
  });

  if (!id) {
    return null;
  }

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6 text-sm text-zinc-500 dark:text-zinc-400">
        Loading template…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          Template not found
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This template may have been removed or you may not have access.
        </p>
        <Link
          href="/templates"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
        >
          Back to templates
        </Link>
      </div>
    );
  }

  return (
    <TemplateForm key={data.versionId} mode="edit" defaultValues={data} />
  );
}
