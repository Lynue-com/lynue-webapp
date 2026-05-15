"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X, ChevronDown, Grid3X3, List, Map, Search } from "lucide-react";
import type { ListingsFilters } from "@/features/listings/model/types";

// ── Constants ──────────────────────────────────────────────────────────────

const LIST_AS_OPTIONS = [
  { value: "", label: "All" },
  { value: "OWNER", label: "FSBO" },
  { value: "AGENT", label: "Agent" },
] as const;

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "RESIDENTIAL", label: "Residential" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "LAND", label: "Land" },
  { value: "SHORT_STAY", label: "Short Stay" },
] as const;

const CONDITION_OPTIONS = [
  { value: "", label: "Any" },
  { value: "NEW", label: "New / Newly Built" },
  { value: "RENOVATED", label: "Renovated" },
  { value: "FAIRLY_USED", label: "Fairly Used" },
  { value: "OLD", label: "Old" },
  { value: "UNDER_CONSTRUCTION", label: "Under Construction" },
] as const;

const BEDROOMS = ["", "1", "2", "3", "4", "5"] as const;
const BATHROOMS = ["", "1", "2", "3", "4"] as const;
const TOILETS = ["", "1", "2", "3", "4"] as const;

const FURNISHING_OPTIONS = [
  { value: "", label: "Any" },
  { value: "FURNISHED", label: "Furnished" },
  { value: "SEMI_FURNISHED", label: "Semi-Furnished" },
  { value: "UNFURNISHED", label: "Unfurnished" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price_asc", label: "Low to High" },
  { value: "price_desc", label: "High to Low" },
] as const;

export type SortValue = "newest" | "oldest" | "price_asc" | "price_desc" | "distance";
export type ViewMode = "grid" | "list" | "map";

// ── Prop types ─────────────────────────────────────────────────────────────

type ListingFiltersProps = {
  filters: ListingsFilters;
  onChange: (next: ListingsFilters) => void;
  lockType?: "RENT" | "SELL";
};

export type SortRowProps = {
  sort: SortValue;
  viewMode: ViewMode;
  onSortChange: (sort: SortValue) => void;
  onViewModeChange: (mode: ViewMode) => void;
};

export type MobileSortRowProps = {
  sort: SortValue;
  onSortChange: (sort: SortValue) => void;
};

export type MobileViewToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  hidden?: boolean;
};

// ── Update helper (exactOptionalPropertyTypes-safe) ────────────────────────

function applyUpdate(
  filters: ListingsFilters,
  lockType: "RENT" | "SELL" | undefined,
  mutator: (draft: ListingsFilters) => void,
): ListingsFilters {
  const next: ListingsFilters = { ...filters, page: 1 };
  mutator(next);
  if (!next.type) delete next.type;
  if (!next.category) delete next.category;
  if (!next.listAs) delete next.listAs;
  if (!next.condition) delete next.condition;
  if (!next.furnishing) delete next.furnishing;
  if (!next.q) delete next.q;
  if (!next.city) delete next.city;
  if (!next.state) delete next.state;
  if (next.bedrooms === undefined) delete next.bedrooms;
  if (next.bathrooms === undefined) delete next.bathrooms;
  if (next.toilets === undefined) delete next.toilets;
  if (next.minPrice === undefined) delete next.minPrice;
  if (next.maxPrice === undefined) delete next.maxPrice;
  if (next.minSize === undefined) delete next.minSize;
  if (next.maxSize === undefined) delete next.maxSize;
  if (lockType) next.type = lockType;
  return next;
}

// ── Dropdown popover ───────────────────────────────────────────────────────

function Dropdown({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-50 mt-2 min-w-52 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
    >
      {children}
    </div>
  );
}

