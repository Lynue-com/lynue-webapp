import { apiRequest } from "@/shared/lib/http";
import { z } from "zod";
import { listingSchema } from "@/features/listings/model/schemas";

const myListingsSchema = z.object({
  status: z.boolean(),
  listings: listingSchema.array(),
});

export async function getMyListings() {
  const response = await apiRequest<unknown>("/api/list/user/me", {
    credentials: "include",
  });
  return myListingsSchema.parse(response).listings;
}
