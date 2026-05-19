import "server-only";
import { z } from "zod";

const schema = z.object({
  API_URL: z.string().url(),
});

const parsed = schema.safeParse({
  API_URL: process.env.API_URL,
});

if (!parsed.success) {
  throw new Error(
    `Invalid server environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`,
  );
}

export const serverEnv = parsed.data;
