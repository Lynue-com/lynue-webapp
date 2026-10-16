import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { signupSchema } from "../_utils";
import { getCanonicalUrl } from "@/shared/lib/canonical-url";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = signupSchema.parse(body);

    // 1. Create user in backend (data layer)
    const { ok, status, data } = await (async () => {
      const backendUrl = process.env.API_URL?.trim();
      if (!backendUrl) {
        return { ok: false, status: 503, data: { message: "Backend not configured" } };
      }
      const url = new URL(`${backendUrl}/api/auth/signup`);
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        signal: AbortSignal.timeout(15_000),
      });
      return { ok: response.ok, status: response.status, data: await response.json() };
    })();

    if (!ok) {
      return NextResponse.json(
        { status: false, message: (data as { message?: string }).message || "Failed to create account" },
        { status },
      );
    }

    // 2. Send verification email
    try {
      const { sendEmail } = await import("../../../../lib/email/server");
      const appUrl = getCanonicalUrl();
      await sendEmail({
        to: validated.email,
        template: "verification-email",
        templateProps: {
          firstName: validated.firstName,
          email: validated.email,
          verificationUrl: `${appUrl}/verify-email`,
        },
      });
    } catch (emailError) {
      console.error("[Auth Email] Failed to send verification email:", emailError);
    }

    return NextResponse.json({
      status: true,
      message: "Account created. Please check your email to verify.",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { status: false, message: "Validation failed" },
        { status: 400 },
      );
    }
    console.error("[Auth Email] Signup error:", error);
    return NextResponse.json(
      { status: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
