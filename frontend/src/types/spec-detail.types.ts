import type { SpecLanguage, SpecStatus } from "@/types/spec.types";

/** Priority for review UX; maps to risk-type / review workflow, not DB enums. */
export type SpecRiskPriority = "high" | "medium" | "low";

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
  /** Raw MOM text for read-only disclosure (S3 in production). */
  momPlainText: string;
  sections: SpecDetailSection[];
  risks: SpecDetailRisk[];
  versions: SpecDetailVersion[];
}
