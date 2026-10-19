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

    // The backend also sends the fresh verification email (with the
    // tokenized link) — this route is only a same-origin proxy, so no
    // second email is sent from here.
    return NextResponse.json({
      status: true,
      message: "If the email exists and is unverified, a verification link has been sent. Check your inbox.",
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
