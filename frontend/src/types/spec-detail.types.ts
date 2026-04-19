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
   * URL for download and in-app preview. Demo: `/spec-mom-samples/...`;
   * production: presigned S3 GET URL.
   */
  downloadUrl: string;
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
  version: number;
  isCurrent: boolean;
  updatedAt: string;
  summary: string;
}

export interface SpecificationDetail {
  id: string;
  title: string;
  description: string;
  templateLabel: string;
  status: SpecStatus;
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
