"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, MessageCircle, BedDouble, Bath, Car, Maximize, CalendarDays, Building2, Layers, ChevronDown } from "lucide-react";
import { getAmenityIcon, getFacilityIcon } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/format";
import { ListingImageGallery } from "@/shared/ui/listing-image-gallery";
import { ListingCard } from "@/shared/ui/listing-card";
import { getListings } from "@/features/listings/api/listings-api";
import { env } from "@/shared/lib/env";
import type { Listing } from "@/features/listings/model/types";

type Props = { listing: Listing };

function SpecChip({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
      <span className="shrink-0 text-zinc-400">{icon}</span>
      <span className="text-xs text-zinc-500">{label}:</span>
      <span className="text-xs font-semibold text-zinc-900">{value}</span>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-base font-bold text-zinc-900 sm:text-lg">{children}</h2>;
}

type FeatureTag = { slug?: string; label?: string; name?: string };

function PriceSparkline() {
  const pts = [0.58, 0.63, 0.60, 0.68, 0.66, 0.72, 0.75, 0.77, 0.82, 1.0];
  const W = 240;
  const H = 52;
  const pad = 3;
  const xs = pts.map((_, i) => pad + (i / (pts.length - 1)) * (W - pad * 2));
  const ys = pts.map((v) => pad + (1 - v) * (H - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i]!.toFixed(1)}`).join(" ");
  const area = `${d} L ${xs[xs.length - 1]!.toFixed(1)} ${H} L ${xs[0]!.toFixed(1)} ${H} Z`;
  return (
    <div className="mt-3 border-t border-zinc-100 pt-3">
      <p className="mb-1.5 text-xs text-zinc-400">Price trend (till date)</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" aria-hidden="true">
        <path d={area} fill="rgba(24,24,27,0.07)" />
        <path d={d} fill="none" stroke="#18181b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={xs[xs.length - 1]!.toFixed(1)} cy={ys[ys.length - 1]!.toFixed(1)} r="3.5" fill="#18181b" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-zinc-400">
        <span>Listed</span>
        <span>Today</span>
      </div>
    </div>
  );
}

const MAP_CATEGORIES = [
  { label: "Highlights", query: null },
  { label: "Groceries", query: "grocery store" },
  { label: "Schools", query: "school" },
  { label: "Restaurants", query: "restaurant" },
  { label: "Gas Station", query: "gas station" },
  { label: "Nightlife", query: "bar nightlife" },
  { label: "Fitness", query: "gym fitness" },
] as const;

export function ListingDetailBody({ listing }: Props) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [mapCategory, setMapCategory] = useState(0);

  const { data: similarData } = useQuery({
    queryKey: ["similar-listings", listing.id, listing.city, listing.listType],
    queryFn: () => getListings({ city: listing.city ?? undefined, type: listing.listType as "RENT" | "SELL", limit: 4 }),
    select: (data) => data.listings.filter((l) => l.id !== listing.id).slice(0, 3),
    staleTime: 5 * 60 * 1000,
  });

  // Extract passthrough fields that may be present from backend
  const raw = listing as Record<string, unknown>;

  const address = (raw.address as string | undefined) ?? "";
  const toilets = raw.toilets as number | null | undefined;
  const yearBuilt = raw.yearBuilt as number | null | undefined;
  const floorNumber = raw.floorNumber as number | null | undefined;
  const totalFloors = raw.totalFloors as number | null | undefined;
  const landSize = raw.landSize as number | null | undefined;
  const buildingSize = raw.buildingSize as number | null | undefined;
  const furnishing = raw.furnishing as string | null | undefined;
  const condition = raw.condition as string | null | undefined;
  const titleDocument = raw.titleDocument as string | null | undefined;
  const amenities = (raw.amenities as FeatureTag[] | null | undefined) ?? [];
  const facilities = (raw.facilities as FeatureTag[] | null | undefined) ?? [];
  const latitude = listing.latitude;
  const longitude = listing.longitude;
  const user = listing.user;
  const isRent = listing.listType === "RENT";

  const userRaw = raw.user as Record<string, unknown> | undefined;
  const roleLabel = userRaw?.role === "AGENT" ? "Agent" : userRaw?.role === "OWNER" ? "Owner" : null;

  const hasSpecs =
    listing.bedrooms != null ||
    listing.bathrooms != null ||
    toilets != null ||
    listing.parkingSpaces != null ||
    landSize != null ||
    buildingSize != null ||
    yearBuilt != null ||
    floorNumber != null;

  const hasFeatures = amenities.length > 0 || facilities.length > 0;

  const featureLabel = (f: FeatureTag) => f.label ?? f.name ?? f.slug ?? "";

  return (
    <div className="space-y-10">
    <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
      {/* ── LEFT: gallery + main content ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Image gallery */}
        <ListingImageGallery listingId={listing.id} title={listing.title} images={listing.images} />

        {/* Title + price + location + quick specs */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl lg:text-3xl">{listing.title}</h1>
            <p className="text-xl font-black text-zinc-900 sm:text-2xl">{formatCurrency(listing.price)}</p>
          </div>
          {(listing.city || listing.state) ? (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
              <MapPin size={14} />
              {[address, listing.city, listing.state].filter(Boolean).join(", ")}
            </p>
          ) : null}
          {(listing.bedrooms != null || listing.bathrooms != null) ? (
            <div className="mt-3 flex flex-wrap gap-5 text-sm text-zinc-700">
              {listing.bedrooms != null ? (
                <span className="flex items-center gap-1.5"><BedDouble size={16} className="text-zinc-400" /> {listing.bedrooms} Bed</span>
              ) : null}
              {listing.bathrooms != null ? (
                <span className="flex items-center gap-1.5"><Bath size={16} className="text-zinc-400" /> {listing.bathrooms} Bath</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* For Rent / For Sale badge */}
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            isRent ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isRent ? "For Rent" : "For Sale"}
        </span>

        {/* Description */}
        {listing.description ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <SectionHeading>About this property</SectionHeading>
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-700">{listing.description}</p>
          </div>
        ) : null}

        {/* Specs */}
        {hasSpecs ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <SectionHeading>Property specifications</SectionHeading>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              <SpecChip icon={<BedDouble size={16} />} label="Bedrooms" value={listing.bedrooms ?? null} />
              <SpecChip icon={<Bath size={16} />} label="Bathrooms" value={listing.bathrooms ?? null} />
              {toilets != null ? <SpecChip icon={<Bath size={16} />} label="Toilets" value={toilets} /> : null}
              <SpecChip icon={<Car size={16} />} label="Parking" value={listing.parkingSpaces ?? null} />
              {landSize != null ? <SpecChip icon={<Maximize size={16} />} label="Land size" value={`${landSize} sqm`} /> : null}
              {buildingSize != null ? <SpecChip icon={<Building2 size={16} />} label="Building size" value={`${buildingSize} sqm`} /> : null}
              {yearBuilt != null ? <SpecChip icon={<CalendarDays size={16} />} label="Year built" value={yearBuilt} /> : null}
              {floorNumber != null ? <SpecChip icon={<Layers size={16} />} label="Floor" value={totalFloors != null ? `${floorNumber} of ${totalFloors}` : floorNumber} /> : null}
            </div>

            {(furnishing || condition || titleDocument) ? (
              <div className="mt-4 grid grid-cols-1 gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-3">
                {furnishing ? (
                  <div>
                    <p className="text-xs text-zinc-400">Furnishing</p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-900">{furnishing.replace(/_/g, " ")}</p>
                  </div>
                ) : null}
                {condition ? (
                  <div>
                    <p className="text-xs text-zinc-400">Condition</p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-900">{condition.replace(/_/g, " ")}</p>
                  </div>
                ) : null}
                {titleDocument ? (
                  <div>
                    <p className="text-xs text-zinc-400">Title document</p>
                    <p className="mt-0.5 text-sm font-medium text-zinc-900">{titleDocument.replace(/_/g, " ")}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Features */}
        {hasFeatures ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
            <SectionHeading>Features & facilities</SectionHeading>
            {amenities.length > 0 ? (
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a) => {
                    const AmenityIcon = getAmenityIcon(a.slug ?? "");
                    return (
                      <span
                        key={a.slug ?? featureLabel(a)}
                        className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700"
                      >
                        <AmenityIcon size={12} className="text-emerald-500" />
                        {featureLabel(a)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}
            {facilities.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {facilities.map((f) => {
                    const FacilityIcon = getFacilityIcon(f.slug ?? "");
                    return (
                      <span
                        key={f.slug ?? featureLabel(f)}
                        className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700"
                      >
                        <FacilityIcon size={12} className="text-blue-500" />
                        {featureLabel(f)}
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Map — What's nearby */}
        {latitude != null && longitude != null ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {/* Tab strip */}
            <div className="scrollbar-none overflow-x-auto border-b border-zinc-100 px-4 py-3">
              <div className="flex gap-2">
                {MAP_CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setMapCategory(i)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      mapCategory === i
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-500 hover:bg-zinc-100"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Map iframe */}
            <div className="relative h-72 w-full bg-zinc-100">
              <iframe
                key={mapCategory}
                title={`Map — ${MAP_CATEGORIES[mapCategory]!.label}`}
                src={
                  env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    ? MAP_CATEGORIES[mapCategory]!.query
                      ? `https://www.google.com/maps/embed/v1/search?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(MAP_CATEGORIES[mapCategory]!.query + ` near ${latitude},${longitude}`)}`
                      : `https://www.google.com/maps/embed/v1/place?key=${env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=16`
                    : MAP_CATEGORIES[mapCategory]!.query
                      ? `https://maps.google.com/maps?q=${encodeURIComponent(MAP_CATEGORIES[mapCategory]!.query + ` near ${latitude},${longitude}`)}&z=15&output=embed`
                      : `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
                }
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Cover the “Open in Google Maps” link rendered by the embed */}
              <div className="pointer-events-none absolute left-0 top-0 h-9 w-44 bg-white" aria-hidden="true" />
            </div>
          </div>
        ) : null}
      </div>

      {/* ── RIGHT: sticky sidebar ── */}
      <div className="space-y-4 lg:sticky lg:top-24">
        {/* Price */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="flex w-full items-center justify-between gap-2"
          >
            <div className="text-left">
              <p className="text-xl font-black text-zinc-900">{formatCurrency(listing.price)}</p>
              {isRent ? <p className="text-xs text-zinc-400">per annum</p> : null}
            </div>
            <ChevronDown
              size={18}
              className={`text-zinc-400 transition-transform ${showBreakdown ? "rotate-180" : ""}`}
            />
          </button>
          {showBreakdown && listing.price ? (
            <div className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-600">
              {isRent ? (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Per month</span>
                    <span className="font-medium">₦{Math.round(listing.price / 12).toLocaleString("en-NG")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per quarter</span>
                    <span className="font-medium">₦{Math.round(listing.price / 4).toLocaleString("en-NG")}</span>
                  </div>
                </div>
              ) : null}
              <PriceSparkline />
            </div>
          ) : null}
        </div>

        {/* Lister card */}
        {user?.id ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Listed by</p>

            <div className="flex items-center gap-3">
              {user.profileImage ? (
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                  <Image src={user.profileImage} alt="Lister" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-600">
                  {user.firstName?.[0] ?? "?"}{user.lastName?.[0] ?? ""}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold uppercase text-zinc-900">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Lister"}
                </p>
                {roleLabel ? <p className="text-xs text-zinc-400">{roleLabel}</p> : null}
              </div>
              <Link
                href={`/messages?userId=${user.id}`}
                className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-zinc-700"
              >
                Chat
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              <Link
                href={`/profile/${user.id}`}
                className="flex w-full items-center justify-center rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
              >
                View Profile
              </Link>
              <Link
                href={`/messages?userId=${user.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                <MessageCircle size={16} />
                Send Message
              </Link>
              {user.phoneNumber ? (
                <a
                  href={`tel:${user.phoneNumber}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50"
                >
                  <Phone size={16} />
                  Call Seller
                </a>
              ) : null}
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-3 text-center">
              <button type="button" className="text-xs text-zinc-400 transition hover:text-zinc-600 hover:underline">
                Report this listing
              </button>
            </div>
          </div>
        ) : null}

        {/* Safety tips */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
          <p className="mb-2 text-sm font-semibold text-amber-800">Safety tips</p>
          <ul className="space-y-1.5 text-xs text-amber-700">
            <li>• Do not pay before physically inspecting the property</li>
            <li>• Verify the lister&apos;s identity before proceeding</li>
            <li>• Use official receipts and documentation</li>
            <li>• Report suspicious listings to Lynue support</li>
          </ul>
        </div>
      </div>
    </div>

    {/* Similar Listings */}
    {similarData && similarData.length > 0 ? (
      <div>
        <h2 className="mb-5 text-xl font-bold text-zinc-900">Similar Listings</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {similarData.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </div>
    ) : null}
    </div>
  );
}
