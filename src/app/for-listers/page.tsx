import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "List Your Property | Lynue",
  description: "Create and publish property listings on Lynue in minutes. Reach verified buyers and renters across Nigeria. Free to list — backend-first workflows for listers.",
  alternates: { canonical: `${siteConfig.url}/for-listers` },
  openGraph: {
    title: "List Your Property | Lynue",
    description: "Create and publish property listings on Lynue in minutes.",
    url: `${siteConfig.url}/for-listers`,
  },
};

export default function ForListersPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">For Listers</h1>
      <p className="mt-3 text-zinc-700">Create, manage, and publish listings with backend-first workflows.</p>
    </div>
  );
}
