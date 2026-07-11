import type { Metadata } from "next";
import { ListWizard } from "@/features/list-manage/components/list-wizard";
import { buildPageMetadata } from "@/shared/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "List Your Property | Lynue",
  description: "Create a free property listing on Lynue. Rent or sell in minutes and reach verified buyers and renters across Nigeria.",
  path: "/list",
  keywords: ["list property Nigeria", "publish listing", "rent or sell property"],
});

export default function ListPage() {
  return <ListWizard />;
}
