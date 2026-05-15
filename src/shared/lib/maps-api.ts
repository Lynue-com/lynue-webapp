import { apiRequest } from "@/shared/lib/http";

export interface AutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface GeocodingResult {
  lat: number;
  lng: number;
  placeId: string;
  formattedAddress: string;
  city: string;
  state: string;
  country: string;
}

export async function fetchAutocomplete(input: string): Promise<AutocompleteResult[]> {
  if (!input.trim()) return [];
  const data = await apiRequest<unknown>(`/api/maps/autocomplete?input=${encodeURIComponent(input)}`);
  if (Array.isArray(data)) return data as AutocompleteResult[];
  if (data && typeof data === "object" && "predictions" in data) {
    return (data as { predictions: AutocompleteResult[] }).predictions;
  }
  return [];
}

export async function fetchGeocode(placeId: string): Promise<GeocodingResult | null> {
  const data = await apiRequest<unknown>(`/api/maps/geocode?placeId=${encodeURIComponent(placeId)}`);
  if (data && typeof data === "object" && "lat" in data) {
    return data as GeocodingResult;
  }
  return null;
}
