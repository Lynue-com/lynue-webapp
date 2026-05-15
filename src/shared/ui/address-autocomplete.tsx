"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchAutocomplete, fetchGeocode } from "@/shared/lib/maps-api";
import type { AutocompleteResult, GeocodingResult } from "@/shared/lib/maps-api";

interface AddressAutocompleteProps {
  onSelect: (result: GeocodingResult) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({
  onSelect,
  defaultValue = "",
  placeholder = "Search for an address...",
  className = "",
}: AddressAutocompleteProps) {
  const [input, setInput] = useState(defaultValue);
  const [predictions, setPredictions] = useState<AutocompleteResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const search = useCallback(async (value: string) => {
    if (value.length < 3) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await fetchAutocomplete(value);
      setPredictions(results);
      setIsOpen(results.length > 0);
    } catch {
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const handleSelect = async (prediction: AutocompleteResult) => {
    setInput(prediction.description);
    setIsOpen(false);
    setPredictions([]);
    const result = await fetchGeocode(prediction.placeId);
    if (result) onSelect(result);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onFocus={() => predictions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
      />
      {loading ? (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      ) : null}

      {isOpen && predictions.length > 0 ? (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg">
          {predictions.map((p) => (
            <li key={p.placeId}>
              <button
                type="button"
                onClick={() => handleSelect(p)}
                className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-zinc-50"
              >
                <span className="text-sm font-medium text-zinc-900">{p.mainText}</span>
                <span className="text-xs text-zinc-500">{p.secondaryText}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
