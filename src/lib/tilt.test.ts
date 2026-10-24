import { describe, expect, it } from "vitest";
import {
  isNeutralTilt,
  orientationPosition,
  pointerPosition,
  tiltFromPosition,
  tiltTransform,
} from "./tilt";

describe("tiltFromPosition", () => {
  it("is neutral with the pointer at the centre", () => {
    expect(tiltFromPosition({ x: 0, y: 0 })).toEqual({ rotateX: 0, rotateY: 0, leanX: 0, leanY: 0 });
  });

  it("tips the top edge away and leans up when the pointer is high", () => {
    expect(tiltFromPosition({ x: 0, y: -1 })).toEqual({ rotateX: 3, rotateY: 0, leanX: 0, leanY: -8 });
  });

  it("tips the right edge away and leans right when the pointer is to the right", () => {
    expect(tiltFromPosition({ x: 1, y: 0 })).toEqual({ rotateX: 0, rotateY: 3, leanX: 8, leanY: 0 });
  });

  it("scales linearly between the centre and the edge", () => {
    expect(tiltFromPosition({ x: 0.5, y: 0.5 })).toEqual({ rotateX: -1.5, rotateY: 1.5, leanX: 4, leanY: 4 });
  });

  it("clamps positions beyond the edge", () => {
    expect(tiltFromPosition({ x: 3, y: -7 })).toEqual(tiltFromPosition({ x: 1, y: -1 }));
  });

  it("treats a missing reading as the centre", () => {
    expect(isNeutralTilt(tiltFromPosition({ x: Number.NaN, y: Number.NaN }))).toBe(true);
  });

  it("uses the given max angle and lean", () => {
    expect(tiltFromPosition({ x: -1, y: 1 }, { maxAngle: 1.5, lean: 4 })).toEqual({
      rotateX: -1.5,
      rotateY: -1.5,
      leanX: -4,
      leanY: 4,
    });
  });

  it("holds still inside the dead zone and still reaches the full tilt at the edge", () => {
    const shape = { deadZone: 0.1 };
    expect(isNeutralTilt(tiltFromPosition({ x: 0.08, y: -0.1 }, shape))).toBe(true);
    expect(tiltFromPosition({ x: 1, y: 0 }, shape).rotateY).toBe(3);
    expect(tiltFromPosition({ x: 0, y: -1 }, shape).rotateX).toBe(3);
  });

  it("leaves the dead zone without a jump", () => {
    const shape = { deadZone: 0.1 };
    expect(tiltFromPosition({ x: 0.1001, y: 0 }, shape).rotateY).toBeCloseTo(0, 2);
    expect(tiltFromPosition({ x: 0.55, y: 0 }, shape).rotateY).toBeCloseTo(1.5, 10);
  });
});

describe("pointerPosition", () => {
  const rect = { left: 100, top: 50, width: 400, height: 200 };

  it("is 0 at the centre of the surface and ±1 at its edges", () => {
    expect(pointerPosition(rect, 300, 150)).toEqual({ x: 0, y: 0 });
    expect(pointerPosition(rect, 100, 50)).toEqual({ x: -1, y: -1 });
    expect(pointerPosition(rect, 500, 250)).toEqual({ x: 1, y: 1 });
    expect(pointerPosition(rect, 200, 200)).toEqual({ x: -0.5, y: 0.5 });
  });

  it("clamps a pointer outside the surface to its edge", () => {
    expect(pointerPosition(rect, 900, -400)).toEqual({ x: 1, y: -1 });
  });

  it("reads a surface with no size as the centre instead of dividing by zero", () => {
    expect(pointerPosition({ left: 10, top: 10, width: 0, height: 0 }, 40, 40)).toEqual({ x: 0, y: 0 });
  });
});

