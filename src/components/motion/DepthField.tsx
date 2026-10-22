"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createFollower } from "@/lib/follow";
import { isTouchDevice, reducedMotionNow } from "@/lib/motion";

type DepthFieldProps = {
  children: ReactNode;
  className?: string;
  /** Pixels of travel for a layer at depth 1 when the pointer reaches an edge. */
  travel?: number;
};

/** About a third of a second to settle — slow enough to read as weight. */
const DEPTH_SMOOTHING = 0.1;

/**
 * The "track" verb: layers marked `data-depth="1|2|3"` drift with the pointer,
 * deeper layers less. Fine-pointer devices only, never under reduced motion;
 * the children are server-rendered and complete without it.
 */
export function DepthField({ children, className, travel = 12 }: DepthFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = ref.current;
    if (!field || isTouchDevice() || reducedMotionNow()) return;

    const layers = Array.from(field.querySelectorAll<HTMLElement>("[data-depth]")).map((layer) => ({
      depth: Number(layer.dataset.depth ?? 1),
      follow: createFollower((x, y) => {
        layer.style.translate = `${x}px ${y}px`;
      }, DEPTH_SMOOTHING),
    }));

    const handleMove = (event: PointerEvent) => {
      const bounds = field.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width - 0.5;
      const py = (event.clientY - bounds.top) / bounds.height - 0.5;
      layers.forEach(({ depth, follow }) => follow.to(px * travel * depth, py * travel * depth));
    };
    const handleLeave = () => layers.forEach(({ follow }) => follow.to(0, 0));

    field.addEventListener("pointermove", handleMove);
    field.addEventListener("pointerleave", handleLeave);
    return () => {
      field.removeEventListener("pointermove", handleMove);
      field.removeEventListener("pointerleave", handleLeave);
      layers.forEach(({ follow }) => follow.stop());
    };
  }, [travel]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
