import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/shared/lib/canonical-url";

export default function robots(): MetadataRoute.Robots {
  const base = getCanonicalUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    host: base,
    sitemap: [`${base}/sitemap.xml`],
  };
}
