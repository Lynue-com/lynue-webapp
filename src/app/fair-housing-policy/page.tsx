import type { Metadata } from "next";
import { siteConfig } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Fair Housing Policy | Lynue",
  description: "Lynue is committed to fair housing and non-discrimination. Read our policy supporting equal access to property listings for all Nigerians.",
  alternates: { canonical: `${siteConfig.url}/fair-housing-policy` },
};

export default function FairHousingPolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">Fair Housing Policy</h1>
      <p className="mt-3 text-zinc-700">Lynue supports equal housing access and non-discriminatory listing standards.</p>
    </div>
  );
}
