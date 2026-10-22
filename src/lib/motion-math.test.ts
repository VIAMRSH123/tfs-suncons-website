import { describe, expect, it } from "vitest";
import { FLAG_CYCLE_SECONDS, flagProgress } from "@/components/motion/flagCycle";
import { step } from "./follow";

describe("follower step", () => {
  it("moves toward the target by the smoothing fraction per frame", () => {
    expect(step(0, 100, 0.5, 1)).toBe(50);
  });

  it("covers the same ground in one long frame as in several short ones", () => {
    const twoFrames = step(step(0, 100, 0.2, 1), 100, 0.2, 1);
    expect(step(0, 100, 0.2, 2)).toBeCloseTo(twoFrames, 10);
  });
});

describe("flagProgress", () => {
  it("holds on India, crosses to Qatar, holds, and returns", () => {
    expect(flagProgress(0)).toBe(0);
    expect(flagProgress(1.4)).toBe(0);
    expect(flagProgress(1.5 + 1.6)).toBeCloseTo(0.5, 5);
    expect(flagProgress(5.5)).toBe(1);
    expect(flagProgress(6.5 + 1.6)).toBeCloseTo(0.5, 5);
  });

  it("loops", () => {
    expect(flagProgress(FLAG_CYCLE_SECONDS + 5.5)).toBe(1);
  });
});
