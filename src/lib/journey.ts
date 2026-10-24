import { iso, type ScreenPoint } from "./iso";
import { clamp01, type ProgressRange } from "./scroll";

/**
 * The journey hero's scroll story as pure maths: for scroll progress p (0–1)
 * across the pinned distance, where the camera is, which chapter is showing
 * and how far the cargo has travelled. JourneyStage only applies the results.
 */

/** Where the camera centres for a ground point, in the world SVG's coordinates. */
export function cameraTarget(x: number, y: number, origin: ScreenPoint): ScreenPoint {
  const [sx, sy] = iso(x, y);
  return [sx + origin[0], sy + origin[1]];
}

/**
 * The share of each chapter's scroll the camera rests on its stop, so the
 * caption can be read; the rest of the share is the glide to the next stop.
 */
export const DWELL = 0.4;

const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const ramp = (value: number, from: number, to: number): number => clamp01((value - from) / (to - from));

export type JourneyFrame = {
  /** The chapter whose share of the scroll p falls in: the caption and the rail follow it. */
  chapter: number;
  /** The camera's target, in world pixels. */
  x: number;
  y: number;
  /** 0–1 through the chapter's share of the scroll: how full its rail bar is. */
  chapterProgress: number;
};

/**
 * Each chapter owns an equal share of the scroll. The camera rests on the
 * chapter's stop for the first `dwell` of that share, then glides to the next
 * stop with ease-in-out, arriving just as the next chapter begins. The last
 * chapter has nowhere to go, so it holds to the end.
 */
export function journeyAt(progress: number, stops: readonly ScreenPoint[], dwell = DWELL): JourneyFrame {
  const scaled = clamp01(progress) * stops.length;
  const chapter = Math.min(stops.length - 1, Math.floor(scaled));
  const chapterProgress = scaled - chapter;
  const [x, y] = stops[chapter];
  const next = stops[chapter + 1];
  if (!next || chapterProgress <= dwell) return { chapter, x, y, chapterProgress };
  const t = easeInOut((chapterProgress - dwell) / (1 - dwell));
  return { chapter, x: x + (next[0] - x) * t, y: y + (next[1] - y) * t, chapterProgress };
}

/** The progress at the middle of a chapter's dwell — where choosing it on the rail scrolls to. */
export function dwellProgress(index: number, count: number, dwell = DWELL): number {
  return (index + dwell / 2) / count;
}

/** One leg of the cargo's journey: a vehicle carries it from world x `from` to `to` over chapters [first, last). */
export type Leg = { from: number; to: number; chapters: readonly [number, number] };

export type LegFrame = {
  /** World units the leg's vehicle has come down the route from `from`. */
  travelled: number;
  opacity: number;
};

/** The share of the scroll over which one vehicle hands the cargo to the next. */
export const HANDOVER = 0.03;

/**
 * Where each leg's vehicle is for progress p. Each one cruises at a constant
 * speed across its chapters, waits at the start of its leg until then and
 * parks at the end once done; at each boundary the outgoing and incoming
 * vehicles cross-fade over `handover`, so otherwise only one is in sight.
 */
export function convoyAt(progress: number, legs: readonly Leg[], count: number, handover = HANDOVER): LegFrame[] {
  const p = clamp01(progress);
  const half = handover / 2;
  return legs.map(({ from, to, chapters: [first, last] }, index) => {
    const start = first / count;
    const end = last / count;
    const fadeIn = index === 0 ? 1 : ramp(p, start - half, start + half);
    const fadeOut = index === legs.length - 1 ? 1 : 1 - ramp(p, end - half, end + half);
    return { travelled: (to - from) * ramp(p, start, end), opacity: Math.min(fadeIn, fadeOut) };
  });
}

/**
 * The inverse of progressFromRect (lib/scroll): where an element's top must
 * sit, relative to the viewport, for its progress to read `progress`.
 */
export function topForProgress(
  progress: number,
  height: number,
  viewport: number,
  { start, end }: ProgressRange,
): number {
  const span = Math.max(0, height + (start - end) * viewport);
  return start * viewport - clamp01(progress) * span;
}

/**
 * A length from a custom property, in pixels: `%`, `cqw` and `cqh` are read as
 * a share of `size`, anything else as px. Unreadable values count as zero.
 */
export function resolveLength(value: string, size: number): number {
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return /(?:%|cq[wh])\s*$/.test(value) ? (amount * size) / 100 : amount;
}
