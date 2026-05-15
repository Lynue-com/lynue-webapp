import { z } from "zod";
import { listingSchema } from "@/features/listings/model/schemas";

const subCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  category: z.string().optional(),
});

const categorySchema = z.object({
  value: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND", "SHORT_STAY"]),
  name: z.string(),
  slug: z.string(),
  subCategories: z.array(subCategorySchema),
});

export const categoriesResponseSchema = z.object({
  status: z.boolean(),
  categories: z.array(categorySchema),
});

export const listingCreatePayloadSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  listType: z.enum(["RENT", "SELL"]),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL", "LAND", "SHORT_STAY"]),
  subCategoryId: z.number().int().positive().optional(),
  price: z.number().positive(),
  currency: z.literal("NGN").default("NGN"),
  priceUnit: z.enum(["YEAR", "MONTH", "WEEK", "DAY"]).optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().default("NG"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  placeId: z.string().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  toilets: z.number().int().min(0).optional(),
  parkingSpaces: z.number().int().min(0).optional(),
  yearBuilt: z.number().int().optional(),
  floorNumber: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  landSize: z.number().optional(),
  buildingSize: z.number().optional(),
  listAs: z.enum(["OWNER", "AGENT"]).default("OWNER"),
  agencyFee: z.number().optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  condition: z
    .enum(["NEW", "RENOVATED", "FAIRLY_USED", "OLD", "UNDER_CONSTRUCTION"])
    .optional(),
  titleDocument: z
    .enum(["c_of_o", "governors_consent", "deed_of_assignment", "registered_survey", "receipt_of_purchase", "excision", "gazette", "none"])
    .optional(),
  amenities: z.array(z.object({ slug: z.string(), label: z.string() })).optional(),
  facilities: z.array(z.object({ slug: z.string(), label: z.string() })).optional(),
});

export const listingCreateResponseSchema = z.object({
  status: z.boolean(),
  listing: listingSchema,
});

export const listingDeleteResponseSchema = z.object({
  status: z.boolean(),
  message: z.string(),
});
