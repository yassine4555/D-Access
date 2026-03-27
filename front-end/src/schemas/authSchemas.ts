import { z } from 'zod';

export const authUserSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  profile: z.record(z.string(), z.unknown()).optional(),
});

export const authTokenPayloadSchema = z.object({
  access_token: z.string().min(1),
  user: authUserSchema,
});

export const authMessageResponseSchema = z.object({
  message: z.string(),
});

export type AuthUserPayload = z.infer<typeof authUserSchema>;
export type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;
