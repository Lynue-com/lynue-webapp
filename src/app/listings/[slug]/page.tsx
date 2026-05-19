import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getListingBySlug } from "@/features/listings/api/listings.server";
import { siteConfig } from "@/shared/config/site";
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
  const url = `${siteConfig.url}/listings/${listing.slug}`;

  // ── JSON-LD ───────────────────────────────────────────────────
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": `${url}#listing`,
        name: listing.title,
        description: listing.description ?? undefined,
        url,
        ...(listing.images.length > 0 ? { image: listing.images.map((i) => i.url) } : {}),
        ...(listing.createdAt ? { datePosted: listing.createdAt } : {}),
        address: {
          "@type": "PostalAddress",
          ...(listing.address ? { streetAddress: listing.address } : {}),
          addressLocality: listing.city,
          addressRegion: listing.state,
          addressCountry: "NG",
        },
        ...(listing.latitude != null && listing.longitude != null
          ? { geo: { "@type": "GeoCoordinates", latitude: listing.latitude, longitude: listing.longitude } }
          : {}),
        ...(listing.price != null
          ? {
              offers: {
                "@type": "Offer",
                price: listing.price,
                priceCurrency: "NGN",
                availability: "https://schema.org/InStock",
                ...(isRent ? { priceSpecification: { "@type": "UnitPriceSpecification", price: listing.price, priceCurrency: "NGN", unitText: "YEAR" } } : {}),
              },
            }
          : {}),
        ...(listing.bedrooms != null ? { numberOfRooms: listing.bedrooms } : {}),
        ...(listing.user
          ? {
              seller: {
                "@type": "RealEstateAgent",
                name: [listing.user.firstName, listing.user.lastName].filter(Boolean).join(" "),
                ...(listing.user.profileImage ? { image: listing.user.profileImage } : {}),
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: typeLabel, item: `${siteConfig.url}/${typePath}` },
          { "@type": "ListItem", position: 3, name: listing.state, item: `${siteConfig.url}/listings?state=${encodeURIComponent(listing.state)}` },
          { "@type": "ListItem", position: 4, name: listing.city, item: `${siteConfig.url}/listings?city=${encodeURIComponent(listing.city)}` },
          { "@type": "ListItem", position: 5, name: listing.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb + Back */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
            <Link href={`/${typePath}`} className="hover:text-zinc-900 capitalize">{typeLabel}</Link>
            <span className="text-zinc-300">›</span>
            <Link href={`/listings?state=${encodeURIComponent(listing.state)}`} className="hover:text-zinc-900">{listing.state}</Link>
            <span className="text-zinc-300">›</span>
            <Link href={`/listings?city=${encodeURIComponent(listing.city)}`} className="font-medium text-zinc-900">{listing.city}</Link>
          </nav>
          <Link href={`/${typePath}`} className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900">
            ← Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        {/* Gallery + details + lister sidebar */}
        <ListingDetailBody listing={listing} />
      </div>
    </div>
  );
}
