"use client";

import {
  Button,
  Dropdown,
  SearchField,
  toast,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import { Pagination } from "@heroui/react/pagination";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { FileText, Loader2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { FilterComboBox } from "@/components/specs/filter-combo-box";
import { RegenerateSpecModal } from "@/components/specs/regenerate-spec-modal";
import {
  buildSpecListQueryParams,
  specQueryKeys,
} from "@/lib/spec-query-keys";
import {
  formatListDate,
  languageLabel,
  mapSpecDtoToSpecificationListItem,
  specificationListVisibleRange,
  SPEC_IN_FLIGHT_POLL_MS,
  SPEC_LIST_PAGE_SIZE,
  specListResponseHasInFlight,
} from "@/lib/spec-list-utils";
import type {
  SpecFilterOption,
  SpecLangFilter,
  SpecSortKey,
  SpecStatusFilter,
} from "@/types/spec-filters.types";
import type { SpecificationListItem } from "@/types/spec.types";
import { cn } from "@/lib/utils";
import {
  getLanguages,
  getSpecs,
  getSpecStatuses,
  updateSpecStatus,
} from "@/services/spec.service";

function patchSpecStatusErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    if (body?.message) {
      return Array.isArray(body.message)
        ? body.message.join(", ")
        : body.message;
    }
  }
  return "Could not update status. Try again.";
}

import { SpecificationsListPendingBody } from "./specifications-page-skeleton";
import { SpecStatusBadge } from "./spec-status-badge";

