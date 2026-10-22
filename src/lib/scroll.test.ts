import { describe, expect, it } from "vitest";
import { progressFromRect } from "./scroll";

const VIEWPORT = 1000;

describe("progressFromRect", () => {
  it("is 0 when the top reaches the start line and 1 when the bottom reaches the end line", () => {
    const range = { start: 0.92, end: 0.62 };
    expect(progressFromRect(920, 600, VIEWPORT, range)).toBe(0);
    // bottom at 620 means top at 20
    expect(progressFromRect(20, 600, VIEWPORT, range)).toBe(1);
  });

  it("models a pinned section: 0 at the top of the viewport, 1 when its bottom leaves", () => {
    const pinned = { start: 0, end: 1 };
    expect(progressFromRect(0, 3000, VIEWPORT, pinned)).toBe(0);
    expect(progressFromRect(-1000, 3000, VIEWPORT, pinned)).toBe(0.5);
    expect(progressFromRect(-2000, 3000, VIEWPORT, pinned)).toBe(1);
  });

  it("clamps outside the range", () => {
    const pinned = { start: 0, end: 1 };
    expect(progressFromRect(400, 3000, VIEWPORT, pinned)).toBe(0);
    expect(progressFromRect(-5000, 3000, VIEWPORT, pinned)).toBe(1);
  });

  it("handles an element shorter than its range without dividing by zero", () => {
    expect(progressFromRect(-10, 1000, VIEWPORT, { start: 0, end: 1 })).toBe(1);
    expect(progressFromRect(10, 1000, VIEWPORT, { start: 0, end: 1 })).toBe(0);
  });
});
