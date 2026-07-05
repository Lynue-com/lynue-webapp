import { z } from "zod";

// Prisma Decimal fields are serialized as strings in JSON.
// This coerces them to numbers (or passes through null/undefined unchanged).
const decimalField = z.preprocess(
  (v) => (v == null ? v : Number(v)),
  z.number().nullable().optional(),
);

const listingImageSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
});

const listingUserSchema = z
  .object({
    id: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),
    phoneNumber: z.string().nullable().optional(),
  })
  .passthrough();

export const listingSchema = z
  .object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    listType: z.enum(["RENT", "SELL"]),
    category: z.string(),
    city: z.string(),
    state: z.string(),
    latitude: decimalField,
    longitude: decimalField,
    price: decimalField,
    priceUnit: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    bedrooms: z.number().nullable().optional(),
    bathrooms: decimalField,
    toilets: z.number().nullable().optional(),
    parkingSpaces: z.number().nullable().optional(),
    buildingSize: decimalField,
    createdAt: z.string(),
    images: z.array(listingImageSchema).default([]),
    status: z.enum(["DRAFT", "PUBLISHED", "SOLD", "RENTED", "ARCHIVED"]).optional(),
    user: listingUserSchema.optional(),
  })
  .passthrough();

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

export const listingsResponseSchema = z.object({
  status: z.boolean(),
  listings: z.array(listingSchema),
  pagination: paginationSchema,
});

export const listingDetailResponseSchema = z.object({
  status: z.boolean(),
  listing: listingSchema,
});
