import { describe, expect, it } from "vitest";
import { cargoAt, dwellProgress } from "@/lib/journey";
import { BEATS, CAMERA_STOPS, CARGO, CHAPTERS, TIMELINE } from "./chapters";

describe("the journey's beats", () => {
  it("hold every chapter first on that chapter's own stop, where a rail click lands", () => {
    CHAPTERS.forEach((_, chapter) => {
      const first = BEATS.find((beat) => beat.chapter === chapter && beat.kind === "hold");
      expect(first?.camera, `chapter ${chapter + 1}`).toEqual(CAMERA_STOPS[chapter]);
    });
  });

  it("open and close on a hold, and never step back a chapter", () => {
    expect(BEATS[0].kind).toBe("hold");
    expect(BEATS.at(-1)?.kind).toBe("hold");
    BEATS.slice(1).forEach((beat, index) => expect(beat.chapter).toBeGreaterThanOrEqual(BEATS[index].chapter));
  });

  it("move the camera on every glide and nowhere else", () => {
    BEATS.slice(1).forEach((beat, index) => {
      const isStill = beat.camera.every((value, axis) => value === BEATS[index].camera[axis]);
      expect(isStill).toBe(beat.kind === "hold");
    });
  });
});

describe("the gold cargo", () => {
  it("keeps every key inside the story, in order", () => {
    for (const { route, fade = [] } of CARGO) {
      for (const keys of [route, fade]) {
        const moments = keys.map(([moment]) => moment);
        expect(moments).toEqual([...moments].sort((a, b) => a - b));
        moments.forEach((moment) => {
          expect(moment).toBeGreaterThanOrEqual(0);
          expect(moment).toBeLessThanOrEqual(BEATS.length);
        });
      }
    }
  });

  it("is in the shot, fully shown, while each chapter holds", () => {
    CHAPTERS.forEach(({ focus: [focusX, focusY] }, chapter) => {
      const frames = cargoAt(dwellProgress(chapter, TIMELINE), CARGO, TIMELINE);
      const inShot = frames.some(
        ({ x, opacity }, index) => opacity === 1 && Math.abs(x - focusX) <= 6 && Math.abs(CARGO[index].y - focusY) <= 3,
      );
      expect(inShot, `chapter ${chapter + 1}`).toBe(true);
    });
  });
});
