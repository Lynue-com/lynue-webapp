"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Upload, Plus, ArrowLeftRight } from "lucide-react";
import { useMyListings } from "@/queries/use-dashboard";
import { useDeleteListing, usePublishListing, useUnpublishListing } from "@/queries/use-list-manage";
import { Button } from "@/shared/ui/button";
import { ListingCard } from "@/shared/ui/listing-card";

export default function DashboardListingsPage() {
  const listingsQuery = useMyListings();
  const deleteMutation = useDeleteListing();
  const publishMutation = usePublishListing();
  const unpublishMutation = useUnpublishListing();

  const listings = listingsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-zinc-900">Manage Listings</h1>
          <p className="mt-1 text-sm text-zinc-500">Edit, publish, or remove listings from your portfolio.</p>
        </div>
        <Link href="/list">
          <Button className="gap-2 rounded-full">
            <Plus size={14} />
            New Listing
          </Button>
        </Link>
      </div>

      {listingsQuery.isLoading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 shadow-sm">Loading listings...</div>
      ) : null}

      {listings.length === 0 && !listingsQuery.isLoading ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-zinc-500">No listings found.</p>
          <Link href="/list" className="mt-4 inline-flex text-sm font-medium text-zinc-900 hover:underline">
            Create your first listing
          </Link>
        </div>
      ) : null}

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => {
            const isPublished = listing.status === "PUBLISHED";

            return (
              <div key={listing.id} className="space-y-3">
                <ListingCard listing={listing} />
                <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <Link href={`/list/${listing.id}/edit`}>
                    <Button size="sm" variant="secondary" className="gap-1 w-full justify-center">
                      <Pencil size={13} />
                      Edit
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1 w-full justify-center"
                    onClick={() => {
                      const callback = isPublished
                        ? unpublishMutation.mutate
                        : publishMutation.mutate;

                      callback(listing.id, {
                        onSuccess: () =>
                          toast.success(isPublished ? "Listing unpublished" : "Listing published"),
                        onError: (error) =>
                          toast.error(
                            error.message || (isPublished ? "Unpublish failed" : "Publish failed"),
                          ),
                      });
                    }}
                  >
                    {isPublished ? <ArrowLeftRight size={13} /> : <Upload size={13} />}
                    {isPublished ? "Unpublish" : "Publish"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 w-full justify-center text-red-600 hover:text-red-700"
                    onClick={() => {
                      deleteMutation.mutate(listing.id, {
                        onSuccess: () => toast.success("Listing deleted"),
                        onError: (error) => toast.error(error.message || "Delete failed"),
                      });
                    }}
                  >
                    <Trash2 size={13} />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
