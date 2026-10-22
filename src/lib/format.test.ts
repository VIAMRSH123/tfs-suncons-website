import { describe, expect, it } from "vitest";
import { categories, products } from "@/content/products";
import { numberWord, sentenceCount } from "./format";

describe("numberWord", () => {
  it("spells the small counts the site uses", () => {
    expect(numberWord(1)).toBe("one");
    expect(numberWord(4)).toBe("four");
    expect(numberWord(15)).toBe("fifteen");
    expect(numberWord(20)).toBe("twenty");
  });

  it("falls back to digits beyond twenty", () => {
    expect(numberWord(21)).toBe("21");
  });
});

describe("sentenceCount", () => {
  it("capitalises for the start of a sentence", () => {
    expect(sentenceCount(4, "category", "categories")).toBe("Four categories");
    expect(sentenceCount(1, "line", "lines")).toBe("One line");
  });
});

describe("the catalogue the copy is generated from", () => {
  it("has fifteen products in four categories — the count the old copy got wrong", () => {
    expect(categories).toHaveLength(4);
    expect(products).toHaveLength(15);
  });

  it("gives every product a real category and a unique slug", () => {
    const slugs = new Set(categories.map((category) => category.slug));
    expect(products.every((product) => slugs.has(product.category))).toBe(true);
    expect(new Set(products.map((product) => product.slug)).size).toBe(products.length);
  });
});
