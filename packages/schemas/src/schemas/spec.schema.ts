import { z } from "zod";
import { LanguageCodeSchema } from "./language.schema";
import { SpecStatusCodeSchema } from "./spec-status.schema";

/** Step 1 — meeting notes (paste or file). Matches create wizard `inputMethod`. */
export const CreateSpecStep1Schema = z.discriminatedUnion("inputMethod", [
  z.object({
    inputMethod: z.literal("paste"),
    momContent: z
      .string()
      .min(50, { message: "Meeting notes must be at least 50 characters." }),
  }),
  z.object({
    inputMethod: z.literal("upload"),
    fileName: z.string().min(1, { message: "Select a file." }),
    fileSize: z.number().positive({ message: "Select a valid file." }),
  }),
]);

export type CreateSpecStep1Dto = z.infer<typeof CreateSpecStep1Schema>;

/** Step 2 — template, spec name, optional description (language comes from the template). */
export const CreateSpecStep2Schema = z.object({
  templateId: z.string().min(1, { message: "Select a template." }),
  name: z
    .string()
    .trim()
    .min(2, {
      message: "Enter a specification name (at least 2 characters).",
    })
    .max(255, { message: "Name must be at most 255 characters." }),
  description: z
    .string()
    .trim()
    .max(2000, { message: "Description must be at most 2000 characters." })
    .optional(),
});

export type CreateSpecStep2Dto = z.infer<typeof CreateSpecStep2Schema>;

/**
 * Single payload for future API wiring (`TEXT` | `FILE` aligns with DB `mom_input_type`).
 */
export const CreateSpecSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Enter a specification name (at least 2 characters)." }),
  description: z.string().optional(),
  momContent: z
    .string()
    .min(50, { message: "Meeting notes must be at least 50 characters." }),
  inputType: z.enum(["TEXT", "FILE"]),
  mainTemplateId: z.uuid(),
  versionId: z.uuid(),
});

export type CreateSpecDto = z.infer<typeof CreateSpecSchema>;

/** Returned after `POST /specs/generate` (main spec id + current generated version id). */
export const GenerateSpecResponseSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
});

export type GenerateSpecResponseDto = z.infer<
  typeof GenerateSpecResponseSchema
>;

/** `PATCH /specs/:id/status` — `id` is main spec id; status applies to the current version row. */
export const UpdateSpecStatusSchema = z.object({
  status: SpecStatusCodeSchema,
});

export type UpdateSpecStatusDto = z.infer<typeof UpdateSpecStatusSchema>;

export const SpecSortSchema = z.enum([
  "NEWEST",
  "OLDEST",
  "TITLE_ASC",
  "TITLE_DESC",
  /** Main spec `updatedOn` descending (e.g. dashboard recent activity). */
  "LAST_UPDATED",
]);

export const SpecListQuerySchema = z.object({
  search: z.string().optional(),
  status: SpecStatusCodeSchema.optional(),
  language: LanguageCodeSchema.optional(),
  sort: SpecSortSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type SpecListQuery = z.infer<typeof SpecListQuerySchema>;

export const SpecTemplateSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
  name: z.string(),
});

export const SpecSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
  name: z.string(),
  version: z.number(),
  sectionCount: z.number(),
  language: z.string(),
  status: SpecStatusCodeSchema,
  /** True when a stable current version exists and a new version is generating. */
  isRegenerating: z.boolean(),
  pendingVersionId: z.string().uuid().nullable(),
  updatedAt: z.string(),
  template: SpecTemplateSchema,
});

export type SpecDto = z.infer<typeof SpecSchema>;

export const SpecListResponseSchema = z.object({
  items: z.array(SpecSchema),
  totalCount: z.number(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
});

export type SpecListResponseDto = z.infer<typeof SpecListResponseSchema>;

/** Path segment for `GET /specs/dashboard/counts/:kind`. */
export const DashboardStatKindSchema = z.enum([
  "total",
  "reviewed",
  "processing",
  "failed",
]);

export type DashboardStatKind = z.infer<typeof DashboardStatKindSchema>;

export const DashboardStatCountSchema = z.object({
  count: z.number().int().min(0),
});

export type DashboardStatCountDto = z.infer<typeof DashboardStatCountSchema>;

export const SpecDetailSectionSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().optional(),
  detail: z.string().optional(),
});

export const RiskTypeSchema = z.enum([
  "AMBIGUOUS_LANGUAGE",
  "MISSING_OWNER",
  "NO_TIMELINE",
  "ASSUMED_FACT",
  "UNCLEAR_SCOPE",
]);

export const RiskPrioritySchema = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const SpecDetailRiskSchema = z.object({
  id: z.uuid(),
  sectionTitle: z.string(),
  riskType: RiskTypeSchema,
  priority: RiskPrioritySchema,
  detail: z.string().optional(),
  referenceText: z.string().optional(),
});

export const SpecDetailVersionSchema = z.object({
  id: z.uuid(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** True when this version is the family’s currentVersion (not “the one you’re viewing”). */
  isCurrent: z.boolean(),
});

export const SpecDetailMomFileSchema = z.object({
  fileName: z.string(),
  extension: z.enum(["txt", "pdf", "docx"]),
});

export const SpecDetailSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
  name: z.string(),
  /** Template name (main template’s current version title). */
  templateName: z.string(),
  description: z.string().optional(),
  status: SpecStatusCodeSchema,
  pendingVersionId: z.string().uuid().nullable(),
  language: LanguageCodeSchema,
  version: z.number(),
  createdByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  /** Original MOM in object storage; download via `GET /specs/:versionId/mom`. */
  momFile: SpecDetailMomFileSchema.nullable(),
  sections: z.array(SpecDetailSectionSchema),
  risks: z.array(SpecDetailRiskSchema),
  versions: z.array(SpecDetailVersionSchema),
});

export type SpecDetailDto = z.infer<typeof SpecDetailSchema>;

export const RegenerateSpecSchema = z.object({
  momContent: z
    .string()
    .min(50, { message: "Meeting notes must be at least 50 characters." }),
  inputType: z.enum(["TEXT", "FILE"]),
});

export type RegenerateSpecDto = z.infer<typeof RegenerateSpecSchema>;

export const UpdateSpecMetaDataSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type UpdateSpecMetaDataDto = z.infer<typeof UpdateSpecMetaDataSchema>;