// ── Filter pill ────────────────────────────────────────────────────────────

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "border-black bg-black text-white"
          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
      }`}
    >
      {label}
      <ChevronDown size={14} />
    </button>
  );
}

// ── Choice group ───────────────────────────────────────────────────────────

function ChoiceGroup({
  options,
  value,
  onChange,
  wrap = true,
}: {
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  wrap?: boolean;
}) {
  return (
    <div className={wrap ? "flex flex-wrap gap-2" : "flex gap-2 overflow-x-auto"}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
            value === o.value
              ? "border-black bg-black text-white"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Desktop filter bar ─────────────────────────────────────────────────────

function DesktopFilterBar({ filters, onChange, lockType }: ListingFiltersProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const toggle = (name: string) => setOpenMenu((prev) => (prev === name ? null : name));
  const close = () => setOpenMenu(null);

  function update(mutator: (draft: ListingsFilters) => void) {
    onChange(applyUpdate(filters, lockType, mutator));
  }

  const typeLabel = filters.type === "SELL" ? "Buy" : "Rent";
  const catLabel = filters.category
    ? (CATEGORIES.find((c) => c.value === filters.category)?.label ?? "Type")
    : "Type";
  const condLabel = filters.condition
    ? (CONDITION_OPTIONS.find((o) => o.value === filters.condition)?.label ?? "Condition")
    : "Condition";
  const furnLabel = filters.furnishing
    ? (FURNISHING_OPTIONS.find((o) => o.value === filters.furnishing)?.label ?? "Furnishing")
    : "Furnishing";

  return (
    <div className="hidden md:block">
      <div className="flex flex-wrap items-center gap-2">
        {/* All / FSBO / Agent */}
        <div className="flex shrink-0 items-center rounded-full border border-gray-300 p-0.5">
          {LIST_AS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() =>
                update((d) => {
                  if (o.value === "OWNER" || o.value === "AGENT") {
                    d.listAs = o.value;
                  } else {
                    delete d.listAs;
                  }
                })
              }
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                (filters.listAs ?? "") === o.value
                  ? "bg-black text-white"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Rent / Buy */}
        <div className="relative">
          <FilterPill label={typeLabel} active={!!filters.type} onClick={() => toggle("type")} />
          <Dropdown open={openMenu === "type"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Listing Type</p>
            <ChoiceGroup
              options={[
                { value: "", label: "All" },
                { value: "RENT", label: "Rent" },
                { value: "SELL", label: "Buy" },
              ]}
              value={filters.type ?? ""}
              onChange={(v) => {
                if (!lockType) {
                  update((d) => {
                    if (v === "RENT" || v === "SELL") {
                      d.type = v;
                    } else {
                      delete d.type;
                    }
                  });
                }
                close();
              }}
            />
          </Dropdown>
        </div>

        {/* Condition */}
        <div className="relative">
          <FilterPill label={condLabel} active={!!filters.condition} onClick={() => toggle("condition")} />
          <Dropdown open={openMenu === "condition"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Condition</p>
            <ChoiceGroup
              options={CONDITION_OPTIONS}
              value={filters.condition ?? ""}
              onChange={(v) => {
                update((d) => {
                  if (
                    v === "NEW" ||
                    v === "RENOVATED" ||
                    v === "FAIRLY_USED" ||
                    v === "OLD" ||
                    v === "UNDER_CONSTRUCTION"
                  ) {
                    d.condition = v;
                  } else {
                    delete d.condition;
                  }
                });
                close();
              }}
            />
          </Dropdown>
        </div>

        {/* Type / Category */}
        <div className="relative">
          <FilterPill label={catLabel} active={!!filters.category} onClick={() => toggle("category")} />
          <Dropdown open={openMenu === "category"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Property Type</p>
            <ChoiceGroup
              options={CATEGORIES}
              value={filters.category ?? ""}
              onChange={(v) => {
                update((d) => {
                  if (
                    v === "RESIDENTIAL" ||
                    v === "COMMERCIAL" ||
                    v === "LAND" ||
                    v === "SHORT_STAY"
                  ) {
                    d.category = v;
                  } else {
                    delete d.category;
                  }
                });
                close();
              }}
            />
          </Dropdown>
        </div>

        {/* Bed */}
        <div className="relative">
          <FilterPill
            label={filters.bedrooms !== undefined ? `${filters.bedrooms}+ Bed` : "Bed"}
            active={filters.bedrooms !== undefined}
            onClick={() => toggle("beds")}
          />
          <Dropdown open={openMenu === "beds"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Bedrooms</p>
            <ChoiceGroup
              options={BEDROOMS.map((b) => ({ value: b, label: b ? `${b}+` : "Any" }))}
              value={filters.bedrooms !== undefined ? String(filters.bedrooms) : ""}
              onChange={(v) => {
                update((d) => {
                  if (v) {
                    d.bedrooms = Number(v);
                  } else {
                    delete d.bedrooms;
                  }
                });
                close();
              }}
            />
          </Dropdown>
        </div>

        {/* Toilet */}
        <div className="relative">
          <FilterPill
            label={filters.toilets !== undefined ? `${filters.toilets}+ Toilet` : "Toilet"}
            active={filters.toilets !== undefined}
            onClick={() => toggle("toilets")}
          />
          <Dropdown open={openMenu === "toilets"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Toilets</p>
            <ChoiceGroup
              options={TOILETS.map((t) => ({ value: t, label: t ? `${t}+` : "Any" }))}
              value={filters.toilets !== undefined ? String(filters.toilets) : ""}
              onChange={(v) => {
                update((d) => {
                  if (v) {
                    d.toilets = Number(v);
                  } else {
                    delete d.toilets;
                  }
                });
                close();
              }}
            />
          </Dropdown>
        </div>

        {/* Bath */}
        <div className="relative">
          <FilterPill
            label={filters.bathrooms !== undefined ? `${filters.bathrooms}+ Bath` : "Bath"}
            active={filters.bathrooms !== undefined}
            onClick={() => toggle("baths")}
          />
          <Dropdown open={openMenu === "baths"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Bathrooms</p>
            <ChoiceGroup
              options={BATHROOMS.map((b) => ({ value: b, label: b ? `${b}+` : "Any" }))}
              value={filters.bathrooms !== undefined ? String(filters.bathrooms) : ""}
              onChange={(v) => {
                update((d) => {
                  if (v) {
                    d.bathrooms = Number(v);
                  } else {
                    delete d.bathrooms;
                  }
                });
                close();
              }}
            />
          </Dropdown>
        </div>

        {/* Furnishing */}
        <div className="relative">
          <FilterPill label={furnLabel} active={!!filters.furnishing} onClick={() => toggle("furnishing")} />
          <Dropdown open={openMenu === "furnishing"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Furnishing</p>
            <div className="flex flex-col gap-1">
              {FURNISHING_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    update((d) => {
                      if (
                        o.value === "FURNISHED" ||
                        o.value === "SEMI_FURNISHED" ||
                        o.value === "UNFURNISHED"
                      ) {
                        d.furnishing = o.value;
                      } else {
                        delete d.furnishing;
                      }
                    });
                    close();
                  }}
                  className={`rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    (filters.furnishing ?? "") === o.value
                      ? "bg-black text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Dropdown>
        </div>

        {/* Size */}
        <div className="relative">
          <FilterPill
            label="Size"
            active={filters.minSize !== undefined || filters.maxSize !== undefined}
            onClick={() => toggle("size")}
          />
          <Dropdown open={openMenu === "size"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Size (sqft)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minSize ?? ""}
                onChange={(e) =>
                  update((d) => {
                    const n = Number(e.target.value);
                    if (e.target.value && Number.isFinite(n)) {
                      d.minSize = n;
                    } else {
                      delete d.minSize;
                    }
                  })
                }
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxSize ?? ""}
                onChange={(e) =>
                  update((d) => {
                    const n = Number(e.target.value);
                    if (e.target.value && Number.isFinite(n)) {
                      d.maxSize = n;
                    } else {
                      delete d.maxSize;
                    }
                  })
                }
                className="w-24 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </Dropdown>
        </div>

        {/* Price */}
        <div className="relative">
          <FilterPill
            label="Price"
            active={filters.minPrice !== undefined || filters.maxPrice !== undefined}
            onClick={() => toggle("price")}
          />
          <Dropdown open={openMenu === "price"} onClose={close}>
            <p className="mb-2 text-xs font-semibold uppercase text-gray-400">Price Range (₦)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  update((d) => {
                    const n = Number(e.target.value);
                    if (e.target.value && Number.isFinite(n)) {
                      d.minPrice = n;
                    } else {
                      delete d.minPrice;
                    }
                  })
                }
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
              <span className="text-gray-400">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  update((d) => {
                    const n = Number(e.target.value);
                    if (e.target.value && Number.isFinite(n)) {
                      d.maxPrice = n;
                    } else {
                      delete d.maxPrice;
                    }
                  })
                }
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
              />
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}

