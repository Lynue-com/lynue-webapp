import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "For Buyers | Lynue",
  description: "Find and compare properties for sale across Nigeria. Browse verified listings, filter by price and location, and buy your dream home with confidence on Lynue.",
  alternates: { canonical: `${siteConfig.url}/for-buyers` },
  openGraph: {
    title: "For Buyers | Lynue",
    description: "Find and compare properties for sale across Nigeria.",
    url: `${siteConfig.url}/for-buyers`,
  },
};

export default function ForBuyersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">For Buyers</h1>
      <p className="mt-3 text-zinc-700">Compare sale listings, pricing, and locations with confidence.</p>
    </div>
  );
}
