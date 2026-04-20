"use client";

import type { SpecDetailDto } from "@spec-app/schemas";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { SpecificationDetailSkeleton } from "@/components/specs/specification-detail-skeleton";
import { SpecificationDetailView } from "@/components/specs/specification-detail-view";
import { mapSpecDetailDtoToSpecificationDetail } from "@/lib/spec-detail-map";
import { specQueryKeys } from "@/lib/spec-query-keys";
import { getSpecDetail } from "@/services/spec.service";

const SPEC_DETAIL_IN_FLIGHT_POLL_MS = 4_000;

function specDetailIsInFlight(data: SpecDetailDto | undefined): boolean {
  return data?.status === "PENDING" || data?.status === "PROCESSING";
}

export default function SpecificationDetailPage() {
  const params = useParams();
  const mainId = typeof params.mainId === "string" ? params.mainId : "";
  const versionId = typeof params.versionId === "string" ? params.versionId : "";

  const detailQuery = useQuery({
    queryKey: specQueryKeys.detail(mainId, versionId),
    queryFn: () => getSpecDetail(mainId, versionId),
    enabled: Boolean(mainId && versionId),
    refetchInterval: (query) =>
      specDetailIsInFlight(query.state.data)
        ? SPEC_DETAIL_IN_FLIGHT_POLL_MS
        : false,
  });

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

  if (detailQuery.isPending) {
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
