import { describe, expect, it } from "vitest";
import { monthlyKgFromPortions, packsFor, parsePackKg } from "./planner";

describe("parsePackKg", () => {
  it("reads printed pack sizes", () => {
    expect(parsePackKg("35 kg")).toBe(35);
    expect(parsePackKg("1 kg")).toBe(1);
    expect(parsePackKg("18kg")).toBe(18);
    expect(parsePackKg("500 g")).toBe(0.5);
  });

  it("returns null for sizes it cannot read", () => {
    expect(parsePackKg("")).toBeNull();
    expect(parsePackKg("family pack")).toBeNull();
    expect(parsePackKg("0 kg")).toBeNull();
  });
});

describe("packsFor", () => {
  it("rounds up to whole packs and reports what that supplies", () => {
    expect(packsFor(1200, 35)).toEqual({ packs: 35, suppliedKg: 1225 });
  });

  it("is exact when the need divides evenly", () => {
    expect(packsFor(70, 35)).toEqual({ packs: 2, suppliedKg: 70 });
  });

  it("needs nothing for nothing", () => {
    expect(packsFor(0, 35)).toEqual({ packs: 0, suppliedKg: 0 });
    expect(packsFor(-5, 35)).toEqual({ packs: 0, suppliedKg: 0 });
  });

  it("does not drift on decimal pack weights", () => {
    expect(packsFor(1.2, 0.5)).toEqual({ packs: 3, suppliedKg: 1.5 });
  });
});

describe("monthlyKgFromPortions", () => {
  it("multiplies the buyer's own numbers", () => {
    expect(monthlyKgFromPortions(400, 75, 30)).toBe(900);
  });

  it("treats missing or negative inputs as zero", () => {
    expect(monthlyKgFromPortions(0, 75, 30)).toBe(0);
    expect(monthlyKgFromPortions(400, -1, 30)).toBe(0);
  });
});
