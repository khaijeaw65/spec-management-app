import type { SpecDto, SpecListResponseDto } from "@spec-app/schemas";

import type {
  SpecLangFilter,
  SpecSortKey,
  SpecStatusFilter,
} from "@/types/spec-filters.types";
import type { SpecLanguage, SpecificationListItem } from "@/types/spec.types";

/** Map list API row to UI list item (specifications list + dashboard). */
export function mapSpecDtoToSpecificationListItem(
  s: SpecDto,
): SpecificationListItem {
  return {
    id: s.id,
    versionId: s.versionId,
    title: s.name,
    templateLabel: s.template.name,
    version: s.version,
    sectionCount: s.sectionCount,
    language: s.language as SpecificationListItem["language"],
    status: s.status as SpecificationListItem["status"],
    pendingVersionId: s.pendingVersionId,
    updatedAt: s.updatedAt,
  };
}

/** Page size for the specifications list (client-side pagination). */
export const SPEC_LIST_PAGE_SIZE = 5;

/** Poll interval while any spec row is generating (list + dashboard). */
export const SPEC_IN_FLIGHT_POLL_MS = 4_000;

export function specListResponseHasInFlight(
  data: SpecListResponseDto | undefined,
): boolean {
  return (
    data?.items.some(
      (s) => s.status === "PROCESSING" || s.isRegenerating,
    ) ?? false
  );
}

/** Clamp 1-based page index to valid range for the filtered count. */
export function clampSpecificationListPage(
  currentPage: number,
  totalFiltered: number,
  pageSize: number,
): number {
  if (totalFiltered === 0) return 1;
  const totalPages = Math.ceil(totalFiltered / pageSize);
  return Math.min(Math.max(1, currentPage), totalPages);
}

/** Slice the current page from an already filtered/sorted list. */
export function specificationListPageSlice<T>(
  items: T[],
  safePage: number,
  pageSize: number,
): T[] {
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Inclusive 1-based range labels for “Showing a–b of n”. */
export function specificationListVisibleRange(
  safePage: number,
  pageSize: number,
  totalFiltered: number,
): { start: number; end: number } {
  if (totalFiltered === 0) return { start: 0, end: 0 };
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalFiltered);
  return { start, end };
}

export function formatListDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function languageLabel(lang: SpecLanguage): string {
  return lang === "TH" ? "ไทย" : "English";
}

export function filterAndSortSpecifications(
  specs: SpecificationListItem[],
  search: string,
  statusFilter: SpecStatusFilter,
  langFilter: SpecLangFilter,
  sortBy: SpecSortKey,
): SpecificationListItem[] {
  let list = [...specs];
  const q = search.trim().toLowerCase();
  if (q) {
    list = list.filter((s) => {
      const file = s.momFileName?.toLowerCase() ?? "";
      return (
        s.title.toLowerCase().includes(q) ||
        s.templateLabel.toLowerCase().includes(q) ||
        file.includes(q)
      );
    });
  }
  if (statusFilter !== "all") {
    list = list.filter((s) => s.status === statusFilter);
  }
  if (langFilter !== "all") {
    list = list.filter((s) => s.language === langFilter);
  }
  list.sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    const ta = new Date(a.updatedAt).getTime();
    const tb = new Date(b.updatedAt).getTime();
    return sortBy === "newest" ? tb - ta : ta - tb;
  });
  return list;
}
