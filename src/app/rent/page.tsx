import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingsExplorer } from "@/features/listings/components/listings-explorer";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Apartments & Houses for Rent in Nigeria | Lynue",
  description: "Find your next rental home in Nigeria. Browse verified apartments, houses, and studio flats in Lagos, Abuja, Port Harcourt, and more.",
  path: "/rent",
  keywords: ["apartments for rent Nigeria", "houses for rent", "rental homes Nigeria"],
});

export default function RentPage() {
  return (
    <div className="mx-auto w-full px-4 pb-20 md:px-6 lg:px-10">
      <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading listings…</div>}>
        <ListingsExplorer initialFilters={{ type: "RENT" }} />
      </Suspense>
    </div>
  );
}
