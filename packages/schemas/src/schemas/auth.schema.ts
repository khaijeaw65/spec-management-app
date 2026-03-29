import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

export type AuthUserDto = z.infer<typeof AuthUserSchema>;

export const LoginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: AuthUserSchema,
});

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;

export const RegisterSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
