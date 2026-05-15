import { z } from "zod";

export const authUserSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    userName: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),
    emailVerified: z.boolean().optional(),
    createdAt: z.string().optional(),
  })
  .passthrough();

export const meResponseSchema = z.object({
  status: z.boolean(),
  user: authUserSchema,
});

export const authResponseSchema = z.object({
  status: z.boolean(),
  user: authUserSchema,
  message: z.string().optional(),
});

export const genericStatusSchema = z.object({
  status: z.boolean(),
  message: z.string().optional(),
});

export const signinPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupPayloadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotPasswordPayloadSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordPayloadSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export const verifyEmailPayloadSchema = z.object({
  token: z.string().min(1),
});
