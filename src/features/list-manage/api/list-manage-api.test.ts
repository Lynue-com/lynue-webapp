import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getCategories,
  createListing,
  deleteListing,
  publishListing,
  unpublishListing,
  uploadListingImages,
} from "./list-manage-api";

vi.mock("@/shared/lib/http", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/shared/lib/http";

const mockedApiRequest = vi.mocked(apiRequest);

const mockCategories = {
  status: true,
  categories: [
    {
      value: "RESIDENTIAL",
      name: "Residential",
      slug: "residential",
      subCategories: [
        { id: 1, name: "Apartment", slug: "apartment", category: "RESIDENTIAL" },
        { id: 2, name: "Duplex", slug: "duplex", category: "RESIDENTIAL" },
        { id: 3, name: "Bungalow", slug: "bungalow", category: "RESIDENTIAL" },
      ],
    },
    {
      value: "COMMERCIAL",
      name: "Commercial",
      slug: "commercial",
      subCategories: [
        { id: 4, name: "Office", slug: "office", category: "COMMERCIAL" },
        { id: 5, name: "Shop", slug: "shop", category: "COMMERCIAL" },
        { id: 6, name: "Warehouse", slug: "warehouse", category: "COMMERCIAL" },
      ],
    },
    {
      value: "LAND",
      name: "Land",
      slug: "land",
      subCategories: [
        { id: 7, name: "Plot", slug: "plot", category: "LAND" },
        { id: 8, name: "Acre", slug: "acre", category: "LAND" },
      ],
    },
    {
      value: "SHORT_STAY",
      name: "Short Stay",
      slug: "short-stay",
      subCategories: [
        { id: 9, name: "Studio", slug: "studio", category: "SHORT_STAY" },
        { id: 10, name: "Self Contain", slug: "self-contain", category: "SHORT_STAY" },
      ],
    },
  ],
};

const mockCreatedListing = {
  id: "listing-new-1",
  slug: "modern-3br-apartment-victoria-island",
  title: "Modern 3BR Apartment in Victoria Island",
  description: "A beautiful 3 bedroom apartment",
  listType: "RENT",
  category: "RESIDENTIAL",
  city: "Lagos",
  state: "Lagos",
  latitude: 6.4299,
  longitude: 3.4139,
  price: 2500000,
  priceUnit: "YEAR",
  address: "123 Adeola Odeku Street",
  bedrooms: 3,
  bathrooms: 3,
  toilets: 3,
  parkingSpaces: 2,
  yearBuilt: 2020,
  landSize: null,
  buildingSize: 150,
  createdAt: "2024-03-10T00:00:00Z",
  images: [],
  status: "DRAFT",
  user: { id: "user-1", firstName: "John", lastName: "Doe" },
};

describe("list-manage-api - full listing lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories - all property categories", () => {
    it("fetches all categories with subcategories", async () => {
      mockedApiRequest.mockResolvedValue(mockCategories);
      const result = await getCategories();
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/list/categories", {
        credentials: "include",
      });
      expect(result).toHaveLength(4);
      expect(result[0]?.value).toBe("RESIDENTIAL");
      expect(result[0]?.subCategories).toHaveLength(3);
      expect(result[1]?.value).toBe("COMMERCIAL");
      expect(result[2]?.value).toBe("LAND");
      expect(result[3]?.value).toBe("SHORT_STAY");
    });

    it("throws when categories endpoint fails", async () => {
      const error = new Error("Request failed with status 500");
      (error as { status?: number }).status = 500;
      mockedApiRequest.mockRejectedValue(error);
      await expect(getCategories()).rejects.toThrow("500");
    });
  });

  describe("createListing - RENT payload with subcategory", () => {
    it("posts a validated rent listing and returns the created listing", async () => {
      mockedApiRequest.mockResolvedValue({ status: true, listing: mockCreatedListing });
      const result = await createListing({
        title: "Modern 3BR Apartment in Victoria Island",
        description: "A beautiful 3 bedroom apartment",
        listType: "RENT",
        category: "RESIDENTIAL",
        subCategoryId: 1,
        price: 2500000,
        priceUnit: "YEAR",
        address: "123 Adeola Odeku Street",
        city: "Lagos",
        state: "Lagos",
        bedrooms: 3,
        bathrooms: 3,
        toilets: 3,
        parkingSpaces: 2,
        amenities: [{ slug: "wi-fi", label: "Wi-Fi" }],
        facilities: [{ slug: "security-gate", label: "Security Gate" }],
      });

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/list", {
        method: "POST",
        json: expect.objectContaining({
          listType: "RENT",
          category: "RESIDENTIAL",
          subCategoryId: 1,
          priceUnit: "YEAR",
          price: 2500000,
          currency: "NGN",
          country: "NG",
          listAs: "OWNER",
        }),
        credentials: "include",
      });
      expect(result.id).toBe("listing-new-1");
      expect(result.slug).toBe("modern-3br-apartment-victoria-island");
      expect(result.status).toBe("DRAFT");
    });

    it("rejects an invalid payload before calling the API", async () => {
      await expect(createListing({ title: "no" })).rejects.toThrow();
      expect(mockedApiRequest).not.toHaveBeenCalled();
    });
  });

  describe("createListing - SELL payload without price unit", () => {
    it("posts a sell listing and omits priceUnit entirely", async () => {
      mockedApiRequest.mockResolvedValue({ status: true, listing: { ...mockCreatedListing, listType: "SELL" } });
      const result = await createListing({
        title: "Spacious 4 Bedroom Duplex in Ikeja",
        description: "A well positioned duplex close to the highway",
        listType: "SELL",
        category: "COMMERCIAL",
        subCategoryId: 4,
        price: 85000000,
        address: "45 Opebi Road",
        city: "Ikeja",
        state: "Lagos",
        titleDocument: "c_of_o",
        condition: "NEW",
      });

      expect(mockedApiRequest).toHaveBeenCalledWith("/api/list", {
        method: "POST",
        json: expect.objectContaining({
          listType: "SELL",
          category: "COMMERCIAL",
          subCategoryId: 4,
          titleDocument: "c_of_o",
          condition: "NEW",
        }),
        credentials: "include",
      });

      const options = mockedApiRequest.mock.calls[0]?.[1];
      expect(options?.json).not.toHaveProperty("priceUnit");
      expect(result.listType).toBe("SELL");
    });
  });

  describe("publish / unpublish lifecycle", () => {
    it("publishes a draft listing", async () => {
      mockedApiRequest.mockResolvedValue({ status: true, listing: { ...mockCreatedListing, status: "PUBLISHED" } });
      const result = await publishListing("listing-new-1");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/list/listing-new-1/publish", {
        method: "POST",
        credentials: "include",
      });
      expect(result.status).toBe("PUBLISHED");
    });

    it("unpublishes a listing back to draft", async () => {
      mockedApiRequest.mockResolvedValue({ status: true, listing: { ...mockCreatedListing, status: "DRAFT" } });
      const result = await unpublishListing("listing-new-1");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/list/listing-new-1", {
        method: "PATCH",
        json: { status: "DRAFT" },
        credentials: "include",
      });
      expect(result.status).toBe("DRAFT");
    });
  });

  describe("deleteListing", () => {
    it("deletes by id and returns the server message", async () => {
      mockedApiRequest.mockResolvedValue({ status: true, message: "Listing deleted" });
      const result = await deleteListing("listing-new-1");
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/list/listing-new-1", {
        method: "DELETE",
        credentials: "include",
      });
      expect(result).toEqual({ status: true, message: "Listing deleted" });
    });
  });

  describe("uploadListingImages", () => {
    it("sends every file as multipart form data", async () => {
      mockedApiRequest.mockResolvedValue({ status: true });
      const files = [
        new File(["a"], "a.jpg", { type: "image/jpeg" }),
        new File(["b"], "b.png", { type: "image/png" }),
      ];
      await uploadListingImages("listing-new-1", files);

      expect(mockedApiRequest).toHaveBeenCalledWith(
        "/api/list/listing-new-1/images",
        expect.objectContaining({ method: "POST", credentials: "include" }),
      );

      const body = mockedApiRequest.mock.calls[0]?.[1]?.body;
      expect(body).toBeInstanceOf(FormData);
      if (!(body instanceof FormData)) throw new Error("expected request body to be FormData");
      expect(body.getAll("images")).toHaveLength(2);
    });

    it("propagates upload failures", async () => {
      const error = new Error("Request failed with status 500");
      (error as { status?: number }).status = 500;
      mockedApiRequest.mockRejectedValue(error);
      await expect(uploadListingImages("listing-new-1", [new File(["a"], "a.jpg")])).rejects.toThrow("500");
    });
  });
});