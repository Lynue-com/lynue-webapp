import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/shared/config/site";
import { ListingsExplorer } from "@/features/listings/components/listings-explorer";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Houses & Land for Sale in Nigeria | Lynue",
  description:
    "Buy your dream home or investment property in Nigeria. Browse houses, duplexes, and land for sale in Lagos, Abuja, and across the country.",
  path: "/buy",
  keywords: ["houses for sale in Nigeria", "land for sale", "buy property Nigeria"],
});

export default function BuyPage() {
  return (
    <div className="mx-auto w-full px-4 pb-20 md:px-6 lg:px-10">
      <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading listings…</div>}>
        <ListingsExplorer initialFilters={{ type: "SELL" }} />
      </Suspense>
    </div>
  );
}
