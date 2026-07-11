import { type NextRequest, NextResponse } from "next/server";

function getBackendUrl(): string {
  const backendUrl = process.env.API_URL?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!backendUrl) {
    throw new Error("API_URL or NEXT_PUBLIC_API_URL must be set for API proxying.");
  }
  return backendUrl.replace(/\/+$/, "");
}

function getUrl(path: string, query: URLSearchParams) {
  const backendBase = getBackendUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${backendBase}${normalizedPath}`);
  for (const [key, value] of query.entries()) {
    url.searchParams.set(key, value);
  }
  return url;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = getUrl(path.join("/"), req.nextUrl.searchParams);
  const response = await fetch(url.toString(), { headers: req.headers });
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = getUrl(path.join("/"), req.nextUrl.searchParams);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: req.headers,
    body: await req.arrayBuffer(),
  });
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = getUrl(path.join("/"), req.nextUrl.searchParams);
  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: req.headers,
    body: await req.arrayBuffer(),
  });
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const url = getUrl(path.join("/"), req.nextUrl.searchParams);
  const response = await fetch(url.toString(), {
    method: "DELETE",
    headers: req.headers,
  });
  const body = await response.arrayBuffer();
  return new NextResponse(body, {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  });
}
