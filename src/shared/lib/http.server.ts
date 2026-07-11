import "server-only";
import { cookies } from "next/headers";
import { serverEnv } from "./env.server";

export class ApiError extends Error {
  public readonly status: number;
  public constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryValue = string | number | boolean | null | undefined;
type RequestOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, QueryValue>;
  json?: unknown;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!normalizedPath.startsWith("/api")) {
    normalizedPath = `/api${normalizedPath}`;
  }

  const url = new URL(normalizedPath, "http://localhost");
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return `${url.pathname}${url.search}`;
}

export async function serverFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, json, headers, ...rest } = options;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  const requestHeaders = new Headers(headers as HeadersInit | undefined);
  requestHeaders.set("Accept", "application/json");
  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const init: RequestInit = { ...rest, headers: requestHeaders };
  // Default to no-store for dynamic pages; pass next: { revalidate } for ISR.
  if (!init.cache && !(init as { next?: unknown }).next) {
    init.cache = "no-store";
  }

  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    init.body = JSON.stringify(json);
  }

  const response = await fetch(buildUrl(path, query), init);

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "message" in payload
        ? String((payload as { message: unknown }).message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
