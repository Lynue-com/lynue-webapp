"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { fetchAutocomplete, type AutocompleteResult } from "@/shared/lib/maps-api";

type SearchBarProps = {
  defaultValue?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-10 text-sm px-3",
  md: "h-11 text-base px-4",
  lg: "h-13 text-base px-4",
};

const iconSizeMap = { sm: 15, md: 17, lg: 18 };

export function SearchBar({
  defaultValue = "",
  onSearch,
  placeholder = "Search address, city, or neighborhood",
  size = "md",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AutocompleteResult[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = useCallback((next: string) => {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length > 2) {
      debounceRef.current = setTimeout(() => {
        fetchAutocomplete(next.trim()).then((results) => {
          setSuggestions(results);
          setOpen(results.length > 0);
        }).catch(() => null);
      }, 300);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, []);

  const submit = useCallback(
    (query: string) => {
      setOpen(false);
      const trimmed = query.trim();
      if (onSearch) {
        onSearch(trimmed);
      } else if (trimmed) {
        router.push(`/listings?q=${encodeURIComponent(trimmed)}`);
      }
    },
    [onSearch, router],
  );

  return (
    <form
      ref={wrapperRef}
      onSubmit={(e) => { e.preventDefault(); submit(value); }}
      className={`relative flex items-center ${className}`}
    >
      <div className="relative w-full">
        <input
          type="search"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-full border border-zinc-200 bg-white pr-11 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 ${sizeMap[size]}`}
        />
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-zinc-900 p-2 text-white transition hover:bg-zinc-700"
        >
          <Search size={iconSizeMap[size]} />
        </button>
      </div>

      {open && suggestions.length > 0 ? (
        <ul className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
          {suggestions.map((suggestion) => (
            <li key={suggestion.placeId}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm text-zinc-800 hover:bg-zinc-50"
                onClick={() => { setValue(suggestion.description); submit(suggestion.description); }}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-zinc-400" />
                {suggestion.description}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}
