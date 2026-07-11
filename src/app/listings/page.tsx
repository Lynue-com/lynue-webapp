import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingsExplorer } from "@/features/listings/components/listings-explorer";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Browse Properties for Rent & Sale in Nigeria | Lynue",
  description:
    "Explore verified apartments, houses, and land for rent or sale across Lagos, Abuja, and all of Nigeria. Filter by price, location, and type.",
  path: "/listings",
  keywords: ["property listings Nigeria", "rent and sale homes", "verified houses Nigeria"],
});

export default function ListingsPage() {
  return (
    <main className="mx-auto w-full px-4 pb-20 pt-4 md:px-6 lg:px-10">
      <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading listings…</div>}>
        <ListingsExplorer />
      </Suspense>
    </main>
  );
}
