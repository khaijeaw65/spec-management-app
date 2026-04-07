"use client";

import {
  Button,
  Dropdown,
  Modal,
  SearchField,
  toast,
  useOverlayState,
} from "@heroui/react";
import { FileText, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FilterComboBox } from "@/components/specs/filter-combo-box";
import {
  LANGUAGE_FILTER_OPTIONS,
  SORT_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/constants/spec-filters";
import {
  filterAndSortSpecifications,
  formatListDate,
  languageLabel,
} from "@/lib/spec-list-utils";
import { consumePendingSpecification } from "@/lib/spec-session";
import { MOCK_SPECIFICATIONS } from "@/mocks/spec.mock";
import type {
  SpecLangFilter,
  SpecSortKey,
  SpecStatusFilter,
} from "@/types/spec-filters.types";
import type { SpecificationListItem } from "@/types/spec.types";
import { cn } from "@/lib/utils";

import { SpecStatusBadge } from "./spec-status-badge";

/** HeroUI toast uses View Transitions; skip when tab is hidden to avoid InvalidStateError. */
function toastSpecReady(title: string) {
  if (typeof document === "undefined" || document.visibilityState !== "visible") {
    return;
  }
  try {
    toast.success(`✓ ${title} is ready to review`);
  } catch {
    // View Transition can still reject in edge cases
  }
}

export function SpecificationsList() {
  const router = useRouter();
  const [specs, setSpecs] = useState<SpecificationListItem[]>(
    () => MOCK_SPECIFICATIONS,
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SpecStatusFilter>("all");
  const [langFilter, setLangFilter] = useState<SpecLangFilter>("all");
  const [sortBy, setSortBy] = useState<SpecSortKey>("newest");
  const [regenerateId, setRegenerateId] = useState<string | null>(null);
  const regenerateModal = useOverlayState({
    isOpen: regenerateId !== null,
    onOpenChange: (open) => {
      if (!open) setRegenerateId(null);
    },
  });

  useEffect(() => {
    const pending = consumePendingSpecification();
    if (pending) {
      setSpecs((prev) => [pending, ...prev]);
    }
  }, []);

  const hasProcessing = useMemo(
    () => specs.some((s) => s.status === "PROCESSING"),
    [specs],
  );

  useEffect(() => {
    if (!hasProcessing) return;
    const id = globalThis.setInterval(() => {
      let completedTitle: string | null = null;

      setSpecs((prev) => {
        const processing = prev.find((s) => s.status === "PROCESSING");
        if (!processing) return prev;
        completedTitle = processing.title;
        return prev.map((s) =>
          s.id === processing.id
            ? { ...s, status: "COMPLETED" as const }
            : s,
        );
      });

      if (completedTitle !== null) {
        const title = completedTitle;
        queueMicrotask(() => toastSpecReady(title));
      }
    }, 5000);
    return () => globalThis.clearInterval(id);
  }, [hasProcessing]);

  const filtered = useMemo(
    () =>
      filterAndSortSpecifications(
        specs,
        search,
        statusFilter,
        langFilter,
        sortBy,
      ),
    [specs, search, statusFilter, langFilter, sortBy],
  );

  const markReviewed = useCallback((id: string) => {
    setSpecs((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "REVIEWED" as const } : s,
      ),
    );
  }, []);

  const confirmRegenerate = useCallback(() => {
    regenerateModal.close();
  }, [regenerateModal]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <SearchField.Root
          aria-label="Search by title or template"
          className="w-full"
          variant="primary"
        >
          <SearchField.Group>
            <SearchField.SearchIcon aria-hidden />
            <SearchField.Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or template..."
              value={search}
            />
          </SearchField.Group>
        </SearchField.Root>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FilterComboBox
            label="Status"
            options={STATUS_FILTER_OPTIONS}
            placeholder="Filter by status…"
            selectedKey={statusFilter}
            onSelect={(id) => setStatusFilter(id as SpecStatusFilter)}
          />
          <FilterComboBox
            label="Language"
            options={LANGUAGE_FILTER_OPTIONS}
            placeholder="Filter by language…"
            selectedKey={langFilter}
            onSelect={(id) => setLangFilter(id as SpecLangFilter)}
          />
          <FilterComboBox
            label="Sort By"
            options={SORT_OPTIONS}
            placeholder="Sort list…"
            selectedKey={sortBy}
            onSelect={(id) => setSortBy(id as SpecSortKey)}
          />
        </div>
      </div>

      <p className="text-sm text-zinc-500">
        Showing {filtered.length} of {specs.length} specifications
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white py-16 text-center">
          <FileText aria-hidden className="mb-3 size-10 text-zinc-300" />
          <p className="text-base font-medium text-zinc-800">
            No specifications yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Create your first specification to get started
          </p>
          <Link
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
            href="/specifications/create"
          >
            + Create Specification
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((spec) => (
            <li key={spec.id}>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <FileText
                      aria-hidden
                      className="size-5 text-blue-600"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-950">{spec.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">
                      {spec.templateLabel} • v{spec.version} •{" "}
                      {spec.sectionCount} sections
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700">
                    {languageLabel(spec.language)}
                  </span>
                  <SpecStatusBadge status={spec.status} />
                  <span className="w-24 text-right text-sm text-zinc-500 tabular-nums">
                    {formatListDate(spec.updatedAt)}
                  </span>
                  <Dropdown.Root>
                    <Dropdown.Trigger
                      aria-label={`Actions for ${spec.title}`}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-md text-zinc-500 outline-none transition-colors hover:bg-zinc-100",
                      )}
                    >
                      <MoreVertical className="size-4" aria-hidden />
                    </Dropdown.Trigger>
                    <Dropdown.Popover className="min-w-[200px]">
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onAction={() => {
                            router.push(`/specifications/${spec.id}`);
                          }}
                          textValue="View"
                        >
                          View
                        </Dropdown.Item>
                        <Dropdown.Item
                          onAction={() => {
                            setRegenerateId(spec.id);
                          }}
                          textValue="Regenerate"
                        >
                          Regenerate
                        </Dropdown.Item>
                        {spec.status === "REVIEWED" ? null : (
                          <Dropdown.Item
                            onAction={() => {
                              markReviewed(spec.id);
                            }}
                            textValue="Mark as Reviewed"
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
      )}

      <Modal.Root state={regenerateModal}>
        <Modal.Trigger
          aria-hidden
          className="sr-only pointer-events-none"
          tabIndex={-1}
        />
        <Modal.Backdrop isDismissable />
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
      </Modal.Root>
    </div>
  );
}
