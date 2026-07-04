"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { formatCurrency } from "@/shared/lib/format";
import { env } from "@/shared/lib/env";
import type { Listing } from "@/features/listings/model/types";

type MapViewProps = {
  listings: Listing[];
  hoveredListingId?: string | null;
};

function PriceMarker({ listing, active }: { listing: Listing; active: boolean }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const hasCoordinates = typeof listing.latitude === "number" && typeof listing.longitude === "number";
  const [open, setOpen] = useState(false);

  if (!hasCoordinates) {
    return null;
  }

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: listing.latitude as number, lng: listing.longitude as number }}
        onClick={() => setOpen((value) => !value)}
      >
        <div
          className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
            active || open ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-900"
          }`}
        >
          {formatCurrency(listing.price)}
        </div>
      </AdvancedMarker>

      {open ? (
        <InfoWindow anchor={marker} onCloseClick={() => setOpen(false)}>
          <Link href={`/listings/${listing.slug}`} className="block w-56">
            <p className="text-sm font-semibold text-zinc-900">{listing.title}</p>
            <p className="mt-1 text-xs text-zinc-600">
              {listing.city}, {listing.state}
            </p>
          </Link>
        </InfoWindow>
      ) : null}
    </>
  );
}

export function MapView({ listings, hoveredListingId }: MapViewProps) {
  const withCoordinates = useMemo(
    () => listings.filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number"),
    [listings],
  );

  if (!env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="grid h-full place-items-center text-sm text-zinc-500">
        Map unavailable: set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
      </div>
    );
  }

  if (withCoordinates.length === 0) {
    return <div className="grid h-full place-items-center text-sm text-zinc-500">No mapped listings in this result.</div>;
  }

  const first = withCoordinates[0];
  if (!first) {
    return <div className="grid h-full place-items-center text-sm text-zinc-500">No mapped listings in this result.</div>;
  }

  return (
    <APIProvider apiKey={env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultCenter={{ lat: first.latitude as number, lng: first.longitude as number }}
        defaultZoom={11}
        mapId={env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? null}
        className="h-full w-full"
        gestureHandling="greedy"
      >
        {withCoordinates.map((listing) => (
          <PriceMarker key={listing.id} listing={listing} active={hoveredListingId === listing.id} />
        ))}
      </Map>
    </APIProvider>
  );
}
