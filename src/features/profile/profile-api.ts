import { z } from "zod";
import { apiRequest } from "@/shared/lib/http";
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

export async function getUserProfile(id: string) {
  const response = await apiRequest<unknown>(`/api/users/${id}`);
  return userResponseSchema.parse(response).user;
}

export async function getUserListings(id: string) {
  const response = await apiRequest<unknown>(`/api/listings/user/${id}`);
  return listingsByUserSchema.parse(response).listings;
}
