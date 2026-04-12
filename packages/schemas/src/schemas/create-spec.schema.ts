import { z } from "zod";

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

export const CreateSpecStep2Schema = z.object({
  templateId: z.string().min(1, { message: "Select a template." }),
  language: z.enum(["en", "th"]),
});

export type CreateSpecStep2Dto = z.infer<typeof CreateSpecStep2Schema>;
