import { z } from "zod";
import { LanguageSchema } from "./template.schema";

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

/** Step 2 — template, language, spec name, optional description (maps to `main_generated_spec`). */
export const CreateSpecStep2Schema = z.object({
  templateId: z.string().min(1, { message: "Select a template." }),
  language: LanguageSchema,
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
  language: LanguageSchema,
});

export type CreateSpecDto = z.infer<typeof CreateSpecSchema>;

export const SpecSortSchema = z.enum([
  "NEWEST",
  "OLDEST",
  "TITLE_ASC",
  "TITLE_DESC",
]);

export const SpecStatusSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REVIEWED",
]);

export const SpecListQuerySchema = z.object({
  search: z.string().optional(),
  status: SpecStatusSchema.optional(),
  language: LanguageSchema.optional(),
  sort: SpecSortSchema.optional(),
});

export type SpecListQuery = z.infer<typeof SpecListQuerySchema>;

export const SpecSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
  name: z.string(),
  templateName: z.string(),
  version: z.number(),
  sectionCount: z.number(),
  language: z.string(),
  status: SpecStatusSchema,
  updatedAt: z.string(),
});

export type SpecDto = z.infer<typeof SpecSchema>;

export const SpecListResponseSchema = z.object({
  items: z.array(SpecSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type SpecListResponseDto = z.infer<typeof SpecListResponseSchema>;

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

export const SpecDetailRiskSchema = z.object({
  id: z.uuid(),
  sectionTitle: z.string(),
  riskType: RiskTypeSchema,
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  detail: z.string().optional(),
  referenceText: z.string().optional(),
});

export const SpecDetailVersionSchema = z.object({
  id: z.uuid(),
  version: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SpecDetailSchema = z.object({
  id: z.uuid(),
  versionId: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  status: SpecStatusSchema,
  language: LanguageSchema,
  version: z.number(),
  createdByName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  sections: z.array(SpecDetailSectionSchema),
  risks: z.array(SpecDetailRiskSchema),
  versions: z.array(SpecDetailVersionSchema),
});
