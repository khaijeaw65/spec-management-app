import { z } from "zod";

export const LanguageCodeSchema = z.enum(["EN", "TH"]);

export const LanguageSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
});

export type LanguageDto = z.infer<typeof LanguageSchema>;
