import "server-only";
import { z } from "zod";

const schema = z.object({
  API_URL: z.string().url(),
});

type ServerEnv = z.infer<typeof schema>;

let _cached: ServerEnv | null = null;

function resolveServerApiUrl(): string {
  const explicitApiUrl = process.env.API_URL?.trim();
  if (explicitApiUrl) return explicitApiUrl;

  const publicApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (publicApiUrl && /^https?:\/\//i.test(publicApiUrl)) {
    return publicApiUrl;
  }

  throw new Error("API_URL or NEXT_PUBLIC_API_URL must be provided for server-side requests.");
}

function getEnv(): ServerEnv {
  if (_cached) return _cached;

  const apiUrl = resolveServerApiUrl();
  const parsed = schema.safeParse({ API_URL: apiUrl });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`,
    );
  }

  _cached = parsed.data;
  return _cached;
}

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, key: string) {
    return getEnv()[key as keyof ServerEnv];
  },
});
