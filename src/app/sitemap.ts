import type { MetadataRoute } from "next";
import { env } from "@/shared/lib/env";
import { apiRequest } from "@/shared/lib/http";

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
  const urls: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/listings`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  const data = await apiRequest<SitemapResponse>("/api/listings/sitemap", { cache: "force-cache" }).catch(
    () => null,
  );

  if (!data?.status) {
    return urls;
  }

  return [
    ...urls,
    ...data.entries.map((entry) => ({
      url: `${base}/listings/${entry.slug}`,
      lastModified: new Date(entry.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
