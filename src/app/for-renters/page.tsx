import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Find a Rental | Lynue",
  description: "Search verified rental listings across Nigeria with smart filters for price, location, bedrooms, and more. Find apartments, houses, and short-stay properties on Lynue.",
  alternates: { canonical: `${siteConfig.url}/for-renters` },
  openGraph: {
    title: "Find a Rental | Lynue",
    description: "Search verified rental listings across Nigeria with smart filters.",
    url: `${siteConfig.url}/for-renters`,
  },
};

export default function ForRentersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">For Renters</h1>
      <p className="mt-3 text-zinc-700">Search verified rental listings with filters designed for renters.</p>
    </div>
  );
}