// ── Mobile filter bar ──────────────────────────────────────────────────────

function MobileFilterBar({ filters, onChange, lockType }: ListingFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function update(mutator: (draft: ListingsFilters) => void) {
    onChange(applyUpdate(filters, lockType, mutator));
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center gap-2">
        {/* Scrollable chips */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {/* All / FSBO / Agent */}
          <div className="flex shrink-0 items-center rounded-full border border-gray-300 p-0.5">
            {LIST_AS_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  update((d) => {
                    if (o.value === "OWNER" || o.value === "AGENT") {
                      d.listAs = o.value;
                    } else {
                      delete d.listAs;
                    }
                  })
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  (filters.listAs ?? "") === o.value
                    ? "bg-black text-white"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Type chip */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${
              filters.type
                ? "border-black bg-black text-white"
                : "border-gray-300 text-gray-700"
            }`}
          >
            {filters.type === "SELL" ? "Buy" : "Rent"}
            <ChevronDown size={12} />
          </button>

          {/* Active condition */}
          {filters.condition ? (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-black bg-black px-3 py-1.5 text-xs font-medium text-white"
            >
              {CONDITION_OPTIONS.find((o) => o.value === filters.condition)?.label}
              <X
                size={12}
                onClick={(e) => {
                  e.stopPropagation();
                  update((d) => {
                    delete d.condition;
                  });
                }}
              />
            </button>
          ) : null}

          {/* Active beds */}
          {filters.bedrooms !== undefined ? (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-black bg-black px-3 py-1.5 text-xs font-medium text-white"
            >
              {filters.bedrooms}+ Bed
              <X
                size={12}
                onClick={(e) => {
                  e.stopPropagation();
                  update((d) => {
                    delete d.bedrooms;
                  });
                }}
              />
            </button>
          ) : null}

          {/* Active price */}
          {filters.minPrice !== undefined || filters.maxPrice !== undefined ? (
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex shrink-0 items-center gap-1 rounded-full border border-black bg-black px-3 py-1.5 text-xs font-medium text-white"
            >
              Price
              <X
                size={12}
                onClick={(e) => {
                  e.stopPropagation();
                  update((d) => {
                    delete d.minPrice;
                    delete d.maxPrice;
                  });
                }}
              />
            </button>
          ) : null}
        </div>

        {/* Filters button */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>

      {/* Full-screen panel */}
      {mobileOpen
        ? createPortal(
            <div className="fixed inset-x-0 top-0 bottom-16 z-9999 bg-white">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-5 py-3">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full p-2 hover:bg-gray-100"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 pb-24">
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Listing Type
                    </h3>
                    <ChoiceGroup
                      wrap={false}
                      options={[
                        { value: "", label: "All" },
                        { value: "RENT", label: "Rent" },
                        { value: "SELL", label: "Buy" },
                      ]}
                      value={filters.type ?? ""}
                      onChange={(v) => {
                        if (!lockType) {
                          update((d) => {
                            if (v === "RENT" || v === "SELL") {
                              d.type = v;
                            } else {
                              delete d.type;
                            }
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Property Type
                    </h3>
                    <ChoiceGroup
                      options={CATEGORIES}
                      value={filters.category ?? ""}
                      onChange={(v) =>
                        update((d) => {
                          if (
                            v === "RESIDENTIAL" ||
                            v === "COMMERCIAL" ||
                            v === "LAND" ||
                            v === "SHORT_STAY"
                          ) {
                            d.category = v;
                          } else {
                            delete d.category;
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Condition
                    </h3>
                    <ChoiceGroup
                      options={CONDITION_OPTIONS}
                      value={filters.condition ?? ""}
                      onChange={(v) =>
                        update((d) => {
                          if (
                            v === "NEW" ||
                            v === "RENOVATED" ||
                            v === "FAIRLY_USED" ||
                            v === "OLD" ||
                            v === "UNDER_CONSTRUCTION"
                          ) {
                            d.condition = v;
                          } else {
                            delete d.condition;
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Price (₦)
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice ?? ""}
                        onChange={(e) =>
                          update((d) => {
                            const n = Number(e.target.value);
                            if (e.target.value && Number.isFinite(n)) {
                              d.minPrice = n;
                            } else {
                              delete d.minPrice;
                            }
                          })
                        }
                        className="w-28 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice ?? ""}
                        onChange={(e) =>
                          update((d) => {
                            const n = Number(e.target.value);
                            if (e.target.value && Number.isFinite(n)) {
                              d.maxPrice = n;
                            } else {
                              delete d.maxPrice;
                            }
                          })
                        }
                        className="w-28 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Bedrooms
                    </h3>
                    <ChoiceGroup
                      wrap={false}
                      options={BEDROOMS.map((b) => ({ value: b, label: b ? `${b}+` : "Any" }))}
                      value={filters.bedrooms !== undefined ? String(filters.bedrooms) : ""}
                      onChange={(v) =>
                        update((d) => {
                          if (v) {
                            d.bedrooms = Number(v);
                          } else {
                            delete d.bedrooms;
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Toilets
                    </h3>
                    <ChoiceGroup
                      wrap={false}
                      options={TOILETS.map((t) => ({ value: t, label: t ? `${t}+` : "Any" }))}
                      value={filters.toilets !== undefined ? String(filters.toilets) : ""}
                      onChange={(v) =>
                        update((d) => {
                          if (v) {
                            d.toilets = Number(v);
                          } else {
                            delete d.toilets;
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Bathrooms
                    </h3>
                    <ChoiceGroup
                      wrap={false}
                      options={BATHROOMS.map((b) => ({ value: b, label: b ? `${b}+` : "Any" }))}
                      value={filters.bathrooms !== undefined ? String(filters.bathrooms) : ""}
                      onChange={(v) =>
                        update((d) => {
                          if (v) {
                            d.bathrooms = Number(v);
                          } else {
                            delete d.bathrooms;
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Furnishing
                    </h3>
                    <ChoiceGroup
                      options={FURNISHING_OPTIONS}
                      value={filters.furnishing ?? ""}
                      onChange={(v) =>
                        update((d) => {
                          if (
                            v === "FURNISHED" ||
                            v === "SEMI_FURNISHED" ||
                            v === "UNFURNISHED"
                          ) {
                            d.furnishing = v;
                          } else {
                            delete d.furnishing;
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Size (sqft)
                    </h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minSize ?? ""}
                        onChange={(e) =>
                          update((d) => {
                            const n = Number(e.target.value);
                            if (e.target.value && Number.isFinite(n)) {
                              d.minSize = n;
                            } else {
                              delete d.minSize;
                            }
                          })
                        }
                        className="w-28 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                      />
                      <span className="text-gray-400">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxSize ?? ""}
                        onChange={(e) =>
                          update((d) => {
                            const n = Number(e.target.value);
                            if (e.target.value && Number.isFinite(n)) {
                              d.maxSize = n;
                            } else {
                              delete d.maxSize;
                            }
                          })
                        }
                        className="w-28 rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const next: ListingsFilters = {
                          page: 1,
                          limit: filters.limit ?? 20,
                          sort: "newest",
                        };
                        if (lockType) next.type = lockType;
                        onChange(next);
                      }}
                      className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileOpen(false)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black py-2.5 text-sm font-medium text-white"
                    >
                      <Search size={16} />
                      Search
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

// ── Sort row (desktop) ─────────────────────────────────────────────────────

export function SortRow({ sort, viewMode, onSortChange, onViewModeChange }: SortRowProps) {
  return (
    <div className="hidden items-center gap-3 md:flex">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-500">Sort:</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortValue)}
          className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-black"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5">
        <button
          type="button"
          onClick={() => onViewModeChange("grid")}
          className={`rounded-md p-1.5 transition-colors ${
            viewMode === "grid" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <Grid3X3 size={16} />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange("list")}
          className={`rounded-md p-1.5 transition-colors ${
            viewMode === "list" ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <List size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Mobile sort row ────────────────────────────────────────────────────────

export function MobileSortRow({ sort, onSortChange }: MobileSortRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500">Sort:</span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortValue)}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-black"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Floating mobile view toggle ────────────────────────────────────────────

export function MobileViewToggle({ viewMode, onViewModeChange, hidden }: MobileViewToggleProps) {
  if (hidden) return null;

  const modes: ViewMode[] = ["grid", "list", "map"];
  const next = modes[(modes.indexOf(viewMode) + 1) % modes.length] ?? "grid";
  const Icon = viewMode === "grid" ? List : viewMode === "list" ? Map : Grid3X3;
  const label = viewMode === "grid" ? "List View" : viewMode === "list" ? "Map" : "Grid";

  return (
    <div className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 md:hidden">
      <button
        type="button"
        onClick={() => onViewModeChange(next)}
        className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-transform active:scale-95"
      >
        <Icon size={16} /> {label}
      </button>
    </div>
  );
}

// ── Default export ─────────────────────────────────────────────────────────

export default function ListingFilters(props: ListingFiltersProps) {
  return (
    <>
      <DesktopFilterBar {...props} />
      <MobileFilterBar {...props} />
    </>
  );
}
