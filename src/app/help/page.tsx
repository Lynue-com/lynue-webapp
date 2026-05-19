import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Help Center | Lynue",
  description: "Get help with your Lynue account, listings, and transactions. Contact support for account, listing, and property transaction guidance.",
  alternates: { canonical: `${siteConfig.url}/help` },
};

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">Help Center</h1>
      <p className="mt-3 text-zinc-700">Contact support for account, listing, and transaction guidance.</p>
    </div>
  );
}
