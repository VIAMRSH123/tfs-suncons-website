import { describe, expect, it } from "vitest";
import { iso, type ScreenPoint } from "./iso";
import {
  DWELL,
  HANDOVER,
  cameraTarget,
  convoyAt,
  dwellProgress,
  journeyAt,
  resolveLength,
  topForProgress,
  type Leg,
} from "./journey";
import { progressFromRect } from "./scroll";

/** Three stops, so each chapter owns a third of the scroll. */
const STOPS: readonly ScreenPoint[] = [
  [0, 0],
  [100, 50],
  [300, 50],
];
const SHARE = 1 / STOPS.length;

describe("cameraTarget", () => {
  it("is the focus point's projection, shifted into the world's SVG coordinates", () => {
    const [x, y] = iso(10, 6);
    expect(cameraTarget(10, 6, [500, 300])).toEqual([x + 500, y + 300]);
  });
});

describe("journeyAt", () => {
  it("starts on the first stop, in the first chapter", () => {
    expect(journeyAt(0, STOPS)).toEqual({ chapter: 0, x: 0, y: 0, chapterProgress: 0 });
  });

  it("holds each stop still through the dwell at the start of its chapter", () => {
    expect(journeyAt(SHARE * DWELL * 0.99, STOPS)).toMatchObject({ chapter: 0, x: 0, y: 0 });
    expect(journeyAt(SHARE * (1 + DWELL * 0.5), STOPS)).toMatchObject({ chapter: 1, x: 100, y: 50 });
  });

  it("glides to the next stop after the dwell, easing in and out", () => {
    const glide = (t: number) => SHARE * (DWELL + (1 - DWELL) * t);
    const midway = journeyAt(glide(0.5), STOPS);
    expect(midway.x).toBeCloseTo(50);
    expect(midway.y).toBeCloseTo(25);
    // Eased: a quarter of the glide covers less than a quarter of the way, three quarters more.
    expect(journeyAt(glide(0.25), STOPS).x).toBeLessThan(25);
    expect(journeyAt(glide(0.75), STOPS).x).toBeGreaterThan(75);
  });

  it("arrives on the next stop exactly as the next chapter begins", () => {
    const before = journeyAt(SHARE - 1e-9, STOPS);
    expect(before.chapter).toBe(0);
    expect(before.x).toBeCloseTo(100);
    expect(before.y).toBeCloseTo(50);
    expect(journeyAt(SHARE, STOPS)).toMatchObject({ chapter: 1, x: 100, y: 50 });
  });

  it("holds the last stop to the end", () => {
    expect(journeyAt(SHARE * 2.9, STOPS)).toMatchObject({ chapter: 2, x: 300, y: 50 });
    expect(journeyAt(1, STOPS)).toEqual({ chapter: 2, x: 300, y: 50, chapterProgress: 1 });
  });

  it("reports how far through its own share of the scroll the chapter is", () => {
    const frame = journeyAt(SHARE * 1.25, STOPS);
    expect(frame.chapter).toBe(1);
    expect(frame.chapterProgress).toBeCloseTo(0.25);
  });

  it("clamps progress outside 0–1", () => {
    expect(journeyAt(-0.5, STOPS)).toEqual(journeyAt(0, STOPS));
    expect(journeyAt(1.5, STOPS)).toEqual(journeyAt(1, STOPS));
  });
});

describe("dwellProgress", () => {
  it("lands each chapter inside its dwell, where the camera rests on its stop", () => {
    STOPS.forEach(([x, y], index) => {
      expect(journeyAt(dwellProgress(index, STOPS.length), STOPS)).toMatchObject({ chapter: index, x, y });
    });
  });

  it("aims for the middle of the dwell, clear of either edge", () => {
    expect(dwellProgress(1, 5)).toBeCloseTo((1 + DWELL / 2) / 5);
  });
});

describe("convoyAt", () => {
  /** A truck over chapters 1–3, a ship in chapter 4, a van in chapter 5. */
  const LEGS: readonly Leg[] = [
    { from: 0, to: 30, chapters: [0, 3] },
    { from: 40, to: 50, chapters: [3, 4] },
    { from: 60, to: 70, chapters: [4, 5] },
  ];
  const at = (progress: number) => convoyAt(progress, LEGS, 5);

  it("starts with the first vehicle at the start of its leg and the others out of sight", () => {
    expect(at(0)).toEqual([
      { travelled: 0, opacity: 1 },
      { travelled: 0, opacity: 0 },
      { travelled: 0, opacity: 0 },
    ]);
  });

  it("drives each leg at a constant speed across its chapters", () => {
    expect(at(0.15)[0].travelled).toBeCloseTo(7.5);
    expect(at(0.3)[0].travelled).toBeCloseTo(15);
    expect(at(0.7)[1].travelled).toBeCloseTo(5);
    expect(at(0.9)[2].travelled).toBeCloseTo(5);
  });

  it("hands over at the quay with a cross-fade", () => {
    const [truck, ship] = at(0.6);
    expect(truck.travelled).toBe(30);
    expect(truck.opacity).toBeCloseTo(0.5);
    expect(ship.travelled).toBe(0);
    expect(ship.opacity).toBeCloseTo(0.5);
  });

  it("shows one vehicle at a time outside the hand-overs", () => {
    for (const progress of [0, 0.2, 0.5, 0.6 + HANDOVER, 0.7, 0.8 + HANDOVER, 0.95, 1]) {
      const opacities = at(progress).map(({ opacity }) => opacity);
      expect(opacities.filter((opacity) => opacity === 1)).toHaveLength(1);
      expect(opacities.filter((opacity) => opacity === 0)).toHaveLength(2);
    }
  });

  it("parks each vehicle at the end of its leg once it has handed over", () => {
    const [truck, ship, van] = at(1);
    expect(truck).toEqual({ travelled: 30, opacity: 0 });
    expect(ship).toEqual({ travelled: 10, opacity: 0 });
    expect(van).toEqual({ travelled: 10, opacity: 1 });
  });

  it("clamps progress outside 0–1", () => {
    expect(at(-1)).toEqual(at(0));
    expect(at(2)).toEqual(at(1));
  });
});

describe("topForProgress", () => {
  it("is the inverse of progressFromRect", () => {
    for (const range of [
      { start: 0, end: 1 },
      { start: 0.09, end: 1 },
    ]) {
      for (const progress of [0, 0.25, 0.6, 1]) {
        const top = topForProgress(progress, 2400, 800, range);
        expect(progressFromRect(top, 2400, 800, range)).toBeCloseTo(progress);
      }
    }
  });

  it("puts a pinned track's top at the viewport's top at 0 and its bottom at the viewport's bottom at 1", () => {
    const range = { start: 0, end: 1 };
    expect(topForProgress(0, 2400, 800, range)).toBeCloseTo(0);
    expect(topForProgress(1, 2400, 800, range)).toBe(800 - 2400);
  });
});

describe("resolveLength", () => {
  it("reads container and percentage units as a share of the size", () => {
    expect(resolveLength("72cqw", 1000)).toBe(720);
    expect(resolveLength("38cqh", 500)).toBe(190);
    expect(resolveLength(" 50% ", 300)).toBe(150);
  });

  it("reads pixel lengths as they are", () => {
    expect(resolveLength("120px", 1000)).toBe(120);
    expect(resolveLength(" 64", 1000)).toBe(64);
  });

  it("treats an unreadable value as zero", () => {
    expect(resolveLength("", 1000)).toBe(0);
    expect(resolveLength("auto", 1000)).toBe(0);
  });
});
