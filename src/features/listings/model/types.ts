import type { z } from "zod";
import type {
  listingSchema,
  listingDetailResponseSchema,
  listingsResponseSchema,
  paginationSchema,
} from "@/features/listings/model/schemas";

export type Listing = z.infer<typeof listingSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ListingsResponse = z.infer<typeof listingsResponseSchema>;
export type ListingDetailResponse = z.infer<typeof listingDetailResponseSchema>;

export type ListingsFilters = {
  page?: number;
  limit?: number;
  type?: "RENT" | "SELL";
  category?: "RESIDENTIAL" | "COMMERCIAL" | "LAND" | "SHORT_STAY";
  subCategorySlug?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  minSize?: number;
  maxSize?: number;
  parking?: number;
  furnishing?: "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED";
  listAs?: "OWNER" | "AGENT";
  condition?: "NEW" | "RENOVATED" | "FAIRLY_USED" | "OLD" | "UNDER_CONSTRUCTION";
  amenity?: string;
  facility?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  q?: string;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "distance";
};
