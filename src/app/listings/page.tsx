import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/shared/config/site";
import { ListingsExplorer } from "@/features/listings/components/listings-explorer";

export const metadata: Metadata = {
  title: "Browse Properties for Rent & Sale in Nigeria | Lynue",
  description:
    "Explore verified apartments, houses, and land for rent or sale across Lagos, Abuja, and all of Nigeria. Filter by price, location, and type.",
  alternates: { canonical: `${siteConfig.url}/listings` },
  openGraph: {
    title: "Browse Properties for Rent & Sale in Nigeria | Lynue",
    description: "Explore verified property listings across Nigeria.",
    url: `${siteConfig.url}/listings`,
  },
};

export default function ListingsPage() {
  return (
    <main className="mx-auto w-full px-4 pb-20 pt-4 md:px-6 lg:px-10">
      <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading listings…</div>}>
        <ListingsExplorer />
      </Suspense>
    </main>
  );
}
