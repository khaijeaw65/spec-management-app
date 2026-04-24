"use client";

import type { SpecDetailDto } from "@spec-app/schemas";
import { toast } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { SpecificationDetailSkeleton } from "@/components/specs/specification-detail-skeleton";
import { SpecificationDetailView } from "@/components/specs/specification-detail-view";
import { mapSpecDetailDtoToSpecificationDetail } from "@/lib/spec-detail-map";
import { specQueryKeys } from "@/lib/spec-query-keys";
import { getSpecDetail } from "@/services/spec.service";

const SPEC_DETAIL_IN_FLIGHT_POLL_MS = 4_000;

function specDetailShouldPoll(data: SpecDetailDto | undefined): boolean {
  if (!data) return false;
  return (
    data.status === "PROCESSING" || data.pendingVersionId !== null
  );
}

export default function SpecificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mainId = typeof params.mainId === "string" ? params.mainId : "";
  const versionId = typeof params.versionId === "string" ? params.versionId : "";
  const regenPendingPrevRef = useRef<string | null | undefined>(undefined);

  const detailQuery = useQuery({
    queryKey: specQueryKeys.detail(mainId, versionId),
    queryFn: () => getSpecDetail(mainId, versionId),
    enabled: Boolean(mainId && versionId),
    refetchInterval: (query) =>
      specDetailShouldPoll(query.state.data)
        ? SPEC_DETAIL_IN_FLIGHT_POLL_MS
        : false,
  });

  useEffect(() => {
    const data = detailQuery.data;
    if (!data) return;

    const prev = regenPendingPrevRef.current;
    const curr = data.pendingVersionId ?? null;

    if (
      prev !== undefined &&
      prev !== null &&
      curr === null &&
      (data.status === "COMPLETED" || data.status === "REVIEWED") &&
      data.versionId !== versionId
    ) {
      toast.success("✓ New version is ready");
      router.replace(`/specifications/${mainId}/${data.versionId}`);
    }

    regenPendingPrevRef.current = curr;
  }, [detailQuery.data, mainId, versionId, router]);

  if (!mainId || !versionId) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Invalid link
          </h1>
          <Link
            href="/specifications"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to specifications
          </Link>
        </div>
      </div>
    );
  }

  const showDetailSkeleton =
    !detailQuery.data &&
    (detailQuery.isPending || detailQuery.isFetching);

  if (showDetailSkeleton) {
    return <SpecificationDetailSkeleton />;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
            Specification not found
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This specification may have been removed, or the link is outdated.
          </p>
          <Link
            href="/specifications"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to specifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <SpecificationDetailView
      detail={mapSpecDetailDtoToSpecificationDetail(detailQuery.data)}
    />
  );
}
