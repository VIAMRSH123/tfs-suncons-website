import { describe, expect, it } from "vitest";
import { iso } from "./iso";
import {
  buildTimeline,
  cameraTarget,
  cargoAt,
  dwellProgress,
  journeyAt,
  progressAt,
  resolveLength,
  topForProgress,
  type Beat,
  type CargoTrack,
} from "./journey";
import { progressFromRect } from "./scroll";

/**
 * Three chapters over eight units of scroll: hold A (1), glide to B (2),
 * hold B (1), glide to C via a waypoint (1 + 1), hold C (2).
 */
const BEATS: readonly Beat[] = [
  { kind: "hold", chapter: 0, units: 1, camera: [0, 0] },
  { kind: "glide", chapter: 0, units: 2, camera: [100, 50] },
  { kind: "hold", chapter: 1, units: 1, camera: [100, 50] },
  { kind: "glide", chapter: 1, units: 1, camera: [200, 50] },
  { kind: "glide", chapter: 1, units: 1, camera: [300, 50] },
  { kind: "hold", chapter: 2, units: 2, camera: [300, 50] },
];
const TIMELINE = buildTimeline(BEATS);
/** The progress at `units` of scroll into the eight. */
const at = (units: number) => units / 8;

describe("cameraTarget", () => {
  it("is the focus point's projection, shifted into the world's SVG coordinates", () => {
    const [x, y] = iso(10, 6);
    expect(cameraTarget(10, 6, [500, 300])).toEqual([x + 500, y + 300]);
  });
});

describe("buildTimeline", () => {
  it("lays the beats end to end, each in proportion to its units", () => {
    expect(TIMELINE.units).toBe(8);
    expect(TIMELINE.spans.map(([start, end]) => [start * 8, end * 8])).toEqual([
      [0, 1],
      [1, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 8],
    ]);
  });

  it("ends exactly at 1, whatever the rounding", () => {
    const thirds = buildTimeline([
      { kind: "hold", chapter: 0, units: 1, camera: [0, 0] },
      { kind: "glide", chapter: 0, units: 1, camera: [1, 0] },
      { kind: "hold", chapter: 1, units: 1, camera: [1, 0] },
    ]);
    expect(thirds.spans[2][1]).toBe(1);
  });

  it("spans each chapter from its first beat to its last", () => {
    expect(TIMELINE.chapters.map(([start, end]) => [start * 8, end * 8])).toEqual([
      [0, 3],
      [3, 6],
      [6, 8],
    ]);
  });
});

describe("journeyAt", () => {
  it("starts on the first stop, in the first chapter", () => {
    expect(journeyAt(0, TIMELINE)).toEqual({ chapter: 0, x: 0, y: 0, chapterProgress: 0 });
  });

  it("holds the camera still through a hold", () => {
    expect(journeyAt(at(0.99), TIMELINE)).toMatchObject({ chapter: 0, x: 0, y: 0 });
    expect(journeyAt(at(3.5), TIMELINE)).toMatchObject({ chapter: 1, x: 100, y: 50 });
  });

  it("glides to the next stop, easing in and out", () => {
    const midway = journeyAt(at(2), TIMELINE);
    expect(midway.x).toBeCloseTo(50);
    expect(midway.y).toBeCloseTo(25);
    expect(journeyAt(at(1.5), TIMELINE).x).toBeLessThan(25);
    expect(journeyAt(at(2.5), TIMELINE).x).toBeGreaterThan(75);
  });

  it("keeps the caption of the chapter a glide leaves, and changes it on arrival", () => {
    const before = journeyAt(at(3) - 1e-9, TIMELINE);
    expect(before.chapter).toBe(0);
    expect(before.x).toBeCloseTo(100);
    expect(journeyAt(at(3), TIMELINE)).toMatchObject({ chapter: 1, x: 100, y: 50 });
  });

  it("carries one glide on from where the last one ended", () => {
    expect(journeyAt(at(5), TIMELINE)).toMatchObject({ chapter: 1, x: 200, y: 50 });
    expect(journeyAt(at(5.5), TIMELINE).x).toBeCloseTo(250);
  });

  it("holds the last stop to the end", () => {
    expect(journeyAt(at(7), TIMELINE)).toMatchObject({ chapter: 2, x: 300, y: 50 });
    expect(journeyAt(1, TIMELINE)).toEqual({ chapter: 2, x: 300, y: 50, chapterProgress: 1 });
  });

  it("reports how far through its own span the chapter is", () => {
    expect(journeyAt(at(1.5), TIMELINE).chapterProgress).toBeCloseTo(0.5);
    expect(journeyAt(at(4.5), TIMELINE).chapterProgress).toBeCloseTo(0.5);
  });

  it("clamps progress outside 0–1 and reads NaN as the start", () => {
    expect(journeyAt(-0.5, TIMELINE)).toEqual(journeyAt(0, TIMELINE));
    expect(journeyAt(1.5, TIMELINE)).toEqual(journeyAt(1, TIMELINE));
    expect(journeyAt(Number.NaN, TIMELINE)).toEqual(journeyAt(0, TIMELINE));
  });
});

