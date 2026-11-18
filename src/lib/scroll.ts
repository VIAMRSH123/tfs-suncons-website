import { step } from "./follow";

/**
 * Scroll-linked progress without a scroll library.
 *
 * `start` and `end` are viewport fractions, in the same model ScrollTrigger
 * uses: progress is 0 when the element's top crosses `start` (0.92 = "top 92%")
 * and 1 when its bottom crosses `end` (0.62 = "bottom 62%"). A pinned section
 * is start 0, end 1: 0 when it reaches the top, 1 when its bottom leaves.
 */

export type ProgressRange = { start: number; end: number };

const FRAME_MS = 1000 / 60;

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Pure: where an element of `height`, whose top sits at `top`, is in its range. */
export function progressFromRect(
  top: number,
  height: number,
  viewport: number,
  { start, end }: ProgressRange,
): number {
  const span = height + (start - end) * viewport;
  if (span <= 0) return top <= start * viewport ? 1 : 0;
  return clamp01((start * viewport - top) / span);
}

type TrackOptions = ProgressRange & {
  /** 0–1 per 60 fps frame; lower is smoother. 1 = no smoothing. The same on any refresh rate. */
  smoothing?: number;
  /** Reads the range afresh on every measure, for one that moves with the viewport; overrides `start` and `end`. */
  getRange?: () => ProgressRange;
};

/**
 * Calls `onProgress` on animation frames while `element` is near the viewport.
 * Listens to scroll only while visible, and the frame loop sleeps once the
 * smoothed value has caught up. Returns a cleanup.
 */
export function trackScrollProgress(
  element: HTMLElement,
  onProgress: (progress: number) => void,
  { start, end, smoothing = 1, getRange }: TrackOptions,
): () => void {
  let target = 0;
  let current = -1;
  let frame = 0;
  let last = 0;

  const measure = () => {
    const rect = element.getBoundingClientRect();
    target = progressFromRect(rect.top, rect.height, window.innerHeight, getRange ? getRange() : { start, end });
  };

  const tick = (now: number) => {
    frame = 0;
    const frames = last ? Math.min((now - last) / FRAME_MS, 4) : 1;
    last = now;
    if (current < 0) current = target;
    const next = step(current, target, smoothing, frames);
    current = Math.abs(target - next) < 0.0005 ? target : next;
    onProgress(current);
    if (current !== target) frame = requestAnimationFrame(tick);
    else last = 0;
  };

  const schedule = () => {
    measure();
    if (!frame) frame = requestAnimationFrame(tick);
  };

  let listening = false;
  const listen = (on: boolean) => {
    if (on === listening) return;
    listening = on;
    if (on) {
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    } else {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    }
  };

  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => listen(entries.some((entry) => entry.isIntersecting)),
          { rootMargin: "25% 0px" },
        );

  if (observer) observer.observe(element);
  else listen(true);

  // Paint the right state immediately, even if the element starts off screen.
  measure();
  current = target;
  onProgress(current);

  return () => {
    observer?.disconnect();
    listen(false);
    cancelAnimationFrame(frame);
  };
}
