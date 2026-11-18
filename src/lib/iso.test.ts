import { describe, expect, it } from "vitest";
import { GROUND_MATRIX, UNIT, along, boxFaces, iso, seeded, toPoints } from "./iso";

describe("iso", () => {
  it("projects the route axis right-down and the cross axis left-down, at 2:1", () => {
    expect(iso(0, 0)).toEqual([0, 0]);
    expect(iso(1, 0)).toEqual([UNIT, UNIT / 2]);
    expect(iso(0, 1)).toEqual([-UNIT, UNIT / 2]);
  });

  it("lifts height straight up the screen", () => {
    expect(iso(0, 0, 1)).toEqual([0, -UNIT]);
    expect(iso(2, 1, 0.5)).toEqual([UNIT, UNIT]);
  });
});

describe("GROUND_MATRIX", () => {
  it("is the same projection as iso() for anything drawn on the ground", () => {
    const [a, b, c, d, e, f] = GROUND_MATRIX.slice("matrix(".length, -1).split(" ").map(Number);
    const apply = (x: number, y: number) => [a * x + c * y + e, b * x + d * y + f];
    expect(apply(3, 2)).toEqual(iso(3, 2));
    expect(apply(-1, 4)).toEqual(iso(-1, 4));
  });
});

describe("toPoints", () => {
  it("joins screen points for an SVG polygon, rounded to a tenth", () => {
    expect(
      toPoints([
        [0, 0],
        [40.04, 20.06],
        [-12.5, 3],
      ]),
    ).toBe("0,0 40,20.1 -12.5,3");
  });
});

describe("boxFaces", () => {
  it("returns the three faces a viewer sees: the top, the +y face (left) and the +x face (right)", () => {
    const faces = boxFaces(0, 0, 0, 1, 1, 1);
    expect(faces.top).toBe(toPoints([iso(0, 0, 1), iso(1, 0, 1), iso(1, 1, 1), iso(0, 1, 1)]));
    expect(faces.left).toBe(toPoints([iso(0, 1, 0), iso(1, 1, 0), iso(1, 1, 1), iso(0, 1, 1)]));
    expect(faces.right).toBe(toPoints([iso(1, 0, 0), iso(1, 1, 0), iso(1, 1, 1), iso(1, 0, 1)]));
  });

  it("places a box by its back corner and honours width, depth and height", () => {
    const faces = boxFaces(2, 3, 1, 4, 2, 0.5);
    expect(faces.top.split(" ")[0]).toBe(toPoints([iso(2, 3, 1.5)]));
    expect(faces.right.split(" ")[1]).toBe(toPoints([iso(6, 5, 1)]));
  });
});

describe("along", () => {
  it("is the screen offset for travelling down the route", () => {
    expect(along(3)).toEqual([3 * UNIT, 1.5 * UNIT]);
  });
});

describe("seeded", () => {
  it("repeats the same sequence for the same seed, inside [0, 1)", () => {
    const a = seeded(91);
    const b = seeded(91);
    const first = Array.from({ length: 6 }, () => a());
    expect(Array.from({ length: 6 }, () => b())).toEqual(first);
    expect(first.every((n) => n >= 0 && n < 1)).toBe(true);
  });

  it("gives a different sequence for a different seed", () => {
    expect(seeded(1)()).not.toBe(seeded(2)());
  });
});
