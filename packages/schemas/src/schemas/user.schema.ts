import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  password: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const UpdateUserSchema = z.object({
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
