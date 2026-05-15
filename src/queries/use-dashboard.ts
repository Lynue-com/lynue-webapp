"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyListings } from "@/features/dashboard/dashboard-api";

export function useMyListings() {
  return useQuery({
    queryKey: ["dashboard", "my-listings"],
    queryFn: getMyListings,
    retry: false,
  });
}
