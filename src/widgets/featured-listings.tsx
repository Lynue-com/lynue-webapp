"use client";

import Link from "next/link";
import { useState } from "react";
import type { Listing } from "@/features/listings/model/types";
import { ListingCard } from "@/shared/ui/listing-card";

type FeaturedListingsProps = {
  listings: Listing[];
};

export function FeaturedListings({ listings }: FeaturedListingsProps) {
  const [tab, setTab] = useState<"rent" | "buy">("rent");

  const filtered = listings
    .filter((l) => (tab === "rent" ? l.listType === "RENT" : l.listType === "SELL"))
    .slice(0, 6);

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className="py-14">
      <h2 className="mb-2 text-center text-2xl font-black text-zinc-900 md:text-3xl">New listings</h2>
      <p className="mb-8 text-center text-zinc-500">
        Explore new homes, office spaces, and apartment complexes
      </p>

      <div className="mb-8 flex justify-center">
        <div className="flex items-center rounded-full border border-zinc-200 p-1">
          <button
            type="button"
            onClick={() => setTab("rent")}
            className={`rounded-full px-7 py-2 text-sm font-semibold transition ${
              tab === "rent" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Rent
          </button>
          <button
            type="button"
            onClick={() => setTab("buy")}
            className={`rounded-full px-7 py-2 text-sm font-semibold transition ${
              tab === "buy" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Buy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 flex justify-center">
          <Link
            href={tab === "rent" ? "/rent" : "/buy"}
            className="rounded-full border border-zinc-900 px-8 py-3 text-sm font-semibold transition hover:bg-zinc-900 hover:text-white"
          >
            View all {tab === "rent" ? "rentals" : "properties for sale"}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
