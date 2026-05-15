"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSavedListings, saveListing, unsaveListing } from "@/features/saved/saved-api";

export function useSavedListings() {
  return useQuery({
    queryKey: ["saved"],
    queryFn: getSavedListings,
    retry: false,
  });
}

export function useToggleSaved() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isSaved }: { listingId: string; isSaved: boolean }) => {
      if (isSaved) {
        return unsaveListing(listingId);
      }
      return saveListing(listingId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved"] });
    },
  });
}
