"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function HeroSearch() {
  const [tab, setTab] = useState<"rent" | "buy" | "list">("rent");
  const [query, setQuery] = useState("");

  const href = tab === "list"
    ? "/list"
    : `/listings?type=${tab === "rent" ? "RENT" : "SELL"}${query ? `&q=${encodeURIComponent(query)}` : ""}`;

  return (
    <div className="w-full max-w-xl px-4">
      {/* Tabs */}
      <div className="mb-5 flex w-full justify-center">
        <div className="flex rounded-full bg-white/30 p-1.5 backdrop-blur-sm">
          {(["rent", "buy", "list"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-6 py-2 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-zinc-900 text-white" : "text-white hover:bg-white/20"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search input */}
      <div className="relative flex w-full items-center overflow-hidden rounded-full bg-white shadow-xl">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter an address, neighborhood, city, or state"
          className="w-full py-4 pl-5 pr-14 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <Link
          href={href}
          aria-label="Search listings"
          className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-[#FFE380] hover:text-zinc-900"
        >
          <Search size={18} />
        </Link>
      </div>
    </div>
  );
}
