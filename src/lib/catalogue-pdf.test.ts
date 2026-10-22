import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { company } from "@/content/company";
import { categories, products } from "@/content/products";
import { buildCataloguePdf, toWinAnsi } from "./catalogue-pdf";

describe("toWinAnsi", () => {
  it("keeps the punctuation the standard fonts can draw", () => {
    expect(toWinAnsi("Bharat Gate — 20 kg · 1121 × 2")).toBe("Bharat Gate — 20 kg · 1121 × 2");
  });

  it("swaps or drops what they cannot", () => {
    expect(toWinAnsi("Telangana → Doha")).toBe("Telangana -> Doha");
    expect(toWinAnsi("₹ price")).toBe(" price");
  });
});

describe("buildCataloguePdf", () => {
  it("builds a cover plus one section per category from the live catalogue", async () => {
    const bytes = await buildCataloguePdf({
      categories,
      products,
      company,
      loadImage: async () => null,
      edition: "October 2026",
    });
    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1 + categories.length);
    expect(doc.getTitle()).toContain("Trade catalogue");
  });
});
