import type { NextConfig } from "next";
import { siteConfig } from "./src/shared/config/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/proxy/:path*",
      },
    ];
  },
};

// Build-time validation: in production, NEXT_PUBLIC_APP_URL must match the
// canonical site domain. A mismatch causes cross-domain URLs in the sitemap,
// robots, metadata, and emails, which Google Search Console rejects.
if (process.env.NODE_ENV === "production") {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredAppUrl && configuredAppUrl !== siteConfig.url) {
    throw new Error(
      `[next.config] Production build blocked: NEXT_PUBLIC_APP_URL (${configuredAppUrl}) does not match siteConfig.url (${siteConfig.url}). Set NEXT_PUBLIC_APP_URL=${siteConfig.url} to prevent cross-domain SEO errors.`,
    );
  }
}

export default nextConfig;