describe("orientationPosition", () => {
  const flat = { beta: 0, gamma: 0 };

  it("reads the attitude the phone was first held at as the centre", () => {
    const held = { beta: 55, gamma: -8 };
    const { x, y } = orientationPosition(held, held);
    expect(x).toBeCloseTo(0, 10);
    expect(y).toBeCloseTo(0, 10);
  });

  it("moves right as the phone's right edge dips", () => {
    const { x, y } = orientationPosition({ beta: 0, gamma: 10 }, flat);
    expect(x).toBeCloseTo(0.5, 6);
    expect(y).toBeCloseTo(0, 6);
  });

  it("moves down as the phone's top edge rises", () => {
    const { x, y } = orientationPosition({ beta: 70, gamma: 0 }, { beta: 60, gamma: 0 });
    expect(x).toBeCloseTo(0, 6);
    expect(y).toBeCloseTo(0.5, 6);
  });

  it("reaches the full range at ±range degrees and clamps beyond it", () => {
    expect(orientationPosition({ beta: 0, gamma: 20 }, flat).x).toBeCloseTo(1, 6);
    expect(orientationPosition({ beta: 0, gamma: -45 }, flat).x).toBe(-1);
    expect(orientationPosition({ beta: 0, gamma: 5 }, flat, { range: 10 }).x).toBeCloseTo(0.5, 6);
  });

  it("stays steady for an upright phone, whichever Euler form the browser reports", () => {
    // Upright, then rolled 5° anticlockwise so the right edge rises. Browsers
    // report that as gamma ±90, so a plain gamma difference would swing the
    // full range; read through gravity it is a 5° tilt.
    const upright = { beta: 90, gamma: 0 };
    for (const reading of [
      { beta: 85, gamma: -90 },
      { beta: 95, gamma: 90 },
    ]) {
      const { x, y } = orientationPosition(reading, upright);
      expect(x).toBeCloseTo(-0.25, 6);
      expect(y).toBeCloseTo(0, 6);
    }
  });

  it("follows the screen's axes when the phone is held sideways", () => {
    // screen.orientation.angle 90: the phone's top edge is on the screen's left.
    const sideways = { screenAngle: 90 };
    const phoneTopRaised = orientationPosition({ beta: 10, gamma: 0 }, flat, sideways);
    expect(phoneTopRaised.x).toBeCloseTo(0.5, 6);
    expect(phoneTopRaised.y).toBeCloseTo(0, 6);

    const phoneRightRaised = orientationPosition({ beta: 0, gamma: -10 }, flat, sideways);
    expect(phoneRightRaised.x).toBeCloseTo(0, 6);
    expect(phoneRightRaised.y).toBeCloseTo(0.5, 6);
  });

  it("carries the pitch across the ±180° seam", () => {
    const { y } = orientationPosition({ beta: -175, gamma: 0 }, { beta: 175, gamma: 0 });
    expect(y).toBeCloseTo(0.5, 6);
  });

  it("reads a range of zero as no tilt rather than dividing by it", () => {
    expect(orientationPosition({ beta: 0, gamma: 10 }, flat, { range: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe("tiltTransform", () => {
  it("writes the perspective, then the lean, then the tilt", () => {
    expect(tiltTransform({ rotateX: 1.5, rotateY: -3, leanX: 4, leanY: -2 })).toBe(
      "perspective(var(--tilt-perspective, 1600px)) translate(4.00px, -2.00px) rotateX(1.500deg) rotateY(-3.000deg)",
    );
  });

  it("takes another perspective", () => {
    expect(tiltTransform({ rotateX: 0, rotateY: 0, leanX: 0, leanY: 0 }, "900px")).toBe(
      "perspective(900px) translate(0.00px, 0.00px) rotateX(0.000deg) rotateY(0.000deg)",
    );
  });
});

describe("isNeutralTilt", () => {
  it("is true only when nothing is tipped or leaning", () => {
    expect(isNeutralTilt({ rotateX: 0, rotateY: 0, leanX: 0, leanY: 0 })).toBe(true);
    expect(isNeutralTilt({ rotateX: 0, rotateY: 0.01, leanX: 0, leanY: 0 })).toBe(false);
    expect(isNeutralTilt({ rotateX: 0, rotateY: 0, leanX: 0, leanY: -0.2 })).toBe(false);
  });
});
