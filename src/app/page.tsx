import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";
import { HeroSearch } from "@/widgets/hero-search";
import { FeaturedListings } from "@/widgets/featured-listings";
import type { Listing } from "@/features/listings/model/types";
import { serverFetch } from "@/shared/lib/http.server";

export const metadata: Metadata = {
  title: `${siteConfig.name}|Find Properties in Nigeria`,
  description:
    "Search thousands of verified apartments, houses, and land listings for rent or sale across Lagos, Abuja, and all of Nigeria. List your property for free.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteConfig.name}|Find Properties in Nigeria`,
    description: "Search verified property listings across Nigeria.",
    url: siteConfig.url,
  },
};

type ServiceWidgetProps = {
  imageSrc: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
};

function ServiceWidget({ imageSrc, title, description, href, linkLabel }: ServiceWidgetProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="relative mb-4 h-16 w-16">
        <Image src={imageSrc} alt={title} fill className="object-contain" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mb-4 text-center text-xs leading-5 text-zinc-500">{description}</p>
      <Link
        href={href}
        className="rounded-full bg-zinc-900 px-6 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

async function fetchFeatured(type: "RENT" | "SELL"): Promise<Listing[]> {
  const data = await serverFetch<{ listings?: Listing[] }>("/api/listings", {
    query: { type, limit: 6, sort: "newest" },
    next: { revalidate: 60 },
  }).catch(() => null);
  return data?.listings ?? [];
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: "Nigeria's modern property platform for rent and sale.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteConfig.url}/listings?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      url: siteConfig.url,
      sameAs: [`https://twitter.com/${siteConfig.twitterHandle.replace("@", "")}`],
    },
  ],
};

export default async function HomePage() {
  const [rentListings, sellListings] = await Promise.all([
    fetchFeatured("RENT"),
    fetchFeatured("SELL"),
  ]);
  const allListings = [...rentListings, ...sellListings];

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Hero */}
      <div className="relative mx-4 mb-10 h-[85vh] min-h-130 overflow-hidden rounded-3xl sm:mx-6 md:rounded-4xl lg:mx-8">
        <Image
          src="https://storage.googleapis.com/lynue-public-assets/Lynue.com_Homepage_Image.avif"
          alt="Modern property listings in Nigeria – Lynue"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/35" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="mb-3 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Find your <span className="text-[#FFE380]">dream home</span>
          </h1>
          <p className="mx-auto mb-10 mt-4 max-w-md text-base text-zinc-200">
            Escape the ordinary. Dive into personalized homes tailored to your every desire.
          </p>
          <HeroSearch />
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Services section */}
        <section className="py-14">
          <h2 className="mb-3 text-center text-2xl font-black text-zinc-900 md:text-3xl">
            Search homes to rent, buy or list for sale
          </h2>
          <p className="mb-10 text-center text-zinc-500">
            Nigeria&apos;s most complete property platform
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <ServiceWidget
              imageSrc="https://storage.googleapis.com/lynue-public-assets/RENT_RBS.svg"
              title="Rent a home"
              description="Find a rental that lets you personalize your space and express yourself."
              href="/listings?type=RENT"
              linkLabel="Rent"
            />
            <ServiceWidget
              imageSrc="https://storage.googleapis.com/lynue-public-assets/BUY%20RBS.svg"
              title="Buy a home"
              description="With 1 million+ listings we can match you with your perfect home."
              href="/listings?type=SELL"
              linkLabel="Buy"
            />
            <ServiceWidget
              imageSrc="https://storage.googleapis.com/lynue-public-assets/Sell_RBS.svg"
              title="List your property"
              description="Create a listing and reach thousands of verified buyers and renters."
              href="/list"
              linkLabel="List now"
            />
          </div>
        </section>

        {/* Featured listings */}
        <FeaturedListings listings={allListings} />
      </main>
    </div>
  );
}
