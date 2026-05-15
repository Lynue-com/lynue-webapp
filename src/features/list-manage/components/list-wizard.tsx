"use client";

import { useRef, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import { getAmenityIcon, getFacilityIcon, getSubCategoryIcon } from "@/shared/lib/icons";
import { toast } from "sonner";
import { useMe } from "@/queries/use-auth";
import {
  useCategories,
  useCreateListing,
  usePublishListing,
  useUploadListingImages,
} from "@/queries/use-list-manage";
import {
  LIST_TYPES,
  LIST_AS,
  FURNISHING_OPTIONS,
  CONDITION_OPTIONS,
  TITLE_DOCUMENTS,
  PRICE_UNITS,
  AMENITIES,
  FACILITIES,
} from "@/features/list-manage/model/list-form-options";
import { AddressAutocomplete } from "@/shared/ui/address-autocomplete";
import type { GeocodingResult } from "@/shared/lib/maps-api";

// ─── Constants ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Type" },
  { id: 2, label: "Details" },
  { id: 3, label: "Metrics" },
  { id: 4, label: "Location" },
  { id: 5, label: "Features" },
  { id: 6, label: "Photos" },
  { id: 7, label: "Review" },
];

// ─── State ──────────────────────────────────────────────────────────────────

type FormState = {
  step: number;
  listType: "RENT" | "SELL";
  listAs: "OWNER" | "AGENT";
  category: "RESIDENTIAL" | "COMMERCIAL" | "LAND" | "SHORT_STAY" | "";
  subCategoryId: number | undefined;
  title: string;
  description: string;
  price: string;
  priceUnit: string;
  agencyFee: number;
  furnishing: string;
  condition: string;
  titleDocument: string;
  bedrooms: string;
  bathrooms: string;
  toilets: string;
  parkingSpaces: string;
  yearBuilt: string;
  floorNumber: string;
  totalFloors: string;
  landSize: string;
  buildingSize: string;
  address: string;
  addressExtra: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  amenities: { slug: string; label: string }[];
  facilities: { slug: string; label: string }[];
  files: File[];
  previews: string[];
};

const initialState: FormState = {
  step: 1,
  listType: "RENT",
  listAs: "OWNER",
  category: "",
  subCategoryId: undefined,
  title: "",
  description: "",
  price: "",
  priceUnit: "",
  agencyFee: 7.5,
  furnishing: "",
  condition: "",
  titleDocument: "",
  bedrooms: "",
  bathrooms: "",
  toilets: "",
  parkingSpaces: "",
  yearBuilt: "",
  floorNumber: "",
  totalFloors: "",
  landSize: "",
  buildingSize: "",
  address: "",
  addressExtra: "",
  city: "",
  state: "",
  country: "NG",
  amenities: [],
  facilities: [],
  files: [],
  previews: [],
};

// ─── Shared UI ───────────────────────────────────────────────────────────────

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h2>
      <p className="mb-7 mt-1 text-sm text-zinc-500">{subtitle}</p>
      {children}
    </div>
  );
}

function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  disabled = false,
  loading = false,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <div className="mt-10 flex gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-full border border-zinc-300 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Back
        </button>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled || loading}
        className="flex-1 rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-40"
      >
        {loading ? "Please wait…" : nextLabel}
      </button>
    </div>
  );
}

type SelectOption<T extends string> = { value: T; label: string; desc?: string };

