import { siteConfig } from "@/shared/config/site";

/**
 * Returns the canonical base URL of the site (always `siteConfig.url`).
 *
 * This is the single source of truth for all absolute URL generation across
 * the codebase (sitemap, robots, metadata, email templates, auth routes).
 *
 * Rationale: `NEXT_PUBLIC_APP_URL` is a runtime deploy-time env var that can
 * be misconfigured (e.g. set to `https://lynue.com` while serving `vamlar.com`).
 * Using it directly causes cross-domain URLs that Google Search Console rejects
 * ("URL not allowed"). The canonical domain is always `siteConfig.url`.
 */
export function getCanonicalUrl(): string {
  return siteConfig.url;
}

/**
 * Builds a canonical absolute URL for a given path.
 *
 * e.g. `getCanonicalUrlWithPath("/verify-email")` => `"https://vamlar.com/verify-email"`
 *
 * @param path - Path to append, with or without a leading slash.
 */
export function getCanonicalUrlWithPath(path: string): string {
  const base = getCanonicalUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
