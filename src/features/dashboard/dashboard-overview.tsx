"use client";

import Link from "next/link";
import { ArrowRight, Plus, Wallet, House, Building2 } from "lucide-react";
import { useMyListings } from "@/queries/use-dashboard";
import { useMe } from "@/queries/use-auth";
import { compactNumber } from "@/shared/lib/format";
import { Button } from "@/shared/ui/button";
import { ListingCard } from "@/shared/ui/listing-card";

export function DashboardOverview() {
  const userQuery = useMe();
  const myListingsQuery = useMyListings();

  const listings = myListingsQuery.data ?? [];
  const rentCount = listings.filter((listing) => listing.listType === "RENT").length;
  const sellCount = listings.filter((listing) => listing.listType === "SELL").length;
  const welcomeName = userQuery.data?.firstName ? `${userQuery.data.firstName}` : "there";

  return (
    <div className="space-y-7">
      <header className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#FFE380]/45 blur-2xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-20 w-full bg-gradient-to-r from-zinc-900/[0.03] via-zinc-900/[0.01] to-transparent" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 sm:text-4xl">Welcome back, {welcomeName}</h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 sm:text-base">
          Track your listings, publish quickly, and keep your property pipeline moving.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/list/new">
            <Button className="gap-2 rounded-full px-5">
              <Plus size={15} />
              Create Listing
            </Button>
          </Link>
          <Link
            href="/dashboard/listings"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Manage Listings
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Total Listings</p>
            <Wallet size={16} className="text-zinc-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-zinc-900">{compactNumber(listings.length)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Rent Listings</p>
            <House size={16} className="text-zinc-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-zinc-900">{compactNumber(rentCount)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sell Listings</p>
            <Building2 size={16} className="text-zinc-400" />
          </div>
          <p className="mt-2 text-3xl font-black text-zinc-900">{compactNumber(sellCount)}</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-zinc-900">Recent Listings</h2>
          <Link href="/dashboard/listings" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
            View all
          </Link>
        </div>
        {myListingsQuery.isLoading ? (
          <p className="text-sm text-zinc-600">Loading listings...</p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-zinc-600">
            You have not created any listings yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {listings.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
