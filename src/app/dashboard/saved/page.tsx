"use client";

import { useSavedListings } from "@/queries/use-saved";
import { ListingCard } from "@/shared/ui/listing-card";

export default function SavedPage() {
  const savedQuery = useSavedListings();
  const saved = savedQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900">Saved Listings</h1>
        <p className="mt-1 text-sm text-zinc-500">{saved.length} saved item(s)</p>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
          No saved listings yet. Browse listings and tap the bookmark icon to save them here.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {saved.filter((entry) => Boolean(entry.listing)).map((entry) => (
            <ListingCard key={entry.id} listing={entry.listing!} />
          ))}
        </div>
      )}
    </div>
  );
}
