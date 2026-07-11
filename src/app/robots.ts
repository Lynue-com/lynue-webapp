import type { MetadataRoute } from "next";
import { env } from "@/shared/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    host: env.NEXT_PUBLIC_APP_URL,
    sitemap: [`${env.NEXT_PUBLIC_APP_URL}/sitemap.xml`],
  };
}
