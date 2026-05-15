import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/shared/config/site";
import { ListingsExplorer } from "@/features/listings/components/listings-explorer";

export const metadata: Metadata = {
  title: "Houses & Land for Sale in Nigeria | Lynue",
  description:
    "Buy your dream home or investment property in Nigeria. Browse houses, duplexes, and land for sale in Lagos, Abuja, and across the country.",
  alternates: { canonical: `${siteConfig.url}/buy` },
  openGraph: {
    title: "Houses & Land for Sale in Nigeria | Lynue",
    description: "Buy your dream home or investment property in Nigeria.",
    url: `${siteConfig.url}/buy`,
  },
};

export default function BuyPage() {
  return (
    <div className="mx-auto w-full px-4 pb-20 md:px-6 lg:px-10">
      <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading listings…</div>}>
        <ListingsExplorer initialFilters={{ type: "SELL" }} />
      </Suspense>
    </div>
  );
}
