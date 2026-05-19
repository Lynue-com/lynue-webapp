import { type NextRequest, NextResponse } from "next/server";

/**
 * Serves the IndexNow key verification file.
 * IndexNow (Bing, Yandex, etc.) fetches this URL to verify ownership
 * before accepting rapid-indexing submissions.
 *
 * Set INDEXNOW_KEY in your env — the backend uses the same value when
 * calling the IndexNow API.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const envKey = process.env.INDEXNOW_KEY;

  if (!envKey || key !== envKey) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(envKey, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
