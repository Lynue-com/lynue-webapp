"use client";

import { useQuery } from "@tanstack/react-query";
import { getListings } from "@/features/listings/api/listings-api";
import type { ListingsFilters } from "@/features/listings/model/types";

export function useListings(filters: ListingsFilters) {
  return useQuery({
    queryKey: ["listings", filters],
    queryFn: () => getListings(filters),
  });
}
