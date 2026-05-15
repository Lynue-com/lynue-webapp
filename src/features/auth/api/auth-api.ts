import { apiRequest } from "@/shared/lib/http";
import {
  authResponseSchema,
  forgotPasswordPayloadSchema,
  genericStatusSchema,
  meResponseSchema,
  resetPasswordPayloadSchema,
  signinPayloadSchema,
  signupPayloadSchema,
  verifyEmailPayloadSchema,
} from "@/features/auth/model/schemas";
import type {
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SigninPayload,
  SignupPayload,
  VerifyEmailPayload,
} from "@/features/auth/model/types";

export async function getMe() {
  const response = await apiRequest<unknown>("/api/users/me");
  return meResponseSchema.parse(response).user;
}

export async function signin(payload: SigninPayload) {
  const validated = signinPayloadSchema.parse(payload);
  const response = await apiRequest<unknown>("/api/auth/signin", {
    method: "POST",
    json: validated,
  });
  return authResponseSchema.parse(response).user;
}

export async function signup(payload: SignupPayload) {
  const validated = signupPayloadSchema.parse(payload);
  const response = await apiRequest<unknown>("/api/auth/signup", {
    method: "POST",
    json: validated,
  });
  return authResponseSchema.parse(response).user;
}

export async function logout() {
  const response = await apiRequest<unknown>("/api/auth/logout", { method: "POST" });
  return genericStatusSchema.parse(response);
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  const validated = forgotPasswordPayloadSchema.parse(payload);
  const response = await apiRequest<unknown>("/api/auth/forgot-password", {
    method: "POST",
    json: validated,
  });
  return genericStatusSchema.parse(response);
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const validated = resetPasswordPayloadSchema.parse(payload);
  const response = await apiRequest<unknown>("/api/auth/reset-password", {
    method: "POST",
    json: validated,
  });
  return genericStatusSchema.parse(response);
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  const validated = verifyEmailPayloadSchema.parse(payload);
  const response = await apiRequest<unknown>("/api/auth/verify-email", {
    method: "POST",
    json: validated,
  });
  return genericStatusSchema.parse(response);
}

export async function resendVerification(email: string) {
  const response = await apiRequest<unknown>("/api/auth/resend-verification", {
    method: "POST",
    json: { email },
  });
  return genericStatusSchema.parse(response);
}
