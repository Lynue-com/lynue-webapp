import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/shared/config/site";
import { ListingsExplorer } from "@/features/listings/components/listings-explorer";

export const metadata: Metadata = {
  title: "Apartments & Houses for Rent in Nigeria | Lynue",
  description: "Find your next rental home in Nigeria. Browse verified apartments, houses, and studio flats in Lagos, Abuja, Port Harcourt, and more.",
  alternates: { canonical: `${siteConfig.url}/rent` },
  openGraph: {
    title: "Apartments & Houses for Rent in Nigeria | Lynue",
    description: "Find your next rental home in Nigeria. Browse verified apartments, houses, and studio flats in Lagos, Abuja, Port Harcourt, and more.",
    url: `${siteConfig.url}/rent`,
  },
};

export default function RentPage() {
  return (
    <div className="mx-auto w-full px-4 pb-20 md:px-6 lg:px-10">
      <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading listings…</div>}>
        <ListingsExplorer initialFilters={{ type: "RENT" }} />
      </Suspense>
    </div>
  );
}
