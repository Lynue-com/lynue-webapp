import type { MetadataRoute } from "next";
import { env } from "@/shared/lib/env";
import { serverFetch } from "@/shared/lib/http.server";

type SitemapEntry = {
  slug: string;
  updatedAt: string;
};

type SitemapResponse = {
  status: boolean;
  entries: SitemapEntry[];
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_APP_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${base}/listings`,       lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/rent`,           lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/buy`,            lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${base}/list`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/for-agents`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/for-buyers`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/for-listers`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/for-renters`,    lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/help`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/fair-housing-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms-of-services`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`,        lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  const data = await serverFetch<SitemapResponse>("/api/listings/sitemap", { cache: "force-cache" }).catch(
    () => null,
  );

  if (!data?.status) {
    return staticRoutes;
  }

  return [
    ...staticRoutes,
    ...data.entries.map((entry) => ({
      url: `${base}/listings/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
