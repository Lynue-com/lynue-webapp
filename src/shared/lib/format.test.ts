import { describe, expect, it } from "vitest";
import { compactNumber, formatCurrency } from "@/shared/lib/format";

describe("format helpers", () => {
  it("formats naira currency", () => {
    const result = formatCurrency(2500000);
    expect(result).toContain("2");
  });

  it("handles missing values", () => {
    expect(formatCurrency(null)).toBe("Price on request");
    expect(compactNumber(undefined)).toBe("-");
  });
});
