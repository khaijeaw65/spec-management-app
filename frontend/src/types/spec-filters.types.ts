import type { SpecLanguage, SpecStatus } from "@/types/spec.types";

export type SpecStatusFilter = "all" | SpecStatus;

export type SpecLangFilter = "all" | SpecLanguage;

export type SpecSortKey = "newest" | "oldest" | "title";

export type SpecFilterOption<T extends string = string> = {
  id: T;
  label: string;
};
