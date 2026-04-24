import type { SpecLanguage } from "@/types/spec.types";

export interface TemplateListItem {
  id: string;
  name: string;
  language: SpecLanguage;
  sectionCount: number;
  /** ISO date string */
  createdAt: string;
}
