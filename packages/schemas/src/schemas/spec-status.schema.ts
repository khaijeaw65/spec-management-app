import { z } from "zod";

export const SpecStatusCodeSchema = z.enum([
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "REVIEWED",
]);

export const SpecStatusSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
});

export type SpecStatusDto = z.infer<typeof SpecStatusSchema>;
