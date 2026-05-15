"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, MessageCircle, BedDouble, Bath, Car, Maximize, CalendarDays, Building2, Layers } from "lucide-react";
import { getAmenityIcon, getFacilityIcon } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/model/types";

type Props = { listing: Listing };

function formatPrice(p: number | null | undefined, listType: "RENT" | "SELL") {
  const base = formatCurrency(p);
  if (base === "Price on request") return base;
  return listType === "RENT" ? `${base} / year` : base;
}

function SpecChip({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null | undefined }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
      <span className="text-zinc-500">{icon}</span>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-semibold text-zinc-900">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-base font-bold text-zinc-900 sm:text-lg">{children}</h2>;
}

type FeatureTag = { slug?: string; label?: string; name?: string };

export function ListingDetailBody({ listing }: Props) {
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
    <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
      {/* ── LEFT: main content ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Title + Price */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  listing.listType === "RENT" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {listing.listType === "RENT" ? "For Rent" : "For Sale"}
              </span>
              <h1 className="mt-2 text-xl font-bold text-zinc-900 sm:text-2xl lg:text-3xl">{listing.title}</h1>
              {(listing.city || listing.state) ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin size={14} />
                  {[address, listing.city, listing.state].filter(Boolean).join(", ")}
                </p>
              ) : null}
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-zinc-900">
                {formatPrice(listing.price, listing.listType)}
              </p>
              {listing.listType === "RENT" && listing.price ? (
                <p className="mt-0.5 text-xs text-zinc-400">
                  ≈ ₦{Math.round(listing.price / 12).toLocaleString("en-NG")} / month
                </p>
              ) : null}
            </div>
          </div>
        </div>

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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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

        {/* Map */}
        {latitude != null && longitude != null ? (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-4">
              <MapPin size={16} className="text-zinc-400" />
              <p className="text-sm font-semibold text-zinc-900">Location map</p>
            </div>
            <div className="relative h-64 w-full bg-zinc-100">
              <iframe
                title="Property location"
                src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`}
                className="h-full w-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* ── RIGHT: lister sidebar ── */}
      <div className="space-y-4 lg:sticky lg:top-24">
        {user?.id ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="mb-4 text-sm font-semibold text-zinc-700">Listed by</p>
            <div className="flex items-center gap-3">
              {user.profileImage ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                  <Image src={user.profileImage} alt="Lister" fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white">
                  {user.firstName?.[0] ?? "?"}{user.lastName?.[0] ?? ""}
                </div>
              )}
              <div>
                <p className="font-semibold text-zinc-900">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ") || "Lister"}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Link
                href={`/messages?userId=${user.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                <MessageCircle size={16} />
                Send Message
              </Link>
              <Link
                href={`/profile/${user.id}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                View Profile
              </Link>
              {user.phoneNumber ? (
                <a
                  href={`tel:${user.phoneNumber}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  <Phone size={16} />
                  Call Lister
                </a>
              ) : null}
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

        {/* Share */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-zinc-700">Share this listing</p>
          <div className="flex gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this property on Lynue: ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-center text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              WhatsApp
            </a>
            <button
              type="button"
              onClick={() => { if (typeof navigator !== "undefined") navigator.clipboard.writeText(window.location.href).catch(() => null); }}
              className="flex-1 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
