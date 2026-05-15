import { z } from "zod";
import { apiRequest } from "@/shared/lib/http";
import { listingSchema } from "@/features/listings/model/schemas";

const savedSchema = z
  .object({
    id: z.string(),
    listingId: z.string(),
    listing: listingSchema.optional(),
  })
  .passthrough();

const savedResponseSchema = z.object({
  status: z.boolean(),
  saved: z.array(savedSchema),
});

const toggleSavedSchema = z.object({
  status: z.boolean(),
});

export async function getSavedListings() {
  const response = await apiRequest<unknown>("/api/saved", {
    credentials: "include",
  });
  return savedResponseSchema.parse(response).saved;
}

export async function saveListing(listingId: string) {
  const response = await apiRequest<unknown>(`/api/saved/${listingId}`, {
    method: "POST",
    credentials: "include",
  });
  return toggleSavedSchema.parse(response);
}

export async function unsaveListing(listingId: string) {
  const response = await apiRequest<unknown>(`/api/saved/${listingId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return toggleSavedSchema.parse(response);
}
