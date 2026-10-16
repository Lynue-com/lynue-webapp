import "server-only";
import { type NextRequest, NextResponse } from "next/server";
import { verifyEmailSchema } from "../_utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = verifyEmailSchema.parse(body);

    // 1. Notify backend to verify email (data layer)
    const { ok, status, data } = await (async () => {
      const backendUrl = process.env.API_URL?.trim();
      if (!backendUrl) {
        return { ok: false, status: 503, data: { message: "Backend not configured" } };
      }
      const url = new URL(`${backendUrl}/api/auth/verify-email`);
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
        { status: false, message: (data as { message?: string }).message || "Verification failed" },
        { status },
      );
    }

    return NextResponse.json({
      status: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ZodError")) {
      return NextResponse.json(
        { status: false, message: "Validation failed" },
        { status: 400 },
      );
    }
    console.error("[Auth Email] Verify email error:", error);
    return NextResponse.json(
      { status: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}
