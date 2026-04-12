import { z } from "zod";

export const TemplateSectionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Section title is required" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "Description is required" }),
});

export const TemplateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Template name is required" }),
  language: z.enum(["en", "th"]),
  sections: z
    .array(TemplateSectionSchema)
    .min(1, { message: "At least one section is required" }),
});

export type TemplateSectionDto = z.infer<typeof TemplateSectionSchema>;
export type TemplateFormDto = z.infer<typeof TemplateFormSchema>;
