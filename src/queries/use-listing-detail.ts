"use client";

import { useQuery } from "@tanstack/react-query";
import { getListingBySlug } from "@/features/listings/api/listings-api";

export function useListingDetail(slug: string) {
  return useQuery({
    queryKey: ["listing", slug],
    queryFn: () => getListingBySlug(slug),
    enabled: Boolean(slug),
  });
}
