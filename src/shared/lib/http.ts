import "client-only";

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;

type RequestOptions = Omit<RequestInit, "body"> & {
  query?: Record<string, QueryValue>;
  json?: unknown;
  body?: BodyInit | null;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  if (!query) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export { ApiError } from "./api-error";
import { ApiError } from "./api-error";

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, json, body, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");

  const init: RequestInit = {
    ...rest,
    headers: requestHeaders,
    cache: rest.cache ?? "no-store",
    credentials: "include",
  };

  if (json !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    init.body = JSON.stringify(json);
  } else if (body !== undefined) {
    init.body = body;
  }

  const response = await fetch(buildUrl(path, query), init);

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String(payload.message)
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
