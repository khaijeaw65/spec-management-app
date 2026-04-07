export type SpecStatus =
  | "PROCESSING"
  | "COMPLETED"
  | "REVIEWED"
  | "FAILED"
  | "EXPORTED";

export type SpecLanguage = "en" | "th";

export interface SpecificationListItem {
  id: string;
  title: string;
  templateLabel: string;
  version: number;
  sectionCount: number;
  language: SpecLanguage;
  status: SpecStatus;
  /** ISO date string for sorting and display */
  updatedAt: string;
}
