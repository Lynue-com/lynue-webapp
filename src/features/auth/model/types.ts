import type { z } from "zod";
import type {
  authResponseSchema,
  authUserSchema,
  forgotPasswordPayloadSchema,
  resetPasswordPayloadSchema,
  signinPayloadSchema,
  signupPayloadSchema,
  verifyEmailPayloadSchema,
} from "@/features/auth/model/schemas";

export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type SigninPayload = z.infer<typeof signinPayloadSchema>;
export type SignupPayload = z.infer<typeof signupPayloadSchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordPayloadSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordPayloadSchema>;
export type VerifyEmailPayload = z.infer<typeof verifyEmailPayloadSchema>;
