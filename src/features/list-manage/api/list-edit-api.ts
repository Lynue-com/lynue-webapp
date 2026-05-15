import { z } from "zod";
import { apiRequest } from "@/shared/lib/http";
import { listingSchema } from "@/features/listings/model/schemas";

const listingSingleResponseSchema = z.object({
  status: z.boolean(),
  listing: listingSchema,
});

export async function getListingForEdit(id: string) {
  const response = await apiRequest<unknown>(`/api/list/${id}`, {
    credentials: "include",
  });
  return listingSingleResponseSchema.parse(response).listing;
}

export async function updateListing(id: string, payload: Record<string, unknown>) {
  const response = await apiRequest<unknown>(`/api/list/${id}`, {
    method: "PATCH",
    json: payload,
    credentials: "include",
  });
  return listingSingleResponseSchema.parse(response).listing;
}

export async function uploadListingImagesForEdit(id: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  return apiRequest(`/api/list/${id}/images`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
}

export async function deleteListingImage(listingId: string, imageId: string) {
  return apiRequest(`/api/list/${listingId}/images/${imageId}`, {
    method: "DELETE",
    credentials: "include",
  });
}
