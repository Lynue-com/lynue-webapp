import { describe, it, expect, vi, beforeEach } from "vitest";
import { getListings } from "./listings-api";

vi.mock("@/shared/lib/http", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/shared/lib/http";

const mockedApiRequest = vi.mocked(apiRequest);

const baseResponse = {
  status: true,
  listings: [
    {
      id: "listing-1",
      slug: "luxury-apartment-victoria-island",
      title: "Luxury Apartment in Victoria Island",
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
      createdAt: "2024-01-15T00:00:00Z",
      images: [{ id: "img-1", url: "https://storage.example.com/img-1.jpg" }],
      status: "PUBLISHED",
      user: { id: "user-1", firstName: "John", lastName: "Doe" },
    },
    {
      id: "listing-2",
      slug: "duplex-ikeja",
      title: "Duplex in Ikeja",
      description: "Spacious 4 bedroom duplex",
      listType: "SELL",
      category: "RESIDENTIAL",
      city: "Ikeja",
      state: "Lagos",
      latitude: 6.5992,
      longitude: 3.3381,
      price: 85000000,
      priceUnit: null,
      address: "45 Opebi Road",
      bedrooms: 4,
      bathrooms: 4,
      toilets: 4,
      parkingSpaces: 3,
      yearBuilt: 2018,
      landSize: 450,
      buildingSize: 350,
      createdAt: "2024-02-20T00:00:00Z",
      images: [{ id: "img-2", url: "https://storage.example.com/img-2.jpg" }],
      status: "PUBLISHED",
      user: { id: "user-2", firstName: "Jane", lastName: "Smith" },
    },
  ],
  pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
};

describe("listings-api - all filter options", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches RENT listings with default filters", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    const result = await getListings({ type: "RENT" });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: { page: 1, limit: 12, type: "RENT", sort: "newest" },
    });
    expect(result.status).toBe(true);
    expect(result.listings).toHaveLength(2);
    expect(result.listings[0]?.listType).toBe("RENT");
  });

  it("fetches SELL listings", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    const result = await getListings({ type: "SELL" });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ type: "SELL" }),
    });
    expect(result.listings[1]?.listType).toBe("SELL");
  });
  it("supports all property categories", async () => {
    const categories = ["RESIDENTIAL", "COMMERCIAL", "LAND", "SHORT_STAY"] as const;
    for (const category of categories) {
      mockedApiRequest.mockResolvedValue(baseResponse);
      const result = await getListings({ category });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
        query: expect.objectContaining({ category }),
      });
      expect(result.status).toBe(true);
    }
  });

  it("supports subcategory slug filter", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ subCategorySlug: "apartment" });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ subCategorySlug: "apartment" }),
    });
  });

  it("supports price range filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ minPrice: 1000000, maxPrice: 5000000 });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ minPrice: 1000000, maxPrice: 5000000 }),
    });
  });

  it("supports bedroom/bathroom/toilet filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ bedrooms: 3, bathrooms: 3, toilets: 3 });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ bedrooms: 3, bathrooms: 3, toilets: 3 }),
    });
  });

  it("supports size filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ minSize: 100, maxSize: 500 });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ minSize: 100, maxSize: 500 }),
    });
  });

  it("supports parking filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ parking: 2 });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ parking: 2 }),
    });
  });

  it("supports furnishing filtering", async () => {
    const furnishingOptions = ["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"] as const;
    for (const furnishing of furnishingOptions) {
      mockedApiRequest.mockResolvedValue(baseResponse);
      const result = await getListings({ furnishing });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
        query: expect.objectContaining({ furnishing }),
      });
      expect(result.status).toBe(true);
    }
  });

  it("supports listAs filtering", async () => {
    const listAsOptions = ["OWNER", "AGENT"] as const;
    for (const listAs of listAsOptions) {
      mockedApiRequest.mockResolvedValue(baseResponse);
      const result = await getListings({ listAs });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
        query: expect.objectContaining({ listAs }),
      });
      expect(result.status).toBe(true);
    }
  });

  it("supports condition filtering", async () => {
    const conditions = ["NEW", "RENOVATED", "FAIRLY_USED", "OLD", "UNDER_CONSTRUCTION"] as const;
    for (const condition of conditions) {
      mockedApiRequest.mockResolvedValue(baseResponse);
      const result = await getListings({ condition });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
        query: expect.objectContaining({ condition }),
      });
      expect(result.status).toBe(true);
    }
  });

  it("supports amenity and facility filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ amenity: "wi-fi", facility: "security-gate" });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ amenity: "wi-fi", facility: "security-gate" }),
    });
  });

  it("supports location filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ lat: 6.4299, lng: 3.4139, radius: 10 });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ lat: 6.4299, lng: 3.4139, radius: 10 }),
    });
  });

  it("supports text search", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ q: "luxury apartment" });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ q: "luxury apartment" }),
    });
  });

  it("supports all sort options", async () => {
    const sortOptions = ["newest", "oldest", "price_asc", "price_desc", "distance"] as const;
    for (const sort of sortOptions) {
      mockedApiRequest.mockResolvedValue(baseResponse);
      const result = await getListings({ sort });
      expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
        query: expect.objectContaining({ sort }),
      });
      expect(result.status).toBe(true);
    }
  });

  it("supports city and state filtering", async () => {
    mockedApiRequest.mockResolvedValue(baseResponse);
    await getListings({ city: "Lagos", state: "Lagos" });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ city: "Lagos", state: "Lagos" }),
    });
  });

  it("supports pagination", async () => {
    mockedApiRequest.mockResolvedValue({ ...baseResponse, pagination: { page: 2, limit: 6, total: 50, totalPages: 9 } });
    const result = await getListings({ page: 2, limit: 6 });
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/listings", {
      query: expect.objectContaining({ page: 2, limit: 6 }),
    });
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.totalPages).toBe(9);
  });

  it("throws when API returns non-ok response", async () => {
    const error = new Error("Request failed with status 500");
    (error as { status?: number }).status = 500;
    mockedApiRequest.mockRejectedValue(error);
    await expect(getListings({ type: "RENT" })).rejects.toThrow("500");
  });
});