describe("dwellProgress", () => {
  it("lands each chapter halfway through its hold, the camera on its stop", () => {
    expect(dwellProgress(0, TIMELINE)).toBeCloseTo(at(0.5));
    expect(dwellProgress(1, TIMELINE)).toBeCloseTo(at(3.5));
    expect(dwellProgress(2, TIMELINE)).toBeCloseTo(at(7));
    [0, 1, 2].forEach((chapter) => {
      expect(journeyAt(dwellProgress(chapter, TIMELINE), TIMELINE)).toMatchObject({
        chapter,
        x: BEATS.find((beat) => beat.chapter === chapter && beat.kind === "hold")?.camera[0],
      });
    });
  });

  it("refuses a chapter with no hold", () => {
    expect(() => dwellProgress(5, TIMELINE)).toThrow();
  });
});

describe("progressAt", () => {
  it("reads a beat's index as its start and fractions as the way through it", () => {
    expect(progressAt(0, TIMELINE)).toBe(0);
    expect(progressAt(1, TIMELINE)).toBeCloseTo(at(1));
    expect(progressAt(1.5, TIMELINE)).toBeCloseTo(at(2));
    expect(progressAt(5, TIMELINE)).toBeCloseTo(at(6));
    expect(progressAt(6, TIMELINE)).toBe(1);
  });

  it("clamps moments beyond either end", () => {
    expect(progressAt(-2, TIMELINE)).toBe(0);
    expect(progressAt(9, TIMELINE)).toBe(1);
  });
});

describe("cargoAt", () => {
  /** A truck that waits, drives through beat 1, stops through the hold, drives on, then fades out in the last hold. */
  const TRUCK: CargoTrack = {
    route: [
      [1, 0],
      [2, 10],
      [3, 10],
      [5, 30],
    ],
    fade: [
      [5.25, 1],
      [5.75, 0],
    ],
  };
  /** A van with no fade, which only moves through the final hold. */
  const VAN: CargoTrack = {
    route: [
      [5, 40],
      [6, 50],
    ],
  };
  const truck = (units: number) => cargoAt(at(units), [TRUCK], TIMELINE)[0];

  it("waits at its first key until the timeline reaches it", () => {
    expect(truck(0)).toEqual({ x: 0, opacity: 1 });
    expect(truck(1)).toEqual({ x: 0, opacity: 1 });
  });

  it("eases between keys, as the camera does", () => {
    expect(truck(2).x).toBeCloseTo(5);
    expect(truck(1.5).x).toBeLessThan(2.5);
  });

  it("stands still between equal keys — a stop", () => {
    expect(truck(3).x).toBe(10);
    expect(truck(3.9).x).toBe(10);
  });

  it("parks at its last key", () => {
    expect(truck(6).x).toBe(30);
    expect(truck(8).x).toBe(30);
  });

  it("fades linearly between fade keys and is fully shown without any", () => {
    expect(truck(6.5).opacity).toBe(1);
    expect(truck(7).opacity).toBeCloseTo(0.5);
    expect(truck(8).opacity).toBe(0);
    expect(cargoAt(at(7), [VAN], TIMELINE)[0].x).toBeCloseTo(45);
    expect(cargoAt(at(8), [VAN], TIMELINE)[0]).toEqual({ x: 50, opacity: 1 });
  });

  it("reads NaN progress as the start", () => {
    expect(cargoAt(Number.NaN, [TRUCK, VAN], TIMELINE)).toEqual(cargoAt(0, [TRUCK, VAN], TIMELINE));
  });
});

describe("topForProgress", () => {
  it("is the inverse of progressFromRect", () => {
    for (const range of [
      { start: 0, end: 1 },
      { start: 0.09, end: 1 },
      { start: 0.09, end: 0.91 },
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

  it("stays put when the track is no taller than its range", () => {
    expect(topForProgress(0.5, 600, 800, { start: 0, end: 1 })).toBe(0);
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
    expect(resolveLength("-12.5px", 1000)).toBe(-12.5);
  });

  it("refuses any other unit, calc() or an empty value, so the caller falls back", () => {
    for (const value of ["", "auto", "50vh", "3rem", "50cqi", "calc(50% + 2px)"]) {
      expect(resolveLength(value, 1000)).toBeNaN();
    }
  });
});
