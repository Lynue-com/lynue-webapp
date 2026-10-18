import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateListing } from "./list-edit-api";

vi.mock("@/shared/lib/http", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/shared/lib/http";

const mockedApiRequest = vi.mocked(apiRequest);

const mockListing = {
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
  createdAt: "2024-03-10T00:00:00Z",
  images: [],
};

describe("updateListing - payload validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a SELL + SHORT_STAY combination before hitting the network", async () => {
    await expect(
      updateListing("listing-1", { listType: "SELL", category: "SHORT_STAY" }),
    ).rejects.toThrow(/Short Stay listings cannot be for sale/);
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });

  it("rejects empty-string optional enums (the backend 400s on these)", async () => {
    await expect(
      updateListing("listing-1", { furnishing: "" }),
    ).rejects.toThrow();
    expect(mockedApiRequest).not.toHaveBeenCalled();
  });

  it("sends a valid patch and returns the updated listing", async () => {
    mockedApiRequest.mockResolvedValue({ status: true, listing: mockListing });

    const result = await updateListing("listing-1", {
      title: "Cozy Studio in Lekki",
      listType: "RENT",
      category: "SHORT_STAY",
      priceUnit: "DAY",
      amenities: [{ slug: "wifi", label: "Wi-Fi" }],
    });

    expect(mockedApiRequest).toHaveBeenCalledWith("/api/list/listing-1", {
      method: "PATCH",
      json: expect.objectContaining({
        listType: "RENT",
        category: "SHORT_STAY",
        priceUnit: "DAY",
      }),
      credentials: "include",
    });
    expect(result.id).toBe("listing-1");
    expect(mockedApiRequest.mock.calls[0]?.[1]?.json).not.toHaveProperty(
      "unknownKey",
    );
  });
});
