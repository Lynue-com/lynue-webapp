import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// =============================================================================
// BACKEND PROXIES
// =============================================================================

const backendUrl = process.env.API_URL?.trim();

if (!backendUrl) {
  console.error(`[Auth Email] API_URL is not configured`);
}

async function proxyToBackend(
  path: string,
  method: string,
  body: unknown,
): Promise<{ ok: boolean; status: number; data: unknown }> {
  if (!backendUrl) {
    return { ok: false, status: 503, data: { message: "Backend not configured" } };
  }

  try {
    const url = new URL(`${backendUrl}/api${path}`);
    const response = await fetch(url.toString(), {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });

    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error(`[Auth Email] Proxy to ${path} failed:`, error);
    return { ok: false, status: 502, data: { message: "Backend unavailable" } };
  }
}

// Validation schemas
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
