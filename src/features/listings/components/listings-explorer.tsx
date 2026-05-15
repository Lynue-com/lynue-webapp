"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Grid3X3, List, Map as MapIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { ListingsFilters as FiltersType } from "@/features/listings/model/types";
import ListingFilters, {
  SortRow,
  MobileSortRow,
  type SortValue,
  type ViewMode,
} from "@/features/listings/components/listings-filters";
import { useListings } from "@/queries/use-listings";
import { ListingCard } from "@/shared/ui/listing-card";

const MapView = dynamic(
  () => import("@/shared/ui/map-view").then((m) => ({ default: m.MapView })),
  { ssr: false },
);

// ── Helpers ────────────────────────────────────────────────────────────────

function parseNumber(value: string | null) {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

// ── Component ──────────────────────────────────────────────────────────────

type ListingsExplorerProps = {
  initialFilters?: FiltersType;
};

export function ListingsExplorer({ initialFilters }: ListingsExplorerProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersType>(() => {
    const next: FiltersType = {
      page: parseNumber(searchParams.get("page")) ?? 1,
      limit: parseNumber(searchParams.get("limit")) ?? 20,
      sort: (searchParams.get("sort") as SortValue | null) ?? initialFilters?.sort ?? "newest",
    };

    const type =
      (searchParams.get("type") as "RENT" | "SELL" | null) ?? initialFilters?.type;
    const category =
      (searchParams.get("category") as
        | "RESIDENTIAL"
        | "COMMERCIAL"
        | "LAND"
        | "SHORT_STAY"
        | null) ?? initialFilters?.category;
    const condition = searchParams.get("condition") as
      | "NEW"
      | "FAIRLY_USED"
      | "OLD"
      | "UNDER_CONSTRUCTION"
      | null;
    const listAs = searchParams.get("listAs") as "OWNER" | "AGENT" | null;
    const furnishing = searchParams.get("furnishing") as
      | "FURNISHED"
      | "SEMI_FURNISHED"
      | "UNFURNISHED"
      | null;

    if (type) next.type = type;
    if (category) next.category = category;
    if (condition) next.condition = condition;
    if (listAs) next.listAs = listAs;
    if (furnishing) next.furnishing = furnishing;

    const q = searchParams.get("q") ?? initialFilters?.q;
    const city = searchParams.get("city") ?? initialFilters?.city;
    const state = searchParams.get("state") ?? initialFilters?.state;
    if (q) next.q = q;
    if (city) next.city = city;
    if (state) next.state = state;

    const minPrice =
      parseNumber(searchParams.get("minPrice")) ?? initialFilters?.minPrice;
    const maxPrice =
      parseNumber(searchParams.get("maxPrice")) ?? initialFilters?.maxPrice;
    const bedrooms =
      parseNumber(searchParams.get("bedrooms")) ?? initialFilters?.bedrooms;
    const bathrooms =
      parseNumber(searchParams.get("bathrooms")) ?? initialFilters?.bathrooms;
    const toilets =
      parseNumber(searchParams.get("toilets")) ?? initialFilters?.toilets;
    const minSize =
      parseNumber(searchParams.get("minSize")) ?? initialFilters?.minSize;
    const maxSize =
      parseNumber(searchParams.get("maxSize")) ?? initialFilters?.maxSize;

    if (minPrice !== undefined) next.minPrice = minPrice;
    if (maxPrice !== undefined) next.maxPrice = maxPrice;
    if (bedrooms !== undefined) next.bedrooms = bedrooms;
    if (bathrooms !== undefined) next.bathrooms = bathrooms;
    if (toilets !== undefined) next.toilets = toilets;
    if (minSize !== undefined) next.minSize = minSize;
    if (maxSize !== undefined) next.maxSize = maxSize;

    return next;
  });

  const listingsQuery = useListings(filters);

  // Sync filters → URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.sort && filters.sort !== "newest") params.set("sort", filters.sort);
    if (filters.type && filters.type !== initialFilters?.type) params.set("type", filters.type);
    if (filters.category) params.set("category", filters.category);
    if (filters.condition) params.set("condition", filters.condition);
    if (filters.listAs) params.set("listAs", filters.listAs);
    if (filters.furnishing) params.set("furnishing", filters.furnishing);
    if (filters.q) params.set("q", filters.q);
    if (filters.city) params.set("city", filters.city);
    if (filters.state) params.set("state", filters.state);
    if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
    if (filters.bedrooms !== undefined) params.set("bedrooms", String(filters.bedrooms));
    if (filters.bathrooms !== undefined) params.set("bathrooms", String(filters.bathrooms));
    if (filters.toilets !== undefined) params.set("toilets", String(filters.toilets));
    if (filters.minSize !== undefined) params.set("minSize", String(filters.minSize));
    if (filters.maxSize !== undefined) params.set("maxSize", String(filters.maxSize));

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, initialFilters, pathname, router]);

  const listings = listingsQuery.data?.listings ?? [];
  const pagination = listingsQuery.data?.pagination;
  const total = pagination?.total ?? listings.length;
  const sort = (filters.sort ?? "newest") as SortValue;

  function handleSortChange(value: SortValue) {
    setFilters((prev) => ({ ...prev, sort: value, page: 1 }));
  }

  function handleClearFilters() {
    const next: FiltersType = {
      page: 1,
      limit: filters.limit ?? 20,
      sort: "newest",
    };
    if (initialFilters?.type) next.type = initialFilters.type;
    setFilters(next);
  }

  return (
    <div>
      {/* Sticky: filter bar + sort/count/view row */}
      <div className="sticky top-15 lg:top-17.5 z-30 bg-white">
        <ListingFilters
          filters={filters}
          onChange={setFilters}
          {...(initialFilters?.type ? { lockType: initialFilters.type } : {})}
        />
        <div className="flex items-center justify-between border-t border-gray-100 py-2">
          {/* Desktop: sort + grid/list toggle */}
          <SortRow
            sort={sort}
            viewMode={viewMode}
            onSortChange={handleSortChange}
            onViewModeChange={setViewMode}
          />
          {/* Mobile: sort select */}
          <div className="md:hidden">
            <MobileSortRow sort={sort} onSortChange={handleSortChange} />
          </div>
          {/* Right: count + mobile view toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {total.toLocaleString()} home{total !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5 md:hidden">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "grid" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid3X3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "list" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "map" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <MapIcon size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {listingsQuery.isFetching && !listingsQuery.isLoading ? (
        <p className="mt-1 text-center text-xs text-gray-400">Updating…</p>
      ) : null}

      {/* Main content */}
      <div className="mt-3 flex gap-5">
        {/* Listings column */}
        <div className={`w-full lg:w-[55%] ${viewMode === "map" ? "hidden lg:block" : ""}`}>

          {/* Error */}
          {listingsQuery.isError ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <p className="text-sm font-medium text-red-500">Failed to load listings</p>
              <button
                type="button"
                onClick={() => listingsQuery.refetch()}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
              >
                Retry
              </button>
            </div>
          ) : listingsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-2 h-48 rounded-xl bg-gray-200" />
                  <div className="mb-2 h-3.5 w-3/4 rounded bg-gray-200" />
                  <div className="mb-1.5 h-3 w-1/3 rounded bg-gray-200" />
                  <div className="flex gap-3">
                    <div className="h-3 w-10 rounded bg-gray-200" />
                    <div className="h-3 w-10 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <p className="text-lg font-medium text-gray-600">No listings found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or search terms.</p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-2 rounded-full border border-gray-300 px-5 py-2 text-sm hover:bg-gray-50"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-4 md:gap-5"
                  : "grid grid-cols-1 gap-4"
              }
            >
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onMouseEnter={() => setHoveredId(listing.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <ListingCard
                    listing={listing}
                    variant={viewMode === "list" ? "compact" : "default"}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-2 pb-8">
              <button
                type="button"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() =>
                  setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))
                }
                className="rounded-full border p-2 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              {generatePageNumbers(pagination.page, pagination.totalPages).map((pg, i) =>
                pg === "..." ? (
                  <span key={`dot-${i}`} className="px-2 text-gray-400">
                    …
                  </span>
                ) : (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setFilters((p) => ({ ...p, page: pg as number }))}
                    className={`min-w-10 rounded-full px-3 py-2 text-sm ${
                      pg === pagination.page
                        ? "bg-black text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {pg}
                  </button>
                ),
              )}

              <button
                type="button"
                disabled={(filters.page ?? 1) >= pagination.totalPages}
                onClick={() =>
                  setFilters((p) => ({
                    ...p,
                    page: Math.min(pagination.totalPages, (p.page ?? 1) + 1),
                  }))
                }
                className="rounded-full border p-2 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </div>

        {/* Map column — always visible on desktop, toggled on mobile */}
        <div
          className={`${viewMode === "map" ? "block" : "hidden"} w-full lg:block lg:w-[45%]`}
        >
          <div className="sticky top-40 h-[calc(100vh-180px)] overflow-hidden rounded-2xl bg-gray-100">
            <MapView listings={listings} hoveredListingId={hoveredId} />
          </div>
        </div>
      </div>

    </div>
  );
}
