"use client";

import { useEffect, useRef } from "react";
import { createFollower } from "@/lib/follow";
import { isTouchDevice, reducedMotionNow } from "@/lib/motion";

/** Per-frame smoothing: the dot tracks almost exactly, the ring trails. */
const DOT_SMOOTHING = 0.55;
const RING_SMOOTHING = 0.2;

const INTERACTIVE = "[data-cursor-label], a, button, input, textarea, select, [role='button']";

/**
 * Dot + ring cursor with contextual labels.
 *
 * Rules it obeys, deliberately:
 *  · never rendered on touch devices or under prefers-reduced-motion
 *  · `pointer-events: none` throughout, so links, buttons, text selection and
 *    form controls behave exactly as they would without it
 *  · the real cursor is only hidden once this one is actually running
 *  · position is written to refs on animation frames — no React state per move;
 *    hover and label states are data attributes the CSS transitions between
 *
 * Opt an element in with `data-cursor-label="VIEW"`.
 */
export function CustomCursor() {
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!root || !dot || !ring || !label) return;
    if (isTouchDevice() || reducedMotionNow()) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dotFollow = createFollower((x, y) => {
      dot.style.translate = `${x}px ${y}px`;
    }, DOT_SMOOTHING);
    const ringFollow = createFollower((x, y) => {
      ring.style.translate = `${x}px ${y}px`;
    }, RING_SMOOTHING);

    let isVisible = false;

    const handleMove = (event: PointerEvent) => {
      if (!isVisible) {
        isVisible = true;
        dotFollow.jump(event.clientX, event.clientY);
        ringFollow.jump(event.clientX, event.clientY);
        root.dataset.visible = "true";
      }
      dotFollow.to(event.clientX, event.clientY);
      ringFollow.to(event.clientX, event.clientY);
    };

    const handleLeave = () => {
      isVisible = false;
      root.dataset.visible = "false";
    };

    const handleOver = (event: PointerEvent) => {
      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(INTERACTIVE);
      const text = target?.dataset.cursorLabel;
      if (text) {
        label.textContent = text;
        root.dataset.state = "label";
        return;
      }
      root.dataset.state = target ? "hover" : "idle";
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("pointerover", handleOver, { passive: true });
    document.addEventListener("pointerleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerover", handleOver);
      document.removeEventListener("pointerleave", handleLeave);
      document.documentElement.classList.remove("has-custom-cursor");
      dotFollow.stop();
      ringFollow.stop();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-visible="false"
      data-state="idle"
      className="custom-cursor pointer-events-none fixed inset-0 z-[100] hidden md:block"
    >
      <div ref={ringRef} className="custom-cursor__ring">
        <span ref={labelRef} className="custom-cursor__label t-meta" />
      </div>
      <div ref={dotRef} className="custom-cursor__dot" />
    </div>
  );
}
