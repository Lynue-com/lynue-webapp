import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/queries/use-auth", () => ({ useMe: vi.fn() }));

vi.mock("@/queries/use-list-manage", () => ({
  useCategories: vi.fn(),
  useCreateListing: vi.fn(),
  useUploadListingImages: vi.fn(),
  usePublishListing: vi.fn(),
}));

vi.mock("@/shared/ui/address-autocomplete", () => ({
  AddressAutocomplete: ({
    onSelect,
    placeholder,
  }: {
    onSelect: (r: {
      lat: number;
      lng: number;
      placeId: string;
      formattedAddress: string;
      city: string;
      state: string;
      country: string;
    }) => void;
    placeholder?: string;
  }) => (
    <input
      data-testid="address-search"
      placeholder={placeholder}
      onChange={(e) => {
        const value = e.target.value;
        if (!value) return;
        onSelect({
          lat: 6.4299,
          lng: 3.4139,
          placeId: "place-1",
          formattedAddress: value,
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
        });
      }}
    />
  ),
}));

import { ListWizard } from "@/features/list-manage/components/list-wizard";
import { useMe } from "@/queries/use-auth";
import {
  useCategories,
  useCreateListing,
  useUploadListingImages,
  usePublishListing,
} from "@/queries/use-list-manage";
import { toast } from "sonner";

const createListingMock = vi.fn();
const uploadMock = vi.fn();
const publishMock = vi.fn();

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

function clickButton(name: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name }));
}

function fillDetails(title: string, price: string) {
  fireEvent.change(screen.getByPlaceholderText("e.g. Modern 3-Bed Apartment in Lekki"), {
    target: { value: title },
  });
  fireEvent.change(screen.getByPlaceholderText(/Describe the property/), {
    target: { value: "A beautiful property close to major landmarks and roads." },
  });
  fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: price } });
}

function goToMetricsAndLocation() {
  // step 2 → step 3
  clickButton("Continue");
  expect(screen.getByRole("heading", { name: "Property Metrics" })).toBeInTheDocument();
  // step 3 → step 4
  clickButton("Continue");
  expect(screen.getByRole("heading", { name: "Property Location" })).toBeInTheDocument();
}

function fillLocationAndGoToPhotos() {
  fireEvent.change(screen.getByTestId("address-search"), {
    target: { value: "12 Admiralty Way, Lekki" },
  });
  clickButton("Continue");
  expect(screen.getByRole("heading", { name: "Features" })).toBeInTheDocument();
  clickButton("Wi-Fi");
  clickButton("Security Gate");
  clickButton("Continue");
  expect(screen.getByRole("heading", { name: "Upload Photos" })).toBeInTheDocument();
}

function uploadOnePhoto(): File {
  const input = document.querySelector('input[type="file"]');
  if (!input) throw new Error("photo file input not found");
  const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });
  Object.defineProperty(input, "files", { configurable: true, value: [file] });
  fireEvent.change(input);
  return file;
}

function expectPublishCallsSucceeded() {
  expect(createListingMock).toHaveBeenCalledTimes(1);
  expect(uploadMock).toHaveBeenCalledWith({ id: "listing-99", files: [expect.any(File)] });
  expect(publishMock).toHaveBeenCalledWith("listing-99");
  expect(toast.success).toHaveBeenCalledWith("Listing published!");
  expect(pushMock).toHaveBeenCalledWith("/dashboard/listings");

  const createOrder = createListingMock.mock.invocationCallOrder[0]!;
  const uploadOrder = uploadMock.mock.invocationCallOrder[0]!;
  const publishOrder = publishMock.mock.invocationCallOrder[0]!;
  expect(createOrder).toBeLessThan(uploadOrder);
  expect(uploadOrder).toBeLessThan(publishOrder);
}

beforeAll(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: vi.fn(() => "blob:mock-preview"),
  });
});

beforeEach(() => {
  vi.clearAllMocks();
  pushMock.mockReset();
  vi.mocked(useMe).mockReturnValue({
    isLoading: false,
    data: { id: "u1", email: "ada@example.com" },
  } as unknown as ReturnType<typeof useMe>);
  vi.mocked(useCategories).mockReturnValue({
    data: categories,
  } as unknown as ReturnType<typeof useCategories>);
  vi.mocked(useCreateListing).mockReturnValue({
    mutateAsync: createListingMock,
    isPending: false,
  } as unknown as ReturnType<typeof useCreateListing>);
  vi.mocked(useUploadListingImages).mockReturnValue({
    mutateAsync: uploadMock,
    isPending: false,
  } as unknown as ReturnType<typeof useUploadListingImages>);
  vi.mocked(usePublishListing).mockReturnValue({
    mutateAsync: publishMock,
    isPending: false,
  } as unknown as ReturnType<typeof usePublishListing>);
  createListingMock.mockResolvedValue({ id: "listing-99" });
  uploadMock.mockResolvedValue(undefined);
  publishMock.mockResolvedValue(undefined);
});

