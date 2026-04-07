import type {
  SpecLangFilter,
  SpecSortKey,
  SpecStatusFilter,
} from "@/types/spec-filters.types";
import type { SpecLanguage, SpecificationListItem } from "@/types/spec.types";

export function formatListDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
}

export function languageLabel(lang: SpecLanguage): string {
  return lang === "th" ? "ไทย" : "English";
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
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.templateLabel.toLowerCase().includes(q),
    );
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
