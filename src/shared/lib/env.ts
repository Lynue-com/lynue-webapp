import { z } from "zod";
import { siteConfig } from "@/shared/config/site";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || siteConfig.url;

// Warn when the deployed NEXT_PUBLIC_APP_URL diverges from the canonical site
// domain. Absolute URLs built from NEXT_PUBLIC_APP_URL (sitemap, robots,
// metadata, email links) would otherwise point at the wrong domain, causing
// Google Search Console "URL not allowed" errors. The canonical URL used by
// the app is always siteConfig.url.
if (
  process.env.NEXT_PUBLIC_APP_URL &&
  process.env.NEXT_PUBLIC_APP_URL.trim() !== siteConfig.url
) {
  console.warn(
    `[env] NEXT_PUBLIC_APP_URL (${process.env.NEXT_PUBLIC_APP_URL.trim()}) differs from siteConfig.url (${siteConfig.url}). Canonical URL (${siteConfig.url}) is used for all absolute URLs to prevent cross-domain SEO errors.`,
  );
}

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_APP_URL: rawAppUrl,
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`,
  );
}

export const env = parsed.data;
