import { describe, expect, it } from "vitest";
import { resolveItems } from "./enquiry";

describe("resolveItems", () => {
  it("accepts real products in a published pack size, with the catalogue's name", () => {
    expect(resolveItems([{ slug: "911-sona-masoori", packSize: "35 kg", quantity: 3 }])).toEqual([
      { slug: "911-sona-masoori", name: "911 Sona Masoori", packSize: "35 kg", quantity: 3 },
    ]);
  });

  it("accepts a product whose sizes are on request only without a size", () => {
    expect(resolveItems([{ slug: "chickpeas", packSize: "", quantity: 1 }])).toHaveLength(1);
    expect(resolveItems([{ slug: "chickpeas", packSize: "25 kg", quantity: 1 }])).toBeNull();
  });

  it("rejects unknown products and unpublished sizes", () => {
    expect(resolveItems([{ slug: "cement", packSize: "", quantity: 1 }])).toBeNull();
    expect(resolveItems([{ slug: "911-sona-masoori", packSize: "50 kg", quantity: 1 }])).toBeNull();
  });

  it("accepts an empty basket", () => {
    expect(resolveItems([])).toEqual([]);
  });
});
