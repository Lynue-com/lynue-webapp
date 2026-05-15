import { ListingCard } from "@/shared/ui/listing-card";
import { EmptyState } from "@/shared/ui/empty-state";
import type { Listing } from "@/features/listings/model/types";

type ListingsGridProps = {
  listings: Listing[];
  loading?: boolean;
};

export function ListingsGrid({ listings, loading }: ListingsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-80 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <EmptyState
        title="No listings found"
        description="Try a wider search range or remove some filters to get more results."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
