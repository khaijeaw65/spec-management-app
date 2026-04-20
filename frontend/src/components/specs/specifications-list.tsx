"use client";

import {
  Button,
  Dropdown,
  Modal,
  SearchField,
  toast,
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
import { FileText, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import type { SpecListResponseDto } from "@spec-app/schemas";

import { FilterComboBox } from "@/components/specs/filter-combo-box";
import {
  buildSpecListQueryParams,
  specQueryKeys,
} from "@/lib/spec-query-keys";
import {
  formatListDate,
  languageLabel,
  specificationListVisibleRange,
  SPEC_LIST_PAGE_SIZE,
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

/** Poll list while any row on the current response is still generating. */
const SPEC_LIST_IN_FLIGHT_POLL_MS = 4_000;

function specListHasPendingOrProcessing(
  data: SpecListResponseDto | undefined,
): boolean {
  return (
    data?.items.some(
      (s) => s.status === "PENDING" || s.status === "PROCESSING",
    ) ?? false
  );
}

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
  const [regenerateId, setRegenerateId] = useState<string | null>(null);
  const regenerateModal = useOverlayState({
    isOpen: regenerateId !== null,
    onOpenChange: (open) => {
      if (!open) setRegenerateId(null);
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
      specListHasPendingOrProcessing(query.state.data)
        ? SPEC_LIST_IN_FLIGHT_POLL_MS
        : false,
  });

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
    return items.map((s) => ({
      id: s.id,
      versionId: s.versionId,
      title: s.name,
      templateLabel: s.templateName,
      version: s.version,
      sectionCount: s.sectionCount,
      language: s.language as SpecificationListItem["language"],
      status: s.status as SpecificationListItem["status"],
      updatedAt: s.updatedAt,
    }));
  }, [specsQuery.data?.items]);

  const confirmRegenerate = useCallback(() => {
    regenerateModal.close();
  }, [regenerateModal]);

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
                  <SpecStatusBadge status={spec.status} />
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
                        <Dropdown.Item
                          onAction={() => {
                            setRegenerateId(spec.id);
                          }}
                          textValue="Regenerate"
                        >
                          Regenerate
                        </Dropdown.Item>
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

      <Modal.Root state={regenerateModal}>
        <Modal.Trigger
          aria-hidden
          className="sr-only pointer-events-none"
          tabIndex={-1}
        />
        <Modal.Backdrop isDismissable>
          <Modal.Container placement="center" size="md">
            <Modal.Dialog aria-labelledby="regenerate-dialog-title">
              <Modal.Header>
                <Modal.Heading id="regenerate-dialog-title">
                  Regenerate specification?
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                This will create a new version. Previous versions remain viewable.
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-2">
                <Button variant="outline" onPress={() => regenerateModal.close()}>
                  Cancel
                </Button>
                <Button
                  className="bg-blue-600 text-white"
                  onPress={confirmRegenerate}
                >
                  Confirm
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
