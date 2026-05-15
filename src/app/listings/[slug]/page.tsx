import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getListingBySlug } from "@/features/listings/api/listings-api";
import { siteConfig } from "@/shared/config/site";
import { ListingImageGallery } from "@/shared/ui/listing-image-gallery";
import { ListingDetailBody } from "@/features/listings/components/listing-detail-body";

type ListingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug).catch(() => null);

  if (!listing) {
    return { title: "Listing Not Found", description: "This listing is no longer available.", robots: { index: false } };
  }

  const isRent = listing.listType === "RENT";
  const priceStr = listing.price ? `₦${listing.price.toLocaleString()}${isRent ? "/yr" : ""}` : "";
  const title = `${listing.title} in ${listing.city}, ${listing.state}${priceStr ? ` — ${priceStr}` : ""} | ${siteConfig.name}`;
  const description = listing.description?.slice(0, 155) ?? `${listing.title} — ${listing.city}, ${listing.state}. Browse photos, features, and more on Lynue.`;
  const url = `${siteConfig.url}/listings/${listing.slug}`;
  const image = listing.images[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug).catch(() => null);

  if (!listing) notFound();

  const isRent = listing.listType === "RENT";
  const typePath = isRent ? "rent" : "buy";
  const typeLabel = isRent ? "Rent" : "Buy";

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-900">Home</Link>
            <span>/</span>
            <Link href={`/${typePath}`} className="hover:text-zinc-900 capitalize">{typeLabel}</Link>
            <span>/</span>
            <Link href={`/listings?city=${encodeURIComponent(listing.city)}`} className="hover:text-zinc-900">{listing.city}</Link>
            <span>/</span>
            <span className="max-w-[200px] truncate text-zinc-700">{listing.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Image gallery */}
        <ListingImageGallery listingId={listing.id} title={listing.title} images={listing.images} />

        {/* Body: details + lister sidebar */}
        <ListingDetailBody listing={listing} />
      </div>
    </div>
  );
}
