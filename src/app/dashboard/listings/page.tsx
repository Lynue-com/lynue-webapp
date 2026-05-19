"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2, Upload, Plus } from "lucide-react";
import { useMyListings } from "@/queries/use-dashboard";
import { useDeleteListing, usePublishListing } from "@/queries/use-list-manage";
import { Button } from "@/shared/ui/button";
import { formatCurrency } from "@/shared/lib/format";

export default function DashboardListingsPage() {
  const listingsQuery = useMyListings();
  const deleteMutation = useDeleteListing();
  const publishMutation = usePublishListing();

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
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-t border-zinc-200 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-900">{listing.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{listing.city}, {listing.state}</p>
                  </td>
                  <td className="px-4 py-3">{listing.listType}</td>
                  <td className="px-4 py-3">{formatCurrency(listing.price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/list/${listing.id}/edit`}>
                        <Button size="sm" variant="secondary" className="gap-1">
                          <Pencil size={13} />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1"
                        onClick={() => {
                          publishMutation.mutate(listing.id, {
                            onSuccess: () => toast.success("Listing published"),
                            onError: (error) => toast.error(error.message || "Publish failed"),
                          });
                        }}
                      >
                        <Upload size={13} />
                        Publish
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-red-600 hover:text-red-700"
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="space-y-3 p-4 md:hidden">
            {listings.map((listing) => (
              <article key={listing.id} className="rounded-xl border border-zinc-200 p-4">
                <p className="font-semibold text-zinc-900">{listing.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{listing.city}, {listing.state}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
                  <span>{listing.listType}</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(listing.price)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/list/${listing.id}/edit`}>
                    <Button size="sm" variant="secondary">Edit</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      publishMutation.mutate(listing.id, {
                        onSuccess: () => toast.success("Listing published"),
                        onError: (error) => toast.error(error.message || "Publish failed"),
                      });
                    }}
                  >
                    Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600"
                    onClick={() => {
                      deleteMutation.mutate(listing.id, {
                        onSuccess: () => toast.success("Listing deleted"),
                        onError: (error) => toast.error(error.message || "Delete failed"),
                      });
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
