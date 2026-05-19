import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Cookie Policy | Lynue",
  description: "Learn how Lynue uses cookies for security, session management, and a better browsing experience.",
  alternates: { canonical: `${siteConfig.url}/cookies` },
};

export default function CookiesPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">Cookie Policy</h1>
      <p className="mt-3 text-zinc-700">Cookies are used for security, session continuity, and UX preferences.</p>
    </div>
  );
}
