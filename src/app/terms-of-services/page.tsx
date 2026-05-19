import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Terms of Service | Lynue",
  description: "Read Lynue's terms of service governing use of our property platform, listing standards, and user responsibilities.",
  alternates: { canonical: `${siteConfig.url}/terms-of-services` },
  robots: { index: true, follow: true },
};

export default function TermsOfServicesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">Terms of Services</h1>
      <p className="mt-3 text-zinc-700">Use of this platform is governed by our terms and listing standards.</p>
    </div>
  );
}
