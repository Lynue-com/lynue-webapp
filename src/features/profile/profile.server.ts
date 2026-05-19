import "server-only";
import { cache } from "react";
import { z } from "zod";
import { serverFetch } from "@/shared/lib/http.server";
import { listingSchema } from "@/features/listings/model/schemas";

const userSchema = z
  .object({
    id: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),
    profileTitle: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
  })
  .passthrough();

const userResponseSchema = z.object({
  status: z.boolean(),
  user: userSchema,
});

const listingsByUserSchema = z.object({
  status: z.boolean(),
  listings: z.array(listingSchema),
});

export const getUserProfile = cache(async (id: string) => {
  const response = await serverFetch<unknown>(`/api/users/${id}`);
  return userResponseSchema.parse(response).user;
});

export const getUserListings = cache(async (id: string) => {
  const response = await serverFetch<unknown>(`/api/listings/user/${id}`);
  return listingsByUserSchema.parse(response).listings;
});
