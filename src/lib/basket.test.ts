import { describe, expect, it } from "vitest";
import {
  MAX_LINES,
  MAX_QUANTITY,
  addLine,
  countPacks,
  parseBasket,
  removeLine,
  setQuantity,
  type Basket,
} from "./basket";

const sona = { slug: "911-sona-masoori", name: "911 Sona Masoori", packSize: "35 kg" };
const gate = { slug: "bharat-gate", name: "Bharat Gate 1121", packSize: "20 kg" };

describe("addLine", () => {
  it("adds a new line with its quantity", () => {
    expect(addLine([], { ...sona, quantity: 2 })).toEqual([{ ...sona, quantity: 2 }]);
  });

  it("merges the same product and pack size instead of duplicating it", () => {
    const basket = addLine(addLine([], { ...sona, quantity: 2 }), { ...sona, quantity: 3 });
    expect(basket).toEqual([{ ...sona, quantity: 5 }]);
  });

  it("keeps different pack sizes of one product as separate lines", () => {
    const basket = addLine(addLine([], { ...sona, quantity: 1 }), { ...sona, packSize: "18 kg", quantity: 1 });
    expect(basket).toHaveLength(2);
  });

  it("never mutates the basket it was given", () => {
    const original: Basket = [{ ...sona, quantity: 1 }];
    addLine(original, { ...sona, quantity: 4 });
    expect(original).toEqual([{ ...sona, quantity: 1 }]);
  });

  it("caps quantity and the number of lines", () => {
    expect(addLine([], { ...sona, quantity: MAX_QUANTITY + 50 })[0].quantity).toBe(MAX_QUANTITY);
    let basket: Basket = [];
    for (let i = 0; i < MAX_LINES + 5; i += 1) {
      basket = addLine(basket, { slug: `p-${i}`, name: `P ${i}`, packSize: "", quantity: 1 });
    }
    expect(basket).toHaveLength(MAX_LINES);
  });

  it("ignores non-positive or fractional quantities sensibly", () => {
    expect(addLine([], { ...sona, quantity: 0 })).toEqual([]);
    expect(addLine([], { ...sona, quantity: 2.7 })[0].quantity).toBe(2);
  });
});

describe("setQuantity and removeLine", () => {
  const basket: Basket = [
    { ...sona, quantity: 2 },
    { ...gate, quantity: 1 },
  ];

  it("sets an exact quantity", () => {
    expect(setQuantity(basket, sona.slug, sona.packSize, 9)[0].quantity).toBe(9);
  });

  it("removes the line when the quantity drops to zero", () => {
    expect(setQuantity(basket, sona.slug, sona.packSize, 0)).toEqual([{ ...gate, quantity: 1 }]);
  });

  it("removes a line by product and pack size", () => {
    expect(removeLine(basket, gate.slug, gate.packSize)).toEqual([{ ...sona, quantity: 2 }]);
  });
});

describe("countPacks", () => {
  it("sums every line", () => {
    expect(countPacks([{ ...sona, quantity: 2 }, { ...gate, quantity: 3 }])).toBe(5);
  });
});

describe("parseBasket", () => {
  it("restores a valid stored basket", () => {
    const stored = JSON.stringify([{ ...sona, quantity: 2 }]);
    expect(parseBasket(stored)).toEqual([{ ...sona, quantity: 2 }]);
  });

  it("returns an empty basket for anything malformed", () => {
    for (const junk of [null, "", "not json", "{}", "[1,2]", JSON.stringify([{ slug: 5 }])]) {
      expect(parseBasket(junk)).toEqual([]);
    }
  });

  it("drops individual bad lines but keeps the good ones", () => {
    const stored = JSON.stringify([{ ...sona, quantity: 2 }, { slug: "x", quantity: "lots" }]);
    expect(parseBasket(stored)).toEqual([{ ...sona, quantity: 2 }]);
  });
});
