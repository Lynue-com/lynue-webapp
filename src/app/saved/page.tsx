"use client";

import { useSavedListings } from "@/queries/use-saved";
import { ListingCard } from "@/shared/ui/listing-card";

export default function SavedPage() {
  const savedQuery = useSavedListings();
  const saved = savedQuery.data ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-zinc-900">Saved Listings</h1>
      <p className="mt-2 text-sm text-zinc-600">{saved.length} saved item(s)</p>

      {saved.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-600">
          No saved listings yet.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.filter((entry) => Boolean(entry.listing)).map((entry) => (
            <ListingCard key={entry.id} listing={entry.listing!} />
          ))}
        </div>
      )}
    </div>
  );
}