describe("ListWizard - full /list flow", () => {
  it("completes a RENT listing end to end: type → subcategory → details → photos → publish", async () => {
    render(<ListWizard />);

    // step 1 — type, category, subcategory
    expect(screen.getByRole("heading", { name: "What are you listing?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    clickButton("Residential");
    clickButton("Apartment");
    clickButton("Continue");

    // step 2 — details with rent price unit
    expect(screen.getByRole("heading", { name: "Property Details" })).toBeInTheDocument();
    fillDetails("Modern 3BR Apartment in VI", "2500000");
    const durationSelect = screen.getAllByRole("combobox")[0];
    if (!durationSelect) throw new Error("duration select not found");
    fireEvent.change(durationSelect, { target: { value: "YEAR" } });

    goToMetricsAndLocation();
    fillLocationAndGoToPhotos();

    // step 6 — photos: next stays disabled until a file is added
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    uploadOnePhoto();
    expect(screen.getByText("Cover")).toBeInTheDocument();
    clickButton("Continue");

    // step 7 — review & publish
    expect(screen.getByRole("heading", { name: "Review & Publish" })).toBeInTheDocument();
    expect(screen.getByText("For Rent")).toBeInTheDocument();
    expect(screen.getByText(/₦2,500,000 \/ year/)).toBeInTheDocument();
    expect(screen.getByText("1 image")).toBeInTheDocument();
    clickButton("Publish Listing");

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/listings"));

    const payload = createListingMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      listType: "RENT",
      category: "RESIDENTIAL",
      subCategoryId: 1,
      price: 2500000,
      priceUnit: "YEAR",
      address: "12 Admiralty Way, Lekki",
      city: "Lagos",
      state: "Lagos",
    });
    expect(payload.amenities).toEqual([{ slug: "wi-fi", label: "Wi-Fi" }]);
    expect(payload.facilities).toEqual([{ slug: "security-gate", label: "Security Gate" }]);
    expectPublishCallsSucceeded();
  });

  it("completes a SELL listing end to end and hides short-stay categories", async () => {
    render(<ListWizard />);

    // step 1 — switch to SELL
    clickButton(/^Sell/);
    expect(screen.queryByRole("button", { name: "Short Stay" })).toBeNull();
    clickButton("Commercial");
    clickButton("Office");
    clickButton("Continue");

    // step 2 — sell listings have no rental duration
    expect(screen.getByRole("heading", { name: "Property Details" })).toBeInTheDocument();
    expect(screen.queryByText("Duration")).toBeNull();
    expect(screen.getByText("Title Document")).toBeInTheDocument();
    fillDetails("Corner Office Space in Lekki", "85000000");

    goToMetricsAndLocation();
    fillLocationAndGoToPhotos();

    // step 6 — photos
    uploadOnePhoto();
    clickButton("Continue");

    // step 7 — review & publish
    expect(screen.getByRole("heading", { name: "Review & Publish" })).toBeInTheDocument();
    expect(screen.getByText("For Sale")).toBeInTheDocument();
    expect(screen.getByText("1 image")).toBeInTheDocument();
    clickButton("Publish Listing");

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/listings"));

    const payload = createListingMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      listType: "SELL",
      category: "COMMERCIAL",
      subCategoryId: 4,
      price: 85000000,
    });
    expect(payload.priceUnit).toBeUndefined();
    expectPublishCallsSucceeded();
  });

  it("completes a RENT SHORT_STAY listing with day/week/month units and no condition field", async () => {
    render(<ListWizard />);

    // step 1 — Short Stay category (RENT only)
    clickButton("Short Stay");
    clickButton("Studio");
    clickButton("Continue");

    // step 2 — short stays never rent per year and have no condition select
    expect(screen.getByRole("heading", { name: "Property Details" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Per Year" })).toBeNull();
    expect(screen.getByRole("option", { name: "Per Month" })).toBeInTheDocument();
    expect(screen.queryByText("Condition")).toBeNull();
    expect(screen.getByText("Furnishing")).toBeInTheDocument();

    fillDetails("Cozy Studio in Lekki", "120000");
    const durationSelect = screen.getAllByRole("combobox")[0];
    if (!durationSelect) throw new Error("duration select not found");
    fireEvent.change(durationSelect, { target: { value: "MONTH" } });

    goToMetricsAndLocation();
    fillLocationAndGoToPhotos();
    uploadOnePhoto();
    clickButton("Continue");

    // step 7 — review & publish
    expect(screen.getByRole("heading", { name: "Review & Publish" })).toBeInTheDocument();
    expect(screen.getByText(/₦120,000 \/ month/)).toBeInTheDocument();
    clickButton("Publish Listing");

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/listings"));

    const payload = createListingMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      listType: "RENT",
      category: "SHORT_STAY",
      subCategoryId: 9,
      price: 120000,
      priceUnit: "MONTH",
    });
    expect(payload.condition).toBeUndefined();
    expectPublishCallsSucceeded();
  });

  it("adapts every step to a LAND listing: land size only, no building fields, no amenities", async () => {
    render(<ListWizard />);

    // step 1 — Land + Plot subcategory
    clickButton("Land");
    clickButton("Plot");
    clickButton("Continue");

    // step 2 — land has no furnishing/condition block, and RENT has no title document
    expect(screen.getByRole("heading", { name: "Property Details" })).toBeInTheDocument();
    expect(screen.queryByText("Furnishing")).toBeNull();
    expect(screen.queryByText("Condition")).toBeNull();
    expect(screen.queryByText("Title Document")).toBeNull();
    fillDetails("Serviced Plot in Ikoyi", "45000000");

    // step 3 — only land size, no bedrooms/bathrooms grid
    clickButton("Continue");
    expect(screen.getByRole("heading", { name: "Property Metrics" })).toBeInTheDocument();
    expect(screen.queryByText("Bedrooms")).toBeNull();
    expect(screen.getByText("Land Size (sqm)")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("0"), { target: { value: "500" } });
    clickButton("Continue");
    expect(screen.getByRole("heading", { name: "Property Location" })).toBeInTheDocument();

    // step 4 — location
    fireEvent.change(screen.getByTestId("address-search"), {
      target: { value: "12 Admiralty Way, Lekki" },
    });
    clickButton("Continue");

    // step 5 — facilities only, no property-level amenities
    expect(screen.getByRole("heading", { name: "Features" })).toBeInTheDocument();
    expect(screen.getByText(/Select estate facilities\./)).toBeInTheDocument();
    expect(screen.queryByText(/property-level/)).toBeNull();
    clickButton("Security Gate");
    clickButton("Continue");

    // step 6 — photos
    expect(screen.getByRole("heading", { name: "Upload Photos" })).toBeInTheDocument();
    uploadOnePhoto();
    clickButton("Continue");

    // step 7 — publish
    expect(screen.getByRole("heading", { name: "Review & Publish" })).toBeInTheDocument();
    clickButton("Publish Listing");
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard/listings"));

    const payload = createListingMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).toMatchObject({
      listType: "RENT",
      category: "LAND",
      subCategoryId: 7,
      price: 45000000,
      landSize: 500,
    });
    expect(payload.bedrooms).toBeUndefined();
    expect(payload.amenities).toBeUndefined();
    expect(payload.facilities).toEqual([{ slug: "security-gate", label: "Security Gate" }]);
    expectPublishCallsSucceeded();
  });

  it("clears a stale SHORT_STAY category when the type flips to SELL", () => {
    render(<ListWizard />);

    // pick Short Stay first, then switch to SELL — the category is no longer sellable
    clickButton("Short Stay");
    clickButton("Studio");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();

    clickButton(/^Sell/);

    expect(screen.queryByRole("button", { name: "Short Stay" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Studio" })).toBeNull();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();

    // picking a sellable category re-enables progression
    clickButton("Commercial");
    expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
  });

  it("blocks the details step until title, description, and price are valid", () => {
    render(<ListWizard />);
    clickButton("Residential");
    clickButton("Continue");

    expect(screen.getByRole("heading", { name: "Property Details" })).toBeInTheDocument();
    clickButton("Continue");

    expect(screen.getByText("Title must be at least 3 characters")).toBeInTheDocument();
    expect(screen.getByText("Description must be at least 10 characters")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid price")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Property Details" })).toBeInTheDocument();
  });

  it("blocks the location step until an address is chosen", () => {
    render(<ListWizard />);
    clickButton("Residential");
    clickButton("Continue");
    fillDetails("Proper Title Here", "1000000");
    goToMetricsAndLocation();

    clickButton("Continue");
    expect(screen.getByText("Address is required")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Property Location" })).toBeInTheDocument();
  });

  it("shows the sign-in gate when the user is not authenticated", () => {
    vi.mocked(useMe).mockReturnValue({
      isLoading: false,
      data: undefined,
    } as unknown as ReturnType<typeof useMe>);

    render(<ListWizard />);

    expect(screen.getByText("Sign in required")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/auth/signin");
    expect(screen.queryByRole("heading", { name: "What are you listing?" })).toBeNull();
  });

  it("shows an error toast and stays on review when publishing fails", async () => {
    createListingMock.mockRejectedValue(new Error("Server exploded"));
    render(<ListWizard />);

    clickButton("Residential");
    clickButton("Apartment");
    clickButton("Continue");
    fillDetails("Modern 3BR Apartment in VI", "2500000");
    goToMetricsAndLocation();
    fillLocationAndGoToPhotos();
    uploadOnePhoto();
    clickButton("Continue");

    expect(screen.getByRole("heading", { name: "Review & Publish" })).toBeInTheDocument();
    clickButton("Publish Listing");

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Server exploded"));
    expect(pushMock).not.toHaveBeenCalled();
    expect(uploadMock).not.toHaveBeenCalled();
    expect(publishMock).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Review & Publish" })).toBeInTheDocument();
  });
});



