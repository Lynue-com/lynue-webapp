import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { resendVerificationSchema } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = resendVerificationSchema.parse(body);

    // 1. Notify backend to check if user exists
    const { ok, status, data } = await (async () => {
      const backendUrl = process.env.API_URL?.trim();
      if (!backendUrl) {
        return { ok: false, status: 503, data: { message: "Backend not configured" } };
      }
      const url = new URL(`${backendUrl}/api/auth/resend-verification`);
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
        { status: false, message: (data as { message?: string }).message || "Failed to resend email" },
        { status },
      );
    }

    // 2. Send verification email
    try {
      const { sendEmail } = await import("../../../../lib/email/server");
      const email = validated.email!;
      await sendEmail({
        to: email,
        template: "email-resend",
        templateProps: {
          firstName: email.split("@")[0]!,
          email,
          appName: process.env.NEXT_PUBLIC_APP_NAME || "Vamlar",
        },
      });
    } catch (emailError) {
      console.error("[Auth Email] Failed to send resend verification email:", emailError);
    }

    return NextResponse.json({
      status: true,
      message: "Verification email sent",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { status: false, message: "Validation failed" },
        { status: 400 },
      );
    }
    console.error("[Auth Email] Resend verification error:", error);
    return NextResponse.json(
      { status: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
