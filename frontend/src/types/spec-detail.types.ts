import type { SpecLanguage, SpecStatus } from "@/types/spec.types";

/** Priority for review UX; maps to risk-type / review workflow, not DB enums. */
export type SpecRiskPriority = "high" | "medium" | "low";

/** Supported original MOM file types (matches backend upload rules; .doc is not allowed). */
export type MomFileExtension = "txt" | "pdf" | "docx";

export interface SpecificationMomFile {
  /** Original or generated file name (e.g. meeting-notes.docx). */
  fileName: string;
  extension: MomFileExtension;
  /**
   * Loads `GET /specs/:versionId/mom` with Bearer auth (API-backed detail).
   */
  versionId?: string;
  /**
   * Static/demo asset URL when `versionId` is not used (e.g. `/spec-mom-samples/...`).
   */
  downloadUrl?: string;
}

export interface SpecDetailSection {
  sortOrder: number;
  title: string;
  body: string;
}

export interface SpecDetailRisk {
  id: string;
  priority: SpecRiskPriority;
  categoryLabel: string;
  /** Related template section title (FR-RISK-02). */
  relatedSectionName: string;
  summary: string;
  contextQuote: string;
}

export interface SpecDetailVersion {
  /** Generated-spec row id (version row) */
  id: string;
  version: number;
  isCurrent: boolean;
  updatedAt: string;
  summary: string;
}

export interface SpecificationDetail {
  /** Main spec id (status updates, route). */
  id: string;
  /** Current generated-spec row id (PDF export). */
  versionId: string;
  title: string;
  description: string;
  templateLabel: string;
  status: SpecStatus;
  /** Non-null while a new version is generating; UI keeps showing current version. */
  pendingVersionId: string | null;
  language: SpecLanguage;
  /** Current completed version number (GeneratedSpec). */
  version: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Original MOM artifact (S3 in production). Text is not stored in DB — only the file.
   * UI offers download + preview for .txt, .pdf, .docx.
   */
  momFile: SpecificationMomFile | null;
  sections: SpecDetailSection[];
  risks: SpecDetailRisk[];
  versions: SpecDetailVersion[];
}