function SelectGrid<T extends string>({
  value,
  onChange,
  options,
  cols = 2,
}: {
  value: T | "";
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  cols?: number;
}) {
  const gridClass =
    cols === 4
      ? "grid-cols-2 sm:grid-cols-4"
      : cols === 3
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";
  return (
    <div className={`grid gap-3 ${gridClass}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-xl border-2 p-4 text-left transition-all ${
            value === o.value ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"
          }`}
        >
          <span className="block font-semibold text-zinc-900">{o.label}</span>
          {o.desc ? <p className="mt-1 text-xs text-zinc-500">{o.desc}</p> : null}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-zinc-700">{children}</label>;
}

function TextInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  prefix,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  prefix?: string;
}) {
  const base =
    "w-full rounded-lg border px-4 py-3 text-sm text-zinc-900 outline-none transition focus:ring-1";
  const border = error
    ? "border-red-400 focus:border-red-400 focus:ring-red-400"
    : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900";

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-zinc-500">
            {prefix}
          </span>
        ) : null}
        <input
          type={type}
          inputMode={type === "number" ? "numeric" : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} ${border} ${prefix ? "pl-8" : ""}`}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function ToggleGrid({
  items,
  selected,
  onToggle,
  getIcon,
}: {
  items: { slug: string; label: string }[];
  selected: { slug: string; label: string }[];
  onToggle: (slug: string, label: string) => void;
  getIcon?: (slug: string) => React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => {
        const active = selected.some((s) => s.slug === item.slug);
        const Icon = getIcon?.(item.slug);
        return (
          <button
            key={item.slug}
            type="button"
            onClick={() => onToggle(item.slug, item.label)}
            className={`rounded-xl border-2 px-4 py-3 text-left text-sm transition-all ${
              active ? "border-zinc-900 bg-zinc-50 font-semibold" : "border-zinc-200 hover:border-zinc-400"
            }`}
          >
            {Icon && <Icon size={14} className="mb-1 text-zinc-500" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Steps ───────────────────────────────────────────────────────────────────

function StepType({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const { data: categoryGroups } = useCategories();
  let cats = categoryGroups ?? [];
  if (s.listType === "SELL") cats = cats.filter((c) => c.value !== "SHORT_STAY");

  return (
    <StepShell title="What are you listing?" subtitle="Choose the type, category, and who you are.">
      <div className="space-y-8">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Listing Type</p>
          <SelectGrid value={s.listType} onChange={(v) => set({ listType: v })} options={LIST_TYPES} />
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">You are</p>
          <SelectGrid value={s.listAs} onChange={(v) => set({ listAs: v })} options={LIST_AS} />
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Category</p>
          <SelectGrid
            cols={4}
            value={s.category}
            onChange={(v) => set({ category: v, subCategoryId: undefined })}
            options={cats.map((c) => ({ value: c.value, label: c.name }))}
          />
        </div>

        {s.category ? (
          (() => {
            const group = cats.find((c) => c.value === s.category);
            const subs = group?.subCategories ?? [];
            if (subs.length === 0) return null;
            return (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">Sub-category</p>
                <div className="flex flex-wrap gap-2">
                  {subs.map((sc) => {
                    const SubIcon = getSubCategoryIcon(sc.slug);
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => set({ subCategoryId: sc.id })}
                        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition ${
                          s.subCategoryId === sc.id
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        {SubIcon && <SubIcon size={14} />}
                        {sc.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()
        ) : null}
      </div>
      <NavButtons onNext={() => set({ step: 2 })} disabled={!s.listType || !s.category} />
    </StepShell>
  );
}

function StepDetails({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (s.title.trim().length < 3) e.title = "Title must be at least 3 characters";
    if (s.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    if (!s.price || Number(s.price) <= 0) e.price = "Enter a valid price";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showPriceUnit = s.listType === "RENT" || s.category === "SHORT_STAY";
  const shortStayUnits = PRICE_UNITS.filter((u) => u.value !== "YEAR");
  const rentUnits = PRICE_UNITS.filter((u) => u.value === "YEAR");
  const priceUnitOptions = s.category === "SHORT_STAY" ? shortStayUnits : rentUnits;
  const isLand = s.category === "LAND";

  return (
    <StepShell title="Property Details" subtitle="Describe your property and set your price.">
      <div className="space-y-5">
        <TextInput
          label="Title"
          placeholder="e.g. Modern 3-Bed Apartment in Lekki"
          value={s.title}
          onChange={(v) => { set({ title: v }); setErrors((p) => ({ ...p, title: "" })); }}
          {...(errors.title ? { error: errors.title } : {})}
        />

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            rows={4}
            placeholder="Describe the property, neighborhood, and what makes it special…"
            value={s.description}
            onChange={(e) => { set({ description: e.target.value }); setErrors((p) => ({ ...p, description: "" })); }}
            className={`w-full resize-none rounded-lg border px-4 py-3 text-sm text-zinc-900 outline-none transition focus:ring-1 ${
              errors.description ? "border-red-400 focus:border-red-400" : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
            }`}
          />
          {errors.description ? <p className="mt-1 text-xs text-red-500">{errors.description}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel>Price (₦)</FieldLabel>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-bold text-zinc-500">₦</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={s.price ? Number(s.price).toLocaleString("en-NG") : ""}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  set({ price: raw });
                  setErrors((p) => ({ ...p, price: "" }));
                }}
                className={`w-full rounded-lg border pl-8 pr-4 py-3 text-sm outline-none transition focus:ring-1 ${
                  errors.price ? "border-red-400 focus:border-red-400" : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
                }`}
              />
            </div>
            {errors.price ? <p className="mt-1 text-xs text-red-500">{errors.price}</p> : null}
          </div>

          {showPriceUnit ? (
            <div>
              <FieldLabel>Duration</FieldLabel>
              <select
                value={s.priceUnit}
                onChange={(e) => set({ priceUnit: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">Select period</option>
                {priceUnitOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ) : null}

          {s.listAs === "AGENT" ? (
            <div>
              <FieldLabel>Agency Fee ({s.agencyFee}%)</FieldLabel>
              <input
                type="range"
                min={5}
                max={10}
                step={0.5}
                value={s.agencyFee}
                onChange={(e) => set({ agencyFee: Number(e.target.value) })}
                className="mt-2 w-full cursor-pointer accent-zinc-900"
              />
              {s.price ? (
                <p className="mt-1 text-xs text-zinc-500">
                  Fee: ₦{Math.round(Number(s.price) * s.agencyFee / 100).toLocaleString("en-NG")}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {!isLand ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Furnishing</FieldLabel>
              <select
                value={s.furnishing}
                onChange={(e) => set({ furnishing: e.target.value })}
                className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              >
                <option value="">Select furnishing</option>
                {FURNISHING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {s.category !== "SHORT_STAY" ? (
              <div>
                <FieldLabel>Condition</FieldLabel>
                <select
                  value={s.condition}
                  onChange={(e) => set({ condition: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="">Select condition</option>
                  {CONDITION_OPTIONS.filter((o) =>
                    s.listType === "RENT" ? o.value !== "UNDER_CONSTRUCTION" : true,
                  ).map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        ) : null}

        {s.listType === "SELL" ? (
          <div>
            <FieldLabel>Title Document</FieldLabel>
            <select
              value={s.titleDocument}
              onChange={(e) => set({ titleDocument: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            >
              <option value="">Select document</option>
              {TITLE_DOCUMENTS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <NavButtons
        onBack={() => set({ step: 1 })}
        onNext={() => { if (validate()) set({ step: 3 }); }}
      />
    </StepShell>
  );
}

function StepMetrics({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const isLand = s.category === "LAND";

  return (
    <StepShell title="Property Metrics" subtitle="Enter the specifications of your property.">
      <div className="space-y-5">
        {!isLand ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <TextInput label="Bedrooms" type="number" placeholder="0" value={s.bedrooms} onChange={(v) => set({ bedrooms: v })} />
              <TextInput label="Bathrooms" type="number" placeholder="0" value={s.bathrooms} onChange={(v) => set({ bathrooms: v })} />
              <TextInput label="Toilets" type="number" placeholder="0" value={s.toilets} onChange={(v) => set({ toilets: v })} />
              <TextInput label="Parking Spaces" type="number" placeholder="0" value={s.parkingSpaces} onChange={(v) => set({ parkingSpaces: v })} />
              <TextInput label="Year Built" type="number" placeholder="2024" value={s.yearBuilt} onChange={(v) => set({ yearBuilt: v })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextInput label="Floor Number" type="number" placeholder="0" value={s.floorNumber} onChange={(v) => set({ floorNumber: v })} />
              <TextInput label="Total Floors" type="number" placeholder="0" value={s.totalFloors} onChange={(v) => set({ totalFloors: v })} />
            </div>
          </>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Land Size (sqm)" type="number" placeholder="0" value={s.landSize} onChange={(v) => set({ landSize: v })} />
          {!isLand ? (
            <TextInput label="Building Size (sqm)" type="number" placeholder="0" value={s.buildingSize} onChange={(v) => set({ buildingSize: v })} />
          ) : null}
        </div>
      </div>

      <NavButtons onBack={() => set({ step: 2 })} onNext={() => set({ step: 4 })} />
    </StepShell>
  );
}

function StepLocation({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressSelect = (result: GeocodingResult) => {
    set({
      address: result.formattedAddress,
      city: result.city,
      state: result.state,
      country: result.country,
      placeId: result.placeId,
      latitude: result.lat,
      longitude: result.lng,
    });
    setErrors({});
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!s.address) e.address = "Address is required";
    if (!s.city) e.city = "City is required";
    if (!s.state) e.state = "State is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <StepShell title="Property Location" subtitle="Search for the property address.">
      <div className="space-y-5">
        <div>
          <FieldLabel>Search Address</FieldLabel>
          <AddressAutocomplete
            onSelect={handleAddressSelect}
            defaultValue={s.address}
            placeholder="Start typing an address in Nigeria…"
          />
          {errors.address && !s.address ? <p className="mt-1 text-xs text-red-500">{errors.address}</p> : null}
        </div>

        {s.address ? (
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <h4 className="mb-3 text-sm font-semibold text-zinc-500">Refine Location</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">Address</label>
                <input
                  type="text"
                  value={s.address}
                  onChange={(e) => set({ address: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">City</label>
                <input
                  type="text"
                  value={s.city}
                  onChange={(e) => { set({ city: e.target.value }); setErrors((p) => ({ ...p, city: "" })); }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-1 ${
                    errors.city ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
                  }`}
                />
                {errors.city ? <p className="mt-1 text-xs text-red-500">{errors.city}</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-400">State</label>
                <input
                  type="text"
                  value={s.state}
                  onChange={(e) => { set({ state: e.target.value }); setErrors((p) => ({ ...p, state: "" })); }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-1 ${
                    errors.state ? "border-red-400 focus:border-red-400 focus:ring-red-400" : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900"
                  }`}
                />
                {errors.state ? <p className="mt-1 text-xs text-red-500">{errors.state}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-zinc-400">
                  Extra details <span className="text-zinc-300">(estate name, unit/flat number, landmark)</span>
                </label>
                <input
                  type="text"
                  value={s.addressExtra}
                  onChange={(e) => set({ addressExtra: e.target.value })}
                  placeholder="e.g. Lekki Gardens Estate, Block C, Flat 4"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
              {s.latitude && s.longitude ? (
                <div>
                  <span className="text-xs text-zinc-400">Coordinates</span>
                  <p className="text-sm font-medium text-zinc-500">{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <NavButtons onBack={() => set({ step: 3 })} onNext={() => { if (validate()) set({ step: 5 }); }} />
    </StepShell>
  );
}

function StepFeatures({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const isLand = s.category === "LAND";

  const toggleAmenity = (slug: string, label: string) => {
    const existing = s.amenities.some((a) => a.slug === slug);
    set({ amenities: existing ? s.amenities.filter((a) => a.slug !== slug) : [...s.amenities, { slug, label }] });
  };

  const toggleFacility = (slug: string, label: string) => {
    const existing = s.facilities.some((f) => f.slug === slug);
    set({ facilities: existing ? s.facilities.filter((f) => f.slug !== slug) : [...s.facilities, { slug, label }] });
  };

  return (
    <StepShell title="Features" subtitle={isLand ? "Select estate facilities." : "Select amenities and estate facilities."}>
      <div className="space-y-8">
        {!isLand ? (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Amenities <span className="font-normal normal-case">(property-level)</span>
            </p>
            <ToggleGrid items={AMENITIES} selected={s.amenities} onToggle={toggleAmenity} getIcon={getAmenityIcon} />
          </div>
        ) : null}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Facilities <span className="font-normal normal-case">(estate / building)</span>
          </p>
          <ToggleGrid items={FACILITIES} selected={s.facilities} onToggle={toggleFacility} getIcon={getFacilityIcon} />
        </div>
      </div>

      <NavButtons onBack={() => set({ step: 4 })} onNext={() => set({ step: 6 })} />
    </StepShell>
  );
}

function StepPhotos({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length === 0) return;
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    set({ files: [...s.files, ...selected].slice(0, 20), previews: [...s.previews, ...newPreviews].slice(0, 20) });
  };

  const removeFile = (index: number) => {
    const files = s.files.filter((_, i) => i !== index);
    const previews = s.previews.filter((_, i) => i !== index);
    set({ files, previews });
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current) * 1.5;
  };

  const stopDrag = () => { isDragging.current = false; };

  return (
    <StepShell title="Upload Photos" subtitle="Add up to 20 photos. The first image will be the cover.">
      <div className="flex items-start gap-3">
        {/* Fixed add button — always visible */}
        <label className="flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 transition hover:border-zinc-500">
          <Plus size={28} className="text-zinc-400" />
          <span className="mt-1 text-xs text-zinc-400">Add photo</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleFiles}
          />
        </label>

        {/* Scrollable image strip */}
        <div className="relative min-w-0 flex-1">
          {s.previews.length > 2 ? (
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-md hover:bg-zinc-50"
            >
              <ChevronLeft size={16} />
            </button>
          ) : null}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            {s.previews.map((url, i) => (
              <div key={url} className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover pointer-events-none" />
                {i === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          {s.previews.length > 2 ? (
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-md hover:bg-zinc-50"
            >
              <ChevronRight size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-xs text-zinc-400">Maximum 20 photos. Supported formats: JPEG, PNG, WebP, AVIF</p>

      <NavButtons
        onBack={() => set({ step: 5 })}
        onNext={() => set({ step: 7 })}
        disabled={s.files.length === 0}
      />
    </StepShell>
  );
}

function ReviewRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 py-2.5">
      <span className="shrink-0 text-sm text-zinc-500">{label}</span>
      <span className="min-w-0 wrap-break-word text-right text-sm font-medium text-zinc-900">{value}</span>
    </div>
  );
}

function StepReview({ s, set }: { s: FormState; set: (p: Partial<FormState>) => void }) {
  const router = useRouter();
  const createMut = useCreateListing();
  const uploadMut = useUploadListingImages();
  const publishMut = usePublishListing();
  const busy = createMut.isPending || uploadMut.isPending || publishMut.isPending;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" });
  };

  const handlePublish = async () => {
    if (s.files.length === 0) {
      toast.error("At least one image is required");
      return;
    }
    try {
      const priceNumber = Number(s.price);

      const listing = await createMut.mutateAsync({
        title: s.title,
        description: s.description,
        listType: s.listType,
        category: s.category as "RESIDENTIAL" | "COMMERCIAL" | "LAND" | "SHORT_STAY",
        subCategoryId: s.subCategoryId,
        price: priceNumber,
        currency: "NGN",
        priceUnit: s.priceUnit ? (s.priceUnit as "YEAR" | "MONTH" | "WEEK" | "DAY" | "NIGHT") : undefined,
        address: s.addressExtra ? `${s.address} — ${s.addressExtra}` : s.address,
        city: s.city,
        state: s.state,
        country: s.country,
        latitude: s.latitude,
        longitude: s.longitude,
        placeId: s.placeId,
        bedrooms: s.bedrooms ? Number(s.bedrooms) : undefined,
        bathrooms: s.bathrooms ? Number(s.bathrooms) : undefined,
        toilets: s.toilets ? Number(s.toilets) : undefined,
        parkingSpaces: s.parkingSpaces ? Number(s.parkingSpaces) : undefined,
        yearBuilt: s.yearBuilt ? Number(s.yearBuilt) : undefined,
        floorNumber: s.floorNumber ? Number(s.floorNumber) : undefined,
        totalFloors: s.totalFloors ? Number(s.totalFloors) : undefined,
        landSize: s.landSize ? Number(s.landSize) : undefined,
        buildingSize: s.buildingSize ? Number(s.buildingSize) : undefined,
        listAs: s.listAs,
        agencyFee: s.listAs === "AGENT" ? s.agencyFee : undefined,
        furnishing: s.furnishing ? (s.furnishing as "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED") : undefined,
        condition: s.condition
          ? (s.condition as "NEW" | "RENOVATED" | "FAIRLY_USED" | "OLD" | "UNDER_CONSTRUCTION")
          : undefined,
        titleDocument: s.titleDocument
          ? (s.titleDocument as "c_of_o" | "governors_consent" | "deed_of_assignment" | "registered_survey" | "receipt_of_purchase" | "excision" | "gazette" | "none")
          : undefined,
        amenities: s.amenities.length > 0 ? s.amenities : undefined,
        facilities: s.facilities.length > 0 ? s.facilities : undefined,
      });

      await uploadMut.mutateAsync({ id: listing.id, files: s.files });
      await publishMut.mutateAsync(listing.id);

      toast.success("Listing published!");
      router.push("/dashboard/listings");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish listing");
    }
  };

  return (
    <StepShell title="Review & Publish" subtitle="Make sure everything looks correct before publishing.">
      <div className="space-y-6">
        {s.previews.length > 0 ? (
          <div className="relative">
            {s.previews.length > 3 ? (
              <>
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-md hover:bg-zinc-50"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-zinc-200 bg-white p-1.5 shadow-md hover:bg-zinc-50"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            ) : null}
            <div
              ref={scrollRef}
              className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {s.previews.map((url) => (
                <div key={url} className="h-32 w-32 shrink-0 snap-start overflow-hidden rounded-xl bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-zinc-200 p-5">
          <ReviewRow label="Type" value={s.listType === "RENT" ? "For Rent" : "For Sale"} />
          <ReviewRow label="Category" value={s.category} />
          <ReviewRow label="Title" value={s.title} />
          <ReviewRow
            label="Price"
            value={`₦${Number(s.price).toLocaleString("en-NG")}${s.priceUnit ? ` / ${s.priceUnit.toLowerCase()}` : ""}`}
          />
          <ReviewRow label="Location" value={s.city && s.state ? `${s.city}, ${s.state}` : undefined} />
          <ReviewRow label="Address" value={s.address} />
          {s.bedrooms ? <ReviewRow label="Bedrooms" value={s.bedrooms} /> : null}
          {s.bathrooms ? <ReviewRow label="Bathrooms" value={s.bathrooms} /> : null}
          {s.furnishing ? <ReviewRow label="Furnishing" value={s.furnishing.replace(/_/g, " ")} /> : null}
          {s.condition ? <ReviewRow label="Condition" value={s.condition.replace(/_/g, " ")} /> : null}
          {s.amenities.length > 0 ? (
            <ReviewRow label="Amenities" value={s.amenities.map((a) => a.label).join(", ")} />
          ) : null}
          {s.facilities.length > 0 ? (
            <ReviewRow label="Facilities" value={s.facilities.map((f) => f.label).join(", ")} />
          ) : null}
          <ReviewRow label="Photos" value={`${s.files.length} image${s.files.length !== 1 ? "s" : ""}`} />
        </div>
      </div>

      <NavButtons
        onBack={() => set({ step: 6 })}
        onNext={handlePublish}
        nextLabel={busy ? "Publishing…" : "Publish Listing"}
        disabled={busy}
        loading={busy}
      />
    </StepShell>
  );
}

// ─── Wizard Shell ────────────────────────────────────────────────────────────

export function ListWizard() {
  const meQuery = useMe();
  const [form, setFormRaw] = useState<FormState>(initialState);

  const set = (patch: Partial<FormState>) => setFormRaw((prev) => ({ ...prev, ...patch }));

  if (!meQuery.isLoading && !meQuery.data) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <h2 className="mb-3 text-xl font-bold text-zinc-900">Sign in required</h2>
          <p className="mb-6 text-sm text-zinc-600">
            To list your property on <strong>Lynue</strong>, please sign in or create an account.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block w-full rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const stepMap: Record<number, React.ReactNode> = {
    1: <StepType s={form} set={set} />,
    2: <StepDetails s={form} set={set} />,
    3: <StepMetrics s={form} set={set} />,
    4: <StepLocation s={form} set={set} />,
    5: <StepFeatures s={form} set={set} />,
    6: <StepPhotos s={form} set={set} />,
    7: <StepReview s={form} set={set} />,
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-8 lg:px-8">
        {/* Step progress */}
        <div className="mx-auto mb-12 max-w-2xl">
          <div className="flex w-full items-center">
            {STEPS.map((step, i) => (
              <Fragment key={step.id}>
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      form.step >= step.id ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-500"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="mt-1 hidden text-xs text-zinc-500 sm:block">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 ${form.step > step.id ? "bg-zinc-900" : "bg-zinc-200"}`}
                  />
                )}
              </Fragment>
            ))}
          </div>
        </div>

        {stepMap[form.step]}
      </div>
    </div>
  );
}
