import { iso, type ScreenPoint } from "./iso";
import { clamp01, type ProgressRange } from "./scroll";

/**
 * The journey hero's scroll story as pure maths. The scroll is a run of
 * beats: the camera holds on a chapter's stop while its caption is read, then
 * glides on with the cargo to the next. For scroll progress p (0–1) these say
 * where the camera is, which chapter is showing and where each vehicle is;
 * JourneyStage only applies the results.
 */

/** Where the camera centres for a ground point, in the world SVG's coordinates. */
export function cameraTarget(x: number, y: number, origin: ScreenPoint): ScreenPoint {
  const [sx, sy] = iso(x, y);
  return [sx + origin[0], sy + origin[1]];
}

const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Progress as a number in 0–1, whatever arrives: NaN reads as the start. */
const toProgress = (value: number): number => (Number.isFinite(value) ? clamp01(value) : 0);

/** One stretch of the scroll: a hold keeps the camera on `camera`, a glide eases it there from the previous beat's point. */
export type Beat = {
  kind: "hold" | "glide";
  /** The chapter whose caption shows; a glide belongs to the chapter it leaves. */
  chapter: number;
  /** Its length, relative to the other beats. */
  units: number;
  /** Where the camera is by the end of the beat, in world SVG pixels. */
  camera: ScreenPoint;
};

type Span = readonly [start: number, end: number];

export type Timeline = {
  beats: readonly Beat[];
  /** Each beat's span of progress. */
  spans: readonly Span[];
  /** Each chapter's span of progress, from its first beat to its last. */
  chapters: readonly Span[];
  /** All the beats' units together: the scroll length, in units. */
  units: number;
};

/** Lays the beats end to end across progress 0–1, each in proportion to its units. */
export function buildTimeline(beats: readonly Beat[]): Timeline {
  const units = beats.reduce((sum, beat) => sum + beat.units, 0);
  let at = 0;
  const spans = beats.map((beat, index): Span => {
    const start = at;
    at = index === beats.length - 1 ? 1 : at + beat.units / units;
    return [start, at];
  });
  const chapterCount = Math.max(...beats.map((beat) => beat.chapter)) + 1;
  const chapters = Array.from({ length: chapterCount }, (_, chapter): Span => {
    const own = spans.filter((_, index) => beats[index].chapter === chapter);
    return [own[0][0], own[own.length - 1][1]];
  });
  return { beats, spans, chapters, units };
}

/** The beat whose span holds p; a beat's end belongs to the next one. */
function beatAt(progress: number, spans: readonly Span[]): number {
  let index = 0;
  while (index < spans.length - 1 && progress >= spans[index][1]) index++;
  return index;
}

const share = (value: number, [start, end]: Span): number => (end > start ? clamp01((value - start) / (end - start)) : 1);

export type JourneyFrame = {
  /** The chapter whose caption and rail mark show. */
  chapter: number;
  /** The camera's target, in world pixels. */
  x: number;
  y: number;
  /** 0–1 through the chapter's own span: how full its rail bar is. */
  chapterProgress: number;
};

/**
 * The camera rests through a hold and eases in and out through a glide,
 * arriving on the next stop as the next beat begins. The caption changes when
 * the camera arrives at the next chapter's hold, not when it sets off.
 */
export function journeyAt(progress: number, { beats, spans, chapters }: Timeline): JourneyFrame {
  const p = toProgress(progress);
  const index = beatAt(p, spans);
  const beat = beats[index];
  const [x1, y1] = beat.camera;
  const [x0, y0] = beat.kind === "glide" && index > 0 ? beats[index - 1].camera : beat.camera;
  const t = easeInOut(share(p, spans[index]));
  return {
    chapter: beat.chapter,
    x: x0 + (x1 - x0) * t,
    y: y0 + (y1 - y0) * t,
    chapterProgress: share(p, chapters[beat.chapter]),
  };
}

/** The progress halfway through a chapter's hold — where choosing it on the rail scrolls to. */
export function dwellProgress(chapter: number, { beats, spans }: Timeline): number {
  const index = beats.findIndex((beat) => beat.chapter === chapter && beat.kind === "hold");
  if (index < 0) throw new Error(`Journey chapter ${chapter} has no hold`);
  const [start, end] = spans[index];
  return (start + end) / 2;
}

/**
 * A moment on the timeline, written as a beat's index plus how far through it:
 * 6 is the start of beat 6, 6.5 halfway through it, 7 its end.
 */
export type Moment = number;

/** The progress at a moment. */
export function progressAt(moment: Moment, { spans }: Timeline): number {
  const index = Math.min(spans.length - 1, Math.max(0, Math.floor(moment)));
  const [start, end] = spans[index];
  return start + (end - start) * clamp01(moment - index);
}

/** [moment, value] pairs, in order. */
export type Keys = readonly (readonly [Moment, number])[];

export type CargoTrack = {
  /** Where the vehicle is along the route (world x): it eases between keys, as the camera does, and waits outside them. */
  route: Keys;
  /** Its opacity, linear between keys; without keys it is always fully shown. */
  fade?: Keys;
};

export type CargoFrame = { x: number; opacity: number };

function sample(keys: Keys, progress: number, timeline: Timeline, ease: (t: number) => number): number {
  let previous = keys[0];
  if (progress <= progressAt(previous[0], timeline)) return previous[1];
  for (const key of keys.slice(1)) {
    const span: Span = [progressAt(previous[0], timeline), progressAt(key[0], timeline)];
    if (progress <= span[1]) return previous[1] + (key[1] - previous[1]) * ease(share(progress, span));
    previous = key;
  }
  return previous[1];
}

const linear = (t: number) => t;

/** Where each vehicle is, and how visible, at progress p. */
export function cargoAt(progress: number, tracks: readonly CargoTrack[], timeline: Timeline): CargoFrame[] {
  const p = toProgress(progress);
  return tracks.map(({ route, fade }) => ({
    x: sample(route, p, timeline, easeInOut),
    opacity: fade ? sample(fade, p, timeline, linear) : 1,
  }));
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
 * A length from a custom property, in pixels: `px` (or a bare number) as it
 * is; `%`, `cqw` and `cqh` as a share of `size`. Any other unit, `calc()` or
 * an empty value is NaN, so the caller can fall back rather than misplace.
 */
export function resolveLength(value: string, size: number): number {
  const match = /^\s*(-?\d*\.?\d+)\s*(px|%|cqw|cqh)?\s*$/.exec(value);
  if (!match) return Number.NaN;
  const amount = Number.parseFloat(match[1]);
  return match[2] && match[2] !== "px" ? (amount * size) / 100 : amount;
}
