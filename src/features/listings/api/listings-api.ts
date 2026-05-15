import { apiRequest } from "@/shared/lib/http";
import {
  listingDetailResponseSchema,
  listingsResponseSchema,
} from "@/features/listings/model/schemas";
import type {
  Listing,
  ListingsFilters,
  ListingsResponse,
} from "@/features/listings/model/types";

export async function getListings(filters: ListingsFilters = {}): Promise<ListingsResponse> {
  const response = await apiRequest<unknown>("/api/listings", {
    query: {
      page: filters.page ?? 1,
      limit: filters.limit ?? 12,
      type: filters.type,
      category: filters.category,
      subCategorySlug: filters.subCategorySlug,
      city: filters.city,
      state: filters.state,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bedrooms: filters.bedrooms,
      bathrooms: filters.bathrooms,
      toilets: filters.toilets,
      minSize: filters.minSize,
      maxSize: filters.maxSize,
      parking: filters.parking,
      furnishing: filters.furnishing,
      listAs: filters.listAs,
      condition: filters.condition,
      amenity: filters.amenity,
      facility: filters.facility,
      lat: filters.lat,
      lng: filters.lng,
      radius: filters.radius,
      q: filters.q,
      sort: filters.sort ?? "newest",
    },
  });

  return listingsResponseSchema.parse(response);
}

export async function getListingBySlug(slug: string): Promise<Listing> {
  const response = await apiRequest<unknown>(`/api/listings/${slug}`);
  const parsed = listingDetailResponseSchema.parse(response);
  return parsed.listing;
}
