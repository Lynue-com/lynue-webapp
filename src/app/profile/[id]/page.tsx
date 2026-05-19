import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getUserListings, getUserProfile } from "@/features/profile/profile.server";
import { ListingCard } from "@/shared/ui/listing-card";
import { siteConfig } from "@/shared/config/site";

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await getUserProfile(id).catch(() => null);

  if (!user) {
    return { title: "Profile Not Found", robots: { index: false } };
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Property Lister";
  const title = `${name} — Property Lister | ${siteConfig.name}`;
  const description =
    (user as { description?: string }).description?.slice(0, 155) ??
    `View ${name}'s property listings on ${siteConfig.name}. Find verified rentals and properties for sale.`;
  const url = `${siteConfig.url}/profile/${id}`;
  const image = (user as { profileImage?: string }).profileImage;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      ...(image ? { images: [{ url: image, width: 400, height: 400 }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const [user, listings] = await Promise.all([
    getUserProfile(id).catch(() => null),
    getUserListings(id).catch(() => []),
  ]);

  if (!user) {
    return <div className="p-10 text-center text-zinc-600">User profile not found.</div>;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Property Lister";
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${siteConfig.url}/profile/${id}`,
    ...((user as { profileImage?: string }).profileImage ? { image: (user as { profileImage?: string }).profileImage } : {}),
    ...((user as { city?: string }).city || (user as { state?: string }).state
      ? {
          address: {
            "@type": "PostalAddress",
            ...((user as { city?: string }).city ? { addressLocality: (user as { city?: string }).city } : {}),
            ...((user as { state?: string }).state ? { addressRegion: (user as { state?: string }).state } : {}),
            addressCountry: "NG",
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100">
            {user.profileImage ? <Image src={user.profileImage} alt="User profile" fill className="object-cover" /> : null}
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-zinc-600">{user.profileTitle ?? "Property lister"}</p>
            <p className="text-sm text-zinc-500">
              {user.city ?? ""} {user.state ? `, ${user.state}` : ""}
            </p>
            <Link href={`/messages?userId=${user.id}`} className="mt-3 inline-block text-sm font-semibold text-[var(--brand)] hover:underline">
              Message this lister
            </Link>
          </div>
        </div>
        {user.description ? <p className="mt-4 text-sm leading-6 text-zinc-700">{user.description}</p> : null}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold text-zinc-900">Listings</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
