/**
 * Isometric (2:1) geometry for the journey diorama. World units: x runs down
 * the route (screen right and down), y across it (screen left and down), z up.
 * Everything here is pure, so the scene renders as plain server-side SVG.
 */

/** Screen pixels per world unit along an axis. */
export const UNIT = 40;

export type ScreenPoint = readonly [number, number];

export function iso(x: number, y: number, z = 0): ScreenPoint {
  return [(x - y) * UNIT, ((x + y) * UNIT) / 2 - z * UNIT];
}

/** The ground-plane projection as an SVG transform: draw flat shapes in world units beneath it. */
export const GROUND_MATRIX = `matrix(${UNIT} ${UNIT / 2} ${-UNIT} ${UNIT / 2} 0 0)`;

/** Rounds to a tenth of a pixel — plenty for SVG, and it keeps the markup small. */
export const tenth = (n: number): number => Math.round(n * 10) / 10;

/** Screen points as an SVG `points` attribute, rounded to keep the markup small. */
export function toPoints(points: readonly ScreenPoint[]): string {
  return points.map(([x, y]) => `${tenth(x)},${tenth(y)}`).join(" ");
}

export type BoxFaces = { top: string; left: string; right: string };

/** The three faces a viewer sees of a box whose back corner sits at (x, y, z). */
export function boxFaces(
  x: number,
  y: number,
  z: number,
  width: number,
  depth: number,
  height: number,
): BoxFaces {
  const x1 = x + width;
  const y1 = y + depth;
  const z1 = z + height;
  return {
    top: toPoints([iso(x, y, z1), iso(x1, y, z1), iso(x1, y1, z1), iso(x, y1, z1)]),
    left: toPoints([iso(x, y1, z), iso(x1, y1, z), iso(x1, y1, z1), iso(x, y1, z1)]),
    right: toPoints([iso(x1, y, z), iso(x1, y1, z), iso(x1, y1, z1), iso(x1, y, z1)]),
  };
}

/** Screen offset for travelling `distance` units down the route (+x). */
export function along(distance: number): ScreenPoint {
  return [distance * UNIT, (distance * UNIT) / 2];
}

/**
 * A small deterministic random source (mulberry32). Scattered scenery uses it
 * so the server and the browser draw exactly the same world.
 */
export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
