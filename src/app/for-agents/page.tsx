import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "For Agents | Lynue",
  description: "Scale your real estate business with Lynue's agent tools. Manage inventory, respond to leads, and reach thousands of verified buyers and renters across Nigeria.",
  alternates: { canonical: `${siteConfig.url}/for-agents` },
  openGraph: {
    title: "For Agents | Lynue",
    description: "Scale your real estate business with Lynue's agent tools.",
    url: `${siteConfig.url}/for-agents`,
  },
};

export default function ForAgentsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">For Agents</h1>
      <p className="mt-3 text-zinc-700">Scale inventory management and client response using your dashboard tools.</p>
    </div>
  );
}
