import { z } from "zod";
import { apiRequest } from "@/shared/lib/http";
import {
  categoriesResponseSchema,
  listingCreatePayloadSchema,
  listingCreateResponseSchema,
  listingDeleteResponseSchema,
} from "@/features/list-manage/model/schemas";
import { listingSchema } from "@/features/listings/model/schemas";

const listingSingleResponseSchema = z.object({
  status: z.boolean(),
  listing: listingSchema,
});

export async function getCategories() {
  const response = await apiRequest<unknown>("/api/list/categories", {
    credentials: "include",
  });
  return categoriesResponseSchema.parse(response).categories;
}

export async function createListing(payload: unknown) {
  const validated = listingCreatePayloadSchema.parse(payload);
  const response = await apiRequest<unknown>("/api/list", {
    method: "POST",
    json: validated,
    credentials: "include",
  });
  return listingCreateResponseSchema.parse(response).listing;
}

export async function deleteListing(id: string) {
  const response = await apiRequest<unknown>(`/api/list/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return listingDeleteResponseSchema.parse(response);
}

export async function publishListing(id: string) {
  const response = await apiRequest<unknown>(`/api/list/${id}/publish`, {
    method: "POST",
    credentials: "include",
  });
  return listingCreateResponseSchema.parse(response).listing;
}

export async function unpublishListing(id: string) {
  const response = await apiRequest<unknown>(`/api/list/${id}`, {
    method: "PATCH",
    json: { status: "DRAFT" },
    credentials: "include",
  });
  return listingSingleResponseSchema.parse(response).listing;
}

export async function uploadListingImages(id: string, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  return apiRequest(`/api/list/${id}/images`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
}
