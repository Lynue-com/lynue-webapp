import "server-only";
import { z } from "zod";

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export {
  signupSchema,
  forgotPasswordSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  resendVerificationSchema,
};
