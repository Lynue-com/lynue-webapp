import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/shared/lib/format";
import { Chip } from "@/shared/ui/chip";
import type { Listing } from "@/features/listings/model/types";

type ListingHeroProps = {
  listing: Listing;
};

export function ListingHero({ listing }: ListingHeroProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Chip label={listing.listType === "RENT" ? "For Rent" : "For Sale"} className="mb-3" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">{listing.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-zinc-600">
            <MapPin size={16} />
            {listing.city}, {listing.state}
          </p>
        </div>

        <p className="text-2xl font-black text-zinc-900 md:text-3xl">{formatCurrency(listing.price)}</p>
      </div>

      {listing.description ? (
        <p className="mt-6 max-w-4xl text-sm leading-7 text-zinc-700 md:text-base">{listing.description}</p>
      ) : null}

      {listing.user?.id ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/profile/${listing.user.id}`}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            View Lister Profile
          </Link>
          <Link
            href={`/messages?userId=${listing.user.id}`}
            className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Message Lister
          </Link>
        </div>
      ) : null}
    </section>
  );
}
