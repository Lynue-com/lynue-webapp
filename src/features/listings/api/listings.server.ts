import "server-only";
import { cache } from "react";
import { serverFetch } from "@/shared/lib/http.server";
import { listingDetailResponseSchema } from "@/features/listings/model/schemas";
import type { Listing } from "@/features/listings/model/types";

export const getListingBySlug = cache(async (slug: string): Promise<Listing> => {
  const data = await serverFetch<unknown>(`/api/listings/${encodeURIComponent(slug)}`);
  return listingDetailResponseSchema.parse(data).listing;
});