export function SpecificationsList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SpecStatusFilter>("all");
  const [langFilter, setLangFilter] = useState<SpecLangFilter>("all");
  const [sortBy, setSortBy] = useState<SpecSortKey>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [regenerateMainSpecId, setRegenerateMainSpecId] = useState<
    string | null
  >(null);
  const regenerateModal = useOverlayState({
    isOpen: regenerateMainSpecId !== null,
    onOpenChange: (open) => {
      if (!open) setRegenerateMainSpecId(null);
    },
  });

  const sortToApi = useMemo(() => {
    switch (sortBy) {
      case "oldest":
        return "OLDEST" as const;
      case "title":
        return "TITLE_ASC" as const;
      case "newest":
      default:
        return "NEWEST" as const;
    }
  }, [sortBy]);

  const listParams = useMemo(
    () =>
      buildSpecListQueryParams({
        search,
        status: statusFilter === "all" ? undefined : statusFilter,
        language: langFilter === "all" ? undefined : langFilter,
        sort: sortToApi,
        page: currentPage,
      }),
    [search, statusFilter, langFilter, sortToApi, currentPage],
  );

  const languagesQuery = useQuery({
    queryKey: specQueryKeys.languages(),
    queryFn: () => getLanguages(),
    staleTime: 5 * 60 * 1000,
  });

  const statusesQuery = useQuery({
    queryKey: specQueryKeys.statuses(),
    queryFn: () => getSpecStatuses(),
    staleTime: 5 * 60 * 1000,
  });

  const specsQuery = useQuery({
    queryKey: specQueryKeys.list(listParams),
    queryFn: () => getSpecs(listParams),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      specListResponseHasInFlight(query.state.data)
        ? SPEC_IN_FLIGHT_POLL_MS
        : false,
  });

  const listRegenPrevRef = useRef<
    Record<string, { pendingVersionId: string | null; versionId: string }>
  >({});

  useEffect(() => {
    const items = specsQuery.data?.items;
    if (!items?.length) return;

    const next: Record<
      string,
      { pendingVersionId: string | null; versionId: string }
    > = { ...listRegenPrevRef.current };

    for (const item of items) {
      const prev = listRegenPrevRef.current[item.id];
      if (
        prev &&
        prev.pendingVersionId &&
        !item.pendingVersionId &&
        item.versionId !== prev.versionId
      ) {
        toast.success(`✓ ${item.name} has been regenerated`);
      }
      next[item.id] = {
        pendingVersionId: item.pendingVersionId,
        versionId: item.versionId,
      };
    }

    listRegenPrevRef.current = next;
  }, [specsQuery.data]);

  const markReviewedMutation = useMutation({
    mutationFn: (mainSpecId: string) =>
      updateSpecStatus(mainSpecId, "REVIEWED"),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["spec"] });
      toast.success("Marked as reviewed.");
    },
    onError: (err) => {
      toast.danger(patchSpecStatusErrorMessage(err));
    },
  });

  const languageOptions: SpecFilterOption<SpecLangFilter>[] = useMemo(() => {
    const langs = languagesQuery.data;
    if (!langs) {
      return [{ id: "all", label: "All Languages" }];
    }
    return [
      { id: "all", label: "All Languages" },
      ...langs.map((l) => ({ id: l.code as SpecLangFilter, label: l.name })),
    ];
  }, [languagesQuery.data]);

  const statusOptions: SpecFilterOption<SpecStatusFilter>[] = useMemo(() => {
    const statuses = statusesQuery.data;
    if (!statuses) {
      return [{ id: "all", label: "All Status" }];
    }
    return [
      { id: "all", label: "All Status" },
      ...statuses.map((s) => ({
        id: s.code as SpecStatusFilter,
        label: s.name,
      })),
    ];
  }, [statusesQuery.data]);

  const totalCount = specsQuery.data?.totalCount ?? 0;

  const totalPages = useMemo(
    () => (totalCount === 0 ? 0 : Math.ceil(totalCount / SPEC_LIST_PAGE_SIZE)),
    [totalCount],
  );

  const effectivePage = useMemo(() => {
    if (totalPages === 0) return 1;
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () =>
      specificationListVisibleRange(
        effectivePage,
        SPEC_LIST_PAGE_SIZE,
        totalCount,
      ),
    [effectivePage, totalCount],
  );

  const specs: SpecificationListItem[] = useMemo(() => {
    const items = specsQuery.data?.items;
    if (!items) return [];
    return items.map(mapSpecDtoToSpecificationListItem);
  }, [specsQuery.data?.items]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <SearchField.Root
          aria-label="Search by title or template"
          className="w-full"
          variant="primary"
        >
          <SearchField.Group>
            <SearchField.SearchIcon aria-hidden />
            <SearchField.Input
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by title or template..."
              value={search}
            />
          </SearchField.Group>
        </SearchField.Root>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FilterComboBox
            label="Status"
            options={statusOptions}
            placeholder="Filter by status…"
            selectedKey={statusFilter}
            onSelect={(id) => {
              setStatusFilter(id as SpecStatusFilter);
              setCurrentPage(1);
            }}
          />
          <FilterComboBox
            label="Language"
            options={languageOptions}
            placeholder="Filter by language…"
            selectedKey={langFilter}
            onSelect={(id) => {
              setLangFilter(id as SpecLangFilter);
              setCurrentPage(1);
            }}
          />
          <FilterComboBox
            label="Sort By"
            options={[
              { id: "newest", label: "Newest First" },
              { id: "oldest", label: "Oldest First" },
              { id: "title", label: "Title (A–Z)" },
            ]}
            placeholder="Sort list…"
            selectedKey={sortBy}
            onSelect={(id) => {
              setSortBy(id as SpecSortKey);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {specsQuery.isPending ? <SpecificationsListPendingBody /> : null}

      {specsQuery.isError ? (
        <p className="text-sm text-red-600 dark:text-red-400">
          Could not load specifications. Try again in a moment.
        </p>
      ) : null}

      {totalCount > 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing {rangeStart}–{rangeEnd} of {totalCount} specifications
        </p>
      ) : null}

      {specsQuery.isError ? null : specsQuery.isPending ? null : specs.length === 0 ? (
        totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <FileText
            aria-hidden
            className="mb-3 size-10 text-zinc-300 dark:text-zinc-600"
          />
          <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
            No specifications yet
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create your first specification to get started
          </p>
          <Link
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            href="/specifications/create"
          >
            + Create Specification
          </Link>
        </div>
        ) : currentPage > 1 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <FileText
              aria-hidden
              className="mb-3 size-10 text-zinc-300 dark:text-zinc-600"
            />
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
              This page is empty
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try going back to the first page of results.
            </p>
            <Button
              className="mt-6 bg-blue-600 text-white"
              onPress={() => setCurrentPage(1)}
            >
              First page
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <FileText
              aria-hidden
              className="mb-3 size-10 text-zinc-300 dark:text-zinc-600"
            />
            <p className="text-base font-medium text-zinc-800 dark:text-zinc-200">
              No matching specifications
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Adjust your search or filters and try again.
            </p>
          </div>
        )
      ) : (
        <>
        <ul className="space-y-2">
          {specs.map((spec) => (
            <li key={spec.id}>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/50">
                    <FileText
                      aria-hidden
                      className="size-5 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">
                      {spec.title}
                    </p>
                    {spec.momFileName ? (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        MOM file: {spec.momFileName}
                      </p>
                    ) : null}
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {spec.templateLabel} • v{spec.version} •{" "}
                      {spec.sectionCount} sections
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {languageLabel(spec.language)}
                  </span>
                  <span className="inline-flex flex-wrap items-center gap-1">
                    <SpecStatusBadge status={spec.status} />
                    {(spec.status === "COMPLETED" ||
                      spec.status === "REVIEWED") &&
                    spec.pendingVersionId !== null ? (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                          "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
                        )}
                      >
                        <Loader2
                          aria-hidden
                          className="size-3.5 animate-spin"
                        />
                        Regenerating...
                      </span>
                    ) : null}
                  </span>
                  <span className="w-24 text-right text-sm text-zinc-500 tabular-nums dark:text-zinc-400">
                    {formatListDate(spec.updatedAt)}
                  </span>
                  <Dropdown.Root>
                    <Dropdown.Trigger
                      aria-label={`Actions for ${spec.title}`}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md text-zinc-500 outline-none transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
                      )}
                    >
                      <MoreVertical className="size-4" aria-hidden />
                    </Dropdown.Trigger>
                    <Dropdown.Popover className="min-w-[200px]">
                      <Dropdown.Menu>
                        {spec.versionId ? (
                          <Dropdown.Item
                            onAction={() => {
                              router.push(
                                `/specifications/${spec.id}/${spec.versionId}`,
                              );
                            }}
                            textValue="View"
                          >
                            View
                          </Dropdown.Item>
                        ) : null}
                        {spec.pendingVersionId !== null ? (
                          <Tooltip.Root>
                            <Tooltip.Trigger>
                              <div className="w-full">
                                <Dropdown.Item
                                  isDisabled
                                  textValue="Regenerate"
                                >
                                  Regenerate
                                </Dropdown.Item>
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              Regeneration already in progress
                            </Tooltip.Content>
                          </Tooltip.Root>
                        ) : (
                          <Dropdown.Item
                            onAction={() => {
                              setRegenerateMainSpecId(spec.id);
                            }}
                            textValue="Regenerate"
                          >
                            Regenerate
                          </Dropdown.Item>
                        )}
                        {spec.status === "REVIEWED" ||
                        spec.status === "PROCESSING" ||
                        spec.status === "FAILED" ? null : (
                          <Dropdown.Item
                            onAction={() => {
                              markReviewedMutation.mutate(spec.id);
                            }}
                            textValue="Mark as Reviewed"
                            isDisabled={markReviewedMutation.isPending}
                          >
                            Mark as Reviewed
                          </Dropdown.Item>
                        )}
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.Root>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {totalPages > 1 ? (
          <Pagination.Root
            aria-label="Specification list pages"
            className="mt-4 w-full justify-center gap-1 sm:justify-end"
            size="sm"
          >
            <Pagination.Content className="flex flex-wrap items-center gap-1">
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={effectivePage <= 1}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Pagination.Item key={pageNum}>
                    <Pagination.Link
                      isActive={pageNum === effectivePage}
                      onPress={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={effectivePage >= totalPages}
                  onPress={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination.Root>
        ) : null}
        </>
      )}

      <RegenerateSpecModal
        state={regenerateModal}
        mainSpecId={regenerateMainSpecId ?? ""}
      />
    </div>
  );
}
