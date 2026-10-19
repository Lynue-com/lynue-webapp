import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = forgotPasswordSchema.parse(body);

    // 1. Notify backend to create reset token (data layer)
    const { ok, status, data } = await (async () => {
      const backendUrl = process.env.API_URL?.trim();
      if (!backendUrl) {
        return { ok: false, status: 503, data: { message: "Backend not configured" } };
      }
      const url = new URL(`${backendUrl}/api/auth/forgot-password`);
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
        { status: false, message: (data as { message?: string }).message || "Failed to process request" },
        { status },
      );
    }

    // The backend owns this flow end-to-end: it creates the reset token AND
    // sends the reset email with the tokenized link. The token must never
    // travel through an API response — possession of the emailed link is the
    // auth factor. This route is only a same-origin proxy; sending a second
    // email here previously produced a duplicate whose `?token=` was empty.
    // Always return success to prevent email enumeration
    return NextResponse.json({
      status: true,
      message: "If your email exists, a reset link has been sent. Check your inbox.",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { status: false, message: "Validation failed" },
        { status: 400 },
      );
    }
    console.error("[Auth Email] Forgot password error:", error);
    return NextResponse.json(
      { status: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
