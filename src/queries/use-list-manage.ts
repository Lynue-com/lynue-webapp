"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createListing,
  deleteListing,
  getCategories,
  publishListing,
  uploadListingImages,
} from "@/features/list-manage/api/list-manage-api";

export function useCategories() {
  return useQuery({
    queryKey: ["list", "categories"],
    queryFn: getCategories,
    staleTime: 30 * 60_000,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createListing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "my-listings"] });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteListing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "my-listings"] });
    },
  });
}

export function usePublishListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishListing,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "my-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

export function useUploadListingImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) => uploadListingImages(id, files),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "my-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}
