"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * The motion system's environment checks and observers. Nothing here animates:
 * every verb (rise, unmask, settle, draw, track) is CSS in `styles/motion.css`,
 * and these helpers only decide *when* an element is told it has arrived.
 */

/** useLayoutEffect warns during SSR; fall back to useEffect on the server. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Read once, synchronously, inside the effect that sets an animation up. CSS
 * already handles someone flipping the OS setting mid-session, via the
 * `prefers-reduced-motion` block in styles/motion.css.
 */
export function reducedMotionNow(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** True for devices without a precise pointer: no custom cursor, no magnets. */
export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Roughly "the element's top passes 82% of the viewport" — when reveals fire. */
export const REVEAL_MARGIN = "0px 0px -18% 0px";

/** Calls `onEnter` once, the first time `element` scrolls into view. Returns a cleanup. */
export function observeOnce(
  element: Element,
  onEnter: () => void,
  rootMargin: string = REVEAL_MARGIN,
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onEnter();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      onEnter();
    },
    { rootMargin },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/** Reports `true`/`false` as `element` enters and leaves the viewport — for pausing loops. */
export function observeVisibility(
  element: Element,
  onChange: (isVisible: boolean) => void,
  rootMargin = "0px",
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true);
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];
      if (entry) onChange(entry.isIntersecting);
    },
    { rootMargin },
  );
  observer.observe(element);
  return () => observer.disconnect();
}

/** Marks an element `data-revealed` the first time it scrolls into view. */
export function revealOnEnter(element: HTMLElement, rootMargin?: string): () => void {
  return observeOnce(element, () => element.setAttribute("data-revealed", ""), rootMargin);
}
