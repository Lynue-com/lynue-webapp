import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy | Lynue",
  description: "Learn how Lynue collects, uses, and protects your personal data. We are committed to transparent and secure data practices.",
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">Privacy Policy</h1>
      <p className="mt-3 text-zinc-700">We process data to provide secure account and listing services.</p>
    </div>
  );
}
