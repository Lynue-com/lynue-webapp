import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const { backMock, pushMock } = vi.hoisted(() => ({
  backMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: backMock, push: pushMock }),
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- plain stub for tests
    <img src={src} alt={alt ?? ""} />
  ),
}));

vi.mock("@/queries/use-list-manage", () => ({
  useCategories: vi.fn(),
  useListingForEdit: vi.fn(),
}));

vi.mock("@/features/list-manage/api/list-edit-api", () => ({
  updateListing: vi.fn(),
  uploadListingImagesForEdit: vi.fn(),
  deleteListingImage: vi.fn(),
}));

import { EditListingForm } from "@/features/list-manage/components/edit-listing-form";
import { useCategories } from "@/queries/use-list-manage";
import { updateListing } from "@/features/list-manage/api/list-edit-api";
import { toast } from "sonner";

type Listing = ComponentProps<typeof EditListingForm>["listing"];

const categories = [
  {
    value: "RESIDENTIAL",
    name: "Residential",
    slug: "residential",
    subCategories: [
      { id: 1, name: "Apartment", slug: "apartment" },
      { id: 2, name: "Duplex", slug: "duplex" },
    ],
  },
  {
    value: "COMMERCIAL",
    name: "Commercial",
    slug: "commercial",
    subCategories: [
      { id: 4, name: "Office", slug: "office" },
      { id: 5, name: "Shop", slug: "shop" },
    ],
  },
  {
    value: "LAND",
    name: "Land",
    slug: "land",
    subCategories: [{ id: 7, name: "Plot", slug: "plot" }],
  },
  {
    value: "SHORT_STAY",
    name: "Short Stay",
    slug: "short-stay",
    subCategories: [{ id: 9, name: "Studio", slug: "studio" }],
  },
];

const shortStayListing: Listing = {
  id: "listing-1",
  slug: "cozy-studio-in-lekki",
  title: "Cozy Studio in Lekki",
  description: "A lovely short stay studio close to the beach.",
  listType: "RENT",
  category: "SHORT_STAY",
  city: "Lagos",
  state: "Lagos",
  price: 120000,
  priceUnit: "DAY",
  address: "12 Admiralty Way, Lekki",
  bedrooms: 1,
  bathrooms: 1,
  createdAt: "2024-03-10T00:00:00Z",
  images: [{ id: "img-1", url: "/images/placeholder.webp" }],
  subCategory: { id: 9, name: "Studio", slug: "studio" },
  amenities: [{ slug: "wifi", label: "Wi-Fi" }],
  facilities: [{ slug: "security-gate", label: "Security Gate" }],
};

const sellListing: Listing = {
  ...shortStayListing,
  id: "listing-2",
  slug: "office-space-on-opebi-road",
  title: "Office Space on Opebi Road",
  description: "A serviced commercial space on Opebi Road.",
  listType: "SELL",
  category: "COMMERCIAL",
  price: 85000000,
  priceUnit: null,
  subCategory: { id: 4, name: "Office", slug: "office" },
  images: [],
};

function renderForm(listing: Listing) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EditListingForm listing={listing} />
    </QueryClientProvider>,
  );
}

/** The Field component renders <label> + control as siblings. */
function getFieldSelect(label: string) {
  const select = screen.getByText(label).nextElementSibling;
  if (!(select instanceof HTMLSelectElement)) {
    throw new Error(`no select found for "${label}"`);
  }
  return select;
}

function categoryOptionValues() {
  return Array.from(getFieldSelect("Category").options).map((o) => o.value);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCategories).mockReturnValue({
    data: categories,
  } as unknown as ReturnType<typeof useCategories>);
  vi.mocked(updateListing).mockResolvedValue(shortStayListing);
});

describe("EditListingForm - list type / category guards", () => {
  it("hides the Short Stay category for SELL listings", () => {
    renderForm(sellListing);

    expect(categoryOptionValues()).toEqual(["", "RESIDENTIAL", "COMMERCIAL", "LAND"]);
    expect(getFieldSelect("Category").value).toBe("COMMERCIAL");
  });

  it("offers Short Stay and its subcategory for RENT listings", () => {
    renderForm(shortStayListing);

    expect(categoryOptionValues()).toContain("SHORT_STAY");
    expect(getFieldSelect("Category").value).toBe("SHORT_STAY");

    const subcategory = getFieldSelect("Subcategory");
    expect(subcategory.value).toBe("9");
    expect(Array.from(subcategory.options).map((o) => o.textContent)).toContain(
      "Studio",
    );
  });

  it("clears a stale SHORT_STAY category when the type flips to SELL", async () => {
    renderForm(shortStayListing);

    fireEvent.change(getFieldSelect("List Type"), { target: { value: "SELL" } });

    // stale SHORT_STAY state is cleared, like in the wizard
    expect(getFieldSelect("Category").value).toBe("");
    expect(categoryOptionValues()).not.toContain("SHORT_STAY");
    expect(screen.queryByText("Subcategory")).toBeNull();
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeDisabled();

    // picking a sellable category re-enables saving
    fireEvent.change(getFieldSelect("Category"), {
      target: { value: "COMMERCIAL" },
    });
    expect(screen.getByRole("button", { name: "Save Changes" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(updateListing).toHaveBeenCalledTimes(1));
    const [id, payload] = vi.mocked(updateListing).mock.calls[0]!;
    expect(id).toBe("listing-1");
    expect(payload).toMatchObject({ listType: "SELL", category: "COMMERCIAL" });
    expect(payload.subCategoryId).toBeUndefined();

    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/dashboard/listings"),
    );
    expect(toast.success).toHaveBeenCalledWith("Listing updated!");
  });

  it("drops empty optional enums from the save payload", async () => {
    renderForm(sellListing);

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));

    await waitFor(() => expect(updateListing).toHaveBeenCalledTimes(1));
    const payload = vi.mocked(updateListing).mock.calls[0]![1];
    expect(payload).not.toHaveProperty("priceUnit");
    expect(payload).not.toHaveProperty("furnishing");
    expect(payload).not.toHaveProperty("condition");
    expect(payload).not.toHaveProperty("titleDocument");
  });
});