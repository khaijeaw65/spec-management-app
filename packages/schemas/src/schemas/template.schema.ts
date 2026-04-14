import { z } from "zod";

export const LanguageSchema = z.enum(["EN", "TH"]);

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  language: LanguageSchema,
  createdOn: z.date(),
  sectionCount: z.number(),
});
export type TemplateDto = z.infer<typeof TemplateSchema>;

export const TemplateListSchema = z.array(TemplateSchema);

export type TemplateLanguage = z.infer<typeof LanguageSchema>;

export const TemplateSectionSchema = z.object({
  title: z.string().trim().min(1, { message: "Section title is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  order: z.number().int().min(0, { message: "Order is required" }),
});

export type TemplateSectionDto = z.infer<typeof TemplateSectionSchema>;

export const TemplateDetailSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, { message: "Template name is required" }),
  description: z.string().trim(),
  language: LanguageSchema,
  sections: z
    .array(TemplateSectionSchema)
    .min(1, { message: "At least one section is required" }),
});

export type TemplateDetailDto = z.infer<typeof TemplateDetailSchema>;

export const CreateTemplateSchema = z.object({
  name: z.string().trim().min(1, { message: "Template name is required" }),
  description: z.string().trim(),
  language: LanguageSchema,
  sections: z
    .array(TemplateSectionSchema)
    .min(1, { message: "At least one section is required" }),
});

export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;

export const UpdateTemplateSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1, { message: "Template name is required" }),
  description: z.string().trim(),
  language: LanguageSchema,
  sections: z
    .array(TemplateSectionSchema)
    .min(1, { message: "At least one section is required" }),
});

export type UpdateTemplateDto = z.infer<typeof UpdateTemplateSchema>;
