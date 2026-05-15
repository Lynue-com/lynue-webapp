"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  ShowerHead,
  Car,
} from "lucide-react";
import { formatCurrency } from "@/shared/lib/format";
import type { Listing } from "@/features/listings/model/types";
import { SaveButton } from "@/shared/ui/save-button";

type ListingCardProps = {
  listing: Listing;
  variant?: "default" | "compact";
};

export function ListingCard({ listing, variant = "default" }: ListingCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = listing.images ?? [];
  const hasMultipleImages = images.length > 1;

  const imageContainerStyle = useMemo(
    () => ({
      width: `${images.length * 100}%`,
      transform: `translateX(-${(currentIndex / images.length) * 100}%)`,
      transition: "transform 0.5s ease-in-out",
    }),
    [images.length, currentIndex],
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length],
  );

  const price = Number(listing.price) || 0;

  return (
    <article className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Image Section */}
      <div
        className={`relative w-full overflow-hidden ${variant === "compact" ? "h-45" : "h-50 md:h-55"}`}
      >
        <div className="flex h-full" style={imageContainerStyle}>
          {images.length > 0 ? (
            images.map((img, i) => (
              <div
                key={img.id ?? i}
                className="relative h-full shrink-0"
                style={{ width: `${100 / images.length}%` }}
              >
                <Image
                  src={img.url}
                  alt={`${listing.title}${listing.city ? ` in ${listing.city}` : ""}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            ))
          ) : (
            <div className="relative h-full w-full shrink-0 bg-zinc-100" />
          )}
        </div>

        {/* Save Button */}
        <div className="absolute right-3 top-3 z-10">
          <SaveButton
            listingId={listing.id}
            className="rounded-full bg-white p-2 shadow-md transition-all duration-200 hover:bg-gray-100 hover:shadow-lg md:p-3"
          />
        </div>

        {/* Type Badge */}
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold text-white ${
            listing.listType === "RENT" ? "bg-emerald-600" : "bg-blue-600"
          }`}
        >
          {listing.listType === "RENT" ? "Rent" : "Buy"}
        </span>

        {/* Navigation Buttons */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-[45%] rounded-full bg-black/20 p-1 transition-colors hover:bg-black/40"
            >
              <ChevronRight size={28} className="text-white" />
            </button>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-[45%] rounded-full bg-black/20 p-1 transition-colors hover:bg-black/40"
            >
              <ChevronLeft size={28} className="text-white" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-1 left-0 right-0 flex h-6 items-center justify-center">
            <div className="flex items-center space-x-2">
              {images.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                    currentIndex === i ? "bg-white" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Listing Details */}
      <Link href={`/listings/${listing.slug}`} className="block p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="truncate text-sm font-bold">{listing.title}</h4>
          <p className="shrink-0 text-sm font-bold">
            {formatCurrency(price)}
            {listing.priceUnit && (
              <span className="text-xs font-normal text-gray-500">
                /{listing.priceUnit.toLowerCase()}
              </span>
            )}
          </p>
        </div>

        {/* Property stats – single scrollable row */}
        <div className="mt-1 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {listing.bedrooms != null && (
            <span className="flex shrink-0 items-center gap-1">
              <Bed size={14} className="text-slate-600" />
              <small className="text-[.75rem]">{listing.bedrooms} Bed</small>
            </span>
          )}
          {listing.bathrooms != null && (
            <span className="flex shrink-0 items-center gap-1">
              <Bath size={14} className="text-slate-600" />
              <small className="text-[.75rem]">{listing.bathrooms} Bath</small>
            </span>
          )}
          {listing.toilets != null && (
            <span className="flex shrink-0 items-center gap-1">
              <ShowerHead size={14} className="text-slate-600" />
              <small className="text-[.75rem]">{listing.toilets} Toilet</small>
            </span>
          )}
          {listing.parkingSpaces != null && listing.parkingSpaces > 0 && (
            <span className="flex shrink-0 items-center gap-1">
              <Car size={14} className="text-slate-600" />
              <small className="text-[.75rem]">{listing.parkingSpaces} Parking</small>
            </span>
          )}
          {listing.buildingSize != null && (
            <span className="flex shrink-0 items-center gap-1">
              <Maximize2 size={14} className="text-slate-600" />
              <small className="text-[.75rem]">{listing.buildingSize} sqft</small>
            </span>
          )}
        </div>

        {(listing.address ?? listing.city) && (
          <p className="mt-1.5 flex items-center gap-1 truncate text-[.75rem] text-gray-600">
            <MapPin size={13} className="shrink-0 text-gray-400" />
            {listing.address ? `${listing.address}, ${listing.city}` : listing.city}
          </p>
        )}
      </Link>
    </article>
  );
}

