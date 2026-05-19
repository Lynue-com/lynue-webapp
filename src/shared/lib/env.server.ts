import "server-only";
import { z } from "zod";

const schema = z.object({
  API_URL: z.string().url(),
});

type ServerEnv = z.infer<typeof schema>;

let _cached: ServerEnv | null = null;

function getEnv(): ServerEnv {
  if (_cached) return _cached;
  const parsed = schema.safeParse({ API_URL: process.env.API_URL });
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
