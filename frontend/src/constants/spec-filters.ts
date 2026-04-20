import type {
  SpecFilterOption,
  SpecLangFilter,
  SpecSortKey,
  SpecStatusFilter,
} from "@/types/spec-filters.types";

export const STATUS_FILTER_OPTIONS: SpecFilterOption<SpecStatusFilter>[] = [
  { id: "all", label: "All Status" },
  { id: "PENDING", label: "PENDING" },
  { id: "PROCESSING", label: "PROCESSING" },
  { id: "COMPLETED", label: "COMPLETED" },
  { id: "REVIEWED", label: "REVIEWED" },
  { id: "FAILED", label: "FAILED" },
];

export const LANGUAGE_FILTER_OPTIONS: SpecFilterOption<SpecLangFilter>[] = [
  { id: "all", label: "All Languages" },
  { id: "EN", label: "English" },
  { id: "TH", label: "Thai (ไทย)" },
];

export const SORT_OPTIONS: SpecFilterOption<SpecSortKey>[] = [
  { id: "newest", label: "Newest First" },
  { id: "oldest", label: "Oldest First" },
  { id: "title", label: "Title (A–Z)" },
];
