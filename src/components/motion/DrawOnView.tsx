"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { revealOnEnter } from "@/lib/motion";

/**
 * The "draw" verb for anything below the fold: strokes inside (with
 * pathLength="1") draw themselves when this scrolls into view. CSS in
 * styles/motion.css does the drawing; this only flags arrival.
 */
export function DrawOnView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return revealOnEnter(element);
  }, []);

  return (
    <div ref={ref} data-draw className={className}>
      {children}
    </div>
  );
}
