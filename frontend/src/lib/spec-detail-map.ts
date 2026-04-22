import type { SpecDetailDto } from "@spec-app/schemas";

import type {
  SpecDetailRisk,
  SpecificationDetail,
} from "@/types/spec-detail.types";

function humanizeRiskType(code: string): string {
  return code
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function mapPriority(p: SpecDetailDto["risks"][number]["priority"]): SpecDetailRisk["priority"] {
  switch (p) {
    case "HIGH":
      return "high";
    case "LOW":
      return "low";
    case "MEDIUM":
    default:
      return "medium";
  }
}

/** Map API `SpecDetailDto` to the UI `SpecificationDetail` model. */
export function mapSpecDetailDtoToSpecificationDetail(
  dto: SpecDetailDto,
): SpecificationDetail {
  return {
    id: dto.id,
    versionId: dto.versionId,
    title: dto.name,
    description: dto.description ?? "",
    templateLabel: dto.templateName,
    status: dto.status,
    pendingVersionId: dto.pendingVersionId ?? null,
    language: dto.language,
    version: dto.version,
    createdByName: dto.createdByName,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    momFile: dto.momFile
      ? {
          fileName: dto.momFile.fileName,
          extension: dto.momFile.extension,
          versionId: dto.versionId,
        }
      : null,
    sections: dto.sections.map((s, i) => ({
      sortOrder: i + 1,
      title: s.title,
      body: (s.detail ?? s.description ?? "").trim(),
    })),
    risks: dto.risks.map((r) => ({
      id: r.id,
      priority: mapPriority(r.priority),
      categoryLabel: humanizeRiskType(r.riskType),
      relatedSectionName: r.sectionTitle,
      summary: r.detail ?? "",
      contextQuote: r.referenceText ?? "",
    })),
    versions: dto.versions.map((v) => ({
      id: v.id,
      version: v.version,
      isCurrent: v.isCurrent,
      updatedAt: v.updatedAt,
      summary: `Version ${v.version}`,
    })),
  };
}
