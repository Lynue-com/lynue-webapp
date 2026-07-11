import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
  keywords,
}: PageMetadataOptions): Metadata {
  const canonical = new URL(path, siteConfig.url).toString();

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type,
      ...(image
        ? {
            images: [{ url: image, width: 1200, height: 630, alt: title }],
          }
        : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}
