export type SpecStatus =
  | "PROCESSING"
  | "COMPLETED"
  | "REVIEWED"
  | "FAILED";

export type SpecLanguage = "EN" | "TH";

export interface SpecificationListItem {
  id: string;
  /** Generated spec row id for the current version (detail URL + APIs). */
  versionId: string;
  title: string;
  /** When MOM came from file upload — shown as context on the list */
  momFileName?: string | null;
  templateLabel: string;
  version: number;
  sectionCount: number;
  language: SpecLanguage;
  status: SpecStatus;
  /** Set while a regeneration job is in flight; list row still reflects current version. */
  pendingVersionId: string | null;
  /** ISO date string for sorting and display */
  updatedAt: string;
}
