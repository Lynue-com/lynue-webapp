"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Loader2, ArrowLeft } from "lucide-react";
import type { z } from "zod";
import { useCategories } from "@/queries/use-list-manage";
import {
  updateListing,
  uploadListingImagesForEdit,
  deleteListingImage,
} from "@/features/list-manage/api/list-edit-api";
import type { listingSchema } from "@/features/listings/model/schemas";
import {
  FURNISHING_OPTIONS,
  CONDITION_OPTIONS,
  TITLE_DOCUMENTS,
  PRICE_UNITS,
  LIST_AS,
  AMENITIES,
  FACILITIES,
} from "@/features/list-manage/model/list-form-options";

// ─── Constants ───────────────────────────────────────────────────────────────

// ─── Shared UI ───────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm outline-none transition-colors focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 bg-white text-zinc-900";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-zinc-900">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      {children}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Listing = z.infer<typeof listingSchema> & Record<string, unknown>;

type ListingImage = { id?: string; url: string };

type FormState = Record<string, string | number | boolean | undefined>;

// ─── Component ───────────────────────────────────────────────────────────────

export function EditListingForm({ listing }: { listing: z.infer<typeof listingSchema> }) {
  const full = listing as Listing;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categoryGroups } = useCategories();

  const [form, setFormState] = useState<FormState>(() => ({
    title: full.title ?? "",
    description: typeof full.description === "string" ? full.description : "",
    listType: full.listType,
    category: typeof full.category === "string" ? full.category : "",
    subCategoryId:
      typeof full.subCategory === "object" &&
      full.subCategory !== null &&
      "id" in (full.subCategory as object)
        ? (full.subCategory as { id: number }).id
        : undefined,
    price: full.price ?? "",
    priceUnit: typeof full.priceUnit === "string" ? full.priceUnit : "",
    listAs: typeof full.listAs === "string" ? full.listAs : "OWNER",
    bedrooms: full.bedrooms ?? "",
    bathrooms: full.bathrooms ?? "",
    toilets: typeof full.toilets === "number" ? full.toilets : "",
    parkingSpaces: full.parkingSpaces ?? "",
    yearBuilt: typeof full.yearBuilt === "number" ? full.yearBuilt : "",
    floorNumber: typeof full.floorNumber === "number" ? full.floorNumber : "",
    totalFloors: typeof full.totalFloors === "number" ? full.totalFloors : "",
    landSize: typeof full.landSize === "number" ? full.landSize : "",
    buildingSize: typeof full.buildingSize === "number" ? full.buildingSize : "",
    address: typeof full.address === "string" ? full.address : "",
    city: full.city ?? "",
    state: full.state ?? "",
    furnishing: typeof full.furnishing === "string" ? full.furnishing : "",
    condition: typeof full.condition === "string" ? full.condition : "",
    titleDocument: typeof full.titleDocument === "string" ? full.titleDocument : "",
  }));
  const [amenities, setAmenities] = useState<{ slug: string; label: string }[]>(
    Array.isArray(full.amenities) ? (full.amenities as { slug: string; label: string }[]) : [],
  );
  const [facilities, setFacilities] = useState<{ slug: string; label: string }[]>(
    Array.isArray(full.facilities)
      ? (full.facilities as { slug: string; label: string }[])
      : [],
  );
  const [existingImages, setExistingImages] = useState<ListingImage[]>(listing.images as ListingImage[]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [newPreviews]);

  const setField = (key: string, value: string | number | boolean | undefined) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleAmenity = (slug: string, label: string) => {
    setAmenities((prev) =>
      prev.some((a) => a.slug === slug)
        ? prev.filter((a) => a.slug !== slug)
        : [...prev, { slug, label }],
    );
  };

  const toggleFacility = (slug: string, label: string) => {
    setFacilities((prev) =>
      prev.some((f) => f.slug === slug)
        ? prev.filter((f) => f.slug !== slug)
        : [...prev, { slug, label }],
    );
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const remaining = 20 - existingImages.length - newFiles.length;
    const allowed = files.slice(0, Math.max(0, remaining));
    if (allowed.length < files.length) {
      toast.error(`Maximum 20 images. Only ${allowed.length} added.`);
    }
    const previews = allowed.map((f) => URL.createObjectURL(f));
    setNewFiles((prev) => [...prev, ...allowed]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewFile = (index: number) => {
    const url = newPreviews[index];
    if (url) URL.revokeObjectURL(url);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteMutation = useMutation({
    mutationFn: ({ imageId }: { imageId: string }) =>
      deleteListingImage(listing.id, imageId),
    onSuccess: (_data, variables) => {
      setExistingImages((prev) => prev.filter((img) => img.id !== variables.imageId));
      toast.success("Image removed");
    },
    onError: () => toast.error("Failed to remove image"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateListing(listing.id, payload),
    onSuccess: async () => {
      if (newFiles.length > 0) {
        try {
          await uploadListingImagesForEdit(listing.id, newFiles);
        } catch {
          toast.error("Listing saved but some images failed to upload");
        }
      }
      toast.success("Listing updated!");
      await queryClient.invalidateQueries({ queryKey: ["dashboard", "my-listings"] });
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
      router.push("/dashboard/listings");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Failed to update listing"),
  });

  const handleSave = () => {
    const payload: Record<string, unknown> = { ...form, amenities, facilities };
    // Coerce numeric strings from inputs back to numbers
    for (const key of [
      "price",
      "bedrooms",
      "bathrooms",
      "toilets",
      "parkingSpaces",
      "yearBuilt",
      "floorNumber",
      "totalFloors",
      "landSize",
      "buildingSize",
      "subCategoryId",
    ]) {
      if (payload[key] === "" || payload[key] === undefined) {
        delete payload[key];
      } else if (typeof payload[key] === "string" && payload[key] !== "") {
        const n = Number(payload[key]);
        if (!Number.isNaN(n)) payload[key] = n;
      }
    }
    updateMutation.mutate(payload);
  };

  const busy = updateMutation.isPending;
  const isLand = form.category === "LAND";
  const subCategories =
    categoryGroups?.find((g) => g.value === form.category)?.subCategories ?? [];

  return (
    <div className="max-w-3xl pb-20">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg p-2 transition-colors hover:bg-zinc-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Edit Listing</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{listing.title}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ── Photos ─────────────────────────────────────────────── */}
        <Section title="Photos">
          <div className="flex flex-wrap gap-3">
            {/* Existing images */}
            {existingImages.map((img, i) => (
              <div
                key={img.id ?? img.url}
                className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100"
              >
                <Image
                  src={img.url}
                  alt="Listing image"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
                {i === 0 ? (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
                    Cover
                  </span>
                ) : null}
                {img.id ? (
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate({ imageId: img.id! })}
                    disabled={deleteMutation.isPending}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100 disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                ) : null}
              </div>
            ))}

            {/* New file previews */}
            {newPreviews.map((url, i) => (
              <div
                key={url}
                className="group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50"
              >
                <Image
                  src={url}
                  alt="New listing image"
                  fill
                  sizes="112px"
                  unoptimized
                  className="object-cover"
                />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  New
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveNewFile(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Add button */}
            {existingImages.length + newFiles.length < 20 ? (
              <label className="flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 transition-colors hover:border-zinc-400">
                <Plus size={24} className="text-zinc-400" />
                <span className="mt-1 text-xs text-zinc-400">Add</span>
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={handleAddFiles}
                />
              </label>
            ) : null}
          </div>
        </Section>

        {/* ── Basic Info ─────────────────────────────────────────── */}
        <Section title="Basic Information">
          <div className="space-y-4">
            <Field label="Title">
              <input
                type="text"
                value={String(form.title ?? "")}
                onChange={(e) => setField("title", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={4}
                value={String(form.description ?? "")}
                onChange={(e) => setField("description", e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="List Type">
                <select
                  value={String(form.listType ?? "")}
                  onChange={(e) => setField("listType", e.target.value)}
                  className={inputClass}
                >
                  <option value="RENT">For Rent</option>
                  <option value="SELL">For Sale</option>
                </select>
              </Field>

              <Field label="Category">
                <select
                  value={String(form.category ?? "")}
                  onChange={(e) => {
                    setField("category", e.target.value);
                    setField("subCategoryId", undefined);
                  }}
                  className={inputClass}
                >
                  <option value="RESIDENTIAL">Residential</option>
                  <option value="COMMERCIAL">Commercial</option>
                  <option value="LAND">Land</option>
                  <option value="SHORT_STAY">Short Stay</option>
                </select>
              </Field>
            </div>

            {subCategories.length > 0 ? (
              <Field label="Subcategory">
                <select
                  value={form.subCategoryId != null ? String(form.subCategoryId) : ""}
                  onChange={(e) =>
                    setField(
                      "subCategoryId",
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  className={inputClass}
                >
                  <option value="">Select subcategory</option>
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </div>
        </Section>

        {/* ── Pricing ────────────────────────────────────────────── */}
        <Section title="Pricing">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₦)">
              <input
                type="number"
                value={form.price != null ? String(form.price) : ""}
                onChange={(e) =>
                  setField("price", e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputClass}
              />
            </Field>

            {form.listType === "RENT" ? (
              <Field label="Price Period">
                <select
                  value={String(form.priceUnit ?? "")}
                  onChange={(e) => setField("priceUnit", e.target.value || undefined)}
                  className={inputClass}
                >
                  <option value="">Select period</option>
                  {PRICE_UNITS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}

            <Field label="List As">
              <select
                value={String(form.listAs ?? "OWNER")}
                onChange={(e) => setField("listAs", e.target.value)}
                className={inputClass}
              >
                {LIST_AS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        {/* ── Property Metrics ───────────────────────────────────── */}
        {!isLand ? (
          <Section title="Property Metrics">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {(
                [
                  ["bedrooms", "Bedrooms"],
                  ["bathrooms", "Bathrooms"],
                  ["toilets", "Toilets"],
                  ["parkingSpaces", "Parking Spaces"],
                  ["yearBuilt", "Year Built"],
                  ["buildingSize", "Building Size (sqm)"],
                ] as [string, string][]
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    type="number"
                    value={form[key] != null ? String(form[key]) : ""}
                    onChange={(e) =>
                      setField(key, e.target.value ? Number(e.target.value) : undefined)
                    }
                    className={inputClass}
                  />
                </Field>
              ))}
            </div>
          </Section>
        ) : null}

        {/* ── Land & Floor ───────────────────────────────────────── */}
        <Section title="Land & Floor">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Land Size (sqm)">
              <input
                type="number"
                value={form.landSize != null ? String(form.landSize) : ""}
                onChange={(e) =>
                  setField("landSize", e.target.value ? Number(e.target.value) : undefined)
                }
                className={inputClass}
              />
            </Field>
            {!isLand ? (
              <>
                <Field label="Floor Number">
                  <input
                    type="number"
                    value={form.floorNumber != null ? String(form.floorNumber) : ""}
                    onChange={(e) =>
                      setField(
                        "floorNumber",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Total Floors">
                  <input
                    type="number"
                    value={form.totalFloors != null ? String(form.totalFloors) : ""}
                    onChange={(e) =>
                      setField(
                        "totalFloors",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={inputClass}
                  />
                </Field>
              </>
            ) : null}
          </div>
        </Section>

        {/* ── Location ───────────────────────────────────────────── */}
        <Section title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address" className="sm:col-span-2">
              <input
                type="text"
                value={String(form.address ?? "")}
                onChange={(e) => setField("address", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="City">
              <input
                type="text"
                value={String(form.city ?? "")}
                onChange={(e) => setField("city", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="State">
              <input
                type="text"
                value={String(form.state ?? "")}
                onChange={(e) => setField("state", e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        {/* ── Property Details ───────────────────────────────────── */}
        {!isLand ? (
          <Section title="Property Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Furnishing">
                <select
                  value={String(form.furnishing ?? "")}
                  onChange={(e) => setField("furnishing", e.target.value || undefined)}
                  className={inputClass}
                >
                  <option value="">Select furnishing</option>
                  {FURNISHING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Condition">
                <select
                  value={String(form.condition ?? "")}
                  onChange={(e) => setField("condition", e.target.value || undefined)}
                  className={inputClass}
                >
                  <option value="">Select condition</option>
                  {CONDITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            {form.listType === "SELL" ? (
              <div className="mt-4">
                <Field label="Title Document">
                  <select
                    value={String(form.titleDocument ?? "")}
                    onChange={(e) => setField("titleDocument", e.target.value || undefined)}
                    className={inputClass}
                  >
                    <option value="">Select document</option>
                    {TITLE_DOCUMENTS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : null}
          </Section>
        ) : null}

        {/* ── Features ───────────────────────────────────────────── */}
        <Section title="Features">
          {!isLand ? (
            <div className="mb-6">
              <h4 className="mb-3 text-sm font-medium text-zinc-600">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {AMENITIES.map((item) => {
                  const active = amenities.some((a) => a.slug === item.slug);
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      onClick={() => toggleAmenity(item.slug, item.label)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-300 text-zinc-600 hover:border-zinc-500"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          <div>
            <h4 className="mb-3 text-sm font-medium text-zinc-600">Facilities</h4>
            <div className="flex flex-wrap gap-2">
              {FACILITIES.map((item) => {
                const active = facilities.some((f) => f.slug === item.slug);
                return (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => toggleFacility(item.slug, item.label)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 text-zinc-600 hover:border-zinc-500"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ── Save bar ───────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="flex items-center gap-2 rounded-full bg-zinc-900 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : null}
            {busy ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
