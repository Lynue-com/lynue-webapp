import { type NextRequest, NextResponse } from "next/server";

function getBackendUrl(): string {
  const backendUrl = process.env.API_URL?.trim();
  if (!backendUrl) {
    throw new Error("API_URL must be set for API proxying.");
  }

  const parsedUrl = new URL(backendUrl);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("API_URL must use HTTP or HTTPS.");
  }

  return parsedUrl.toString().replace(/\/+$/, "");
}

function getUrl(path: string, query: URLSearchParams) {
  const backendBase = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${backendBase}/api${normalizedPath}`);
  for (const [key, value] of query.entries()) {
    url.searchParams.set(key, value);
  }
  return url;
}

function sanitizeHeaders(headers: Headers) {
  const out = new Headers();
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "content-length" || lower === "transfer-encoding") {
      continue;
    }
    out.set(key, value);
  }
  return out;
}

function forwardResponseHeaders(response: Response) {
  const headers = new Headers();
  for (const [key, value] of response.headers.entries()) {
    const lower = key.toLowerCase();
    if (
      lower === "connection" ||
      lower === "content-encoding" ||
      lower === "content-length" ||
      lower === "set-cookie" ||
      lower === "transfer-encoding"
    ) {
      continue;
    }
    headers.append(key, value);
  }

  return headers;
}

function forwardCookies(response: Response, target: NextResponse) {
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    target.headers.append("set-cookie", cookie);
  }
}

async function proxyRequest(
  req: NextRequest,
  params: Promise<{ path: string[] }>,
  method: "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS",
) {
  try {
    const { path } = await params;
    const url = getUrl(path.join("/"), req.nextUrl.searchParams);
    const response = await fetch(url.toString(), {
      method,
      headers: sanitizeHeaders(req.headers),
      signal: AbortSignal.any([req.signal, AbortSignal.timeout(15_000)]),
      ...(method === "GET" || method === "HEAD" || method === "DELETE" || method === "OPTIONS"
        ? {}
        : { body: await req.arrayBuffer() }),
    });

    const proxiedResponse = new NextResponse(response.body, {
      status: response.status,
      headers: forwardResponseHeaders(response),
    });
    forwardCookies(response, proxiedResponse);
    return proxiedResponse;
  } catch (error) {
    console.error("API proxy request failed", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { status: false, message: "Backend service unavailable" },
      { status: 502 },
    );
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "GET");
}

export async function HEAD(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "HEAD");
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "POST");
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "PUT");
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "PATCH");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "DELETE");
}

export async function OPTIONS(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context.params, "OPTIONS");
}
