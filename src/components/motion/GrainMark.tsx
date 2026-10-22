"use client";

import { useEffect, useRef } from "react";
import { observeVisibility, reducedMotionNow } from "@/lib/motion";
import { GRAIN_PALETTE, drawGrain, mountCanvas, seeded } from "./grainCanvas";
import { buildMark } from "./grainStates";

const GOLD_RATIO = 0.2;
/** Spring back home, and how quickly motion bleeds away. */
const SPRING = 0.045;
const DAMPING = 0.86;
/** Pointer reach as a share of the canvas, and how hard it pushes. */
const REACH = 0.16;
const PUSH = 0.9;
/** Below this much total movement, the frame loop goes to sleep. */
const REST = 0.02;

type GrainMarkProps = {
  className?: string;
  count?: number;
  /** Accessible description; the canvas is otherwise decorative. */
  label?: string;
};

type Grain = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; size: number; isGold: boolean };

/**
 * The 91 pack mark — numerals, ring and wheat wreath — built from grain. When
 * it comes into view the grains gather from a loose field; move the pointer
 * through it and they scatter, then spring back. The loop only runs while the
 * canvas is on screen and something is still moving. Reduced motion paints the
 * finished mark once.
 */
export function GrainMark({ className = "", count = 1100, label }: GrainMarkProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const rng = seeded(910091);
    const golds = Array.from({ length: count }, () => rng() < GOLD_RATIO);
    const home = buildMark(count, golds, rng);
    const isStill = reducedMotionNow();

    // Start as a loose field around the mark (or already home, if still).
    const grains: Grain[] = home.map(([hx, hy], i) => {
      const angle = rng() * Math.PI * 2;
      const spread = 0.25 + rng() * 0.35;
      return {
        hx,
        hy,
        x: isStill ? hx : 0.5 + Math.cos(angle) * spread,
        y: isStill ? hy : 0.5 + Math.sin(angle) * spread,
        vx: 0,
        vy: 0,
        size: 0.72 + rng() * 0.58,
        isGold: golds[i],
      };
    });

    let pointer: { x: number; y: number } | null = null;
    let isVisible = false;
    let frame = 0;

    const paint = () => {
      const { ctx, w, h } = stage;
      ctx.clearRect(0, 0, w, h);
      const size = Math.min(w, h);
      const ox = (w - size) / 2;
      const oy = (h - size) / 2;
      for (const grain of grains) {
        const speed = Math.hypot(grain.vx, grain.vy);
        drawGrain(
          ctx,
          ox + grain.x * size,
          oy + grain.y * size,
          speed > 0.0008 ? Math.atan2(grain.vy, grain.vx) : -0.32,
          2.3 * grain.size * (size / 480),
          0.9 * grain.size * (size / 480),
          grain.isGold ? GRAIN_PALETTE.gold : GRAIN_PALETTE.forest,
          grain.isGold ? 0.85 : 0.6,
        );
      }
    };

    const tick = () => {
      let motion = 0;
      for (const grain of grains) {
        let ax = (grain.hx - grain.x) * SPRING;
        let ay = (grain.hy - grain.y) * SPRING;
        if (pointer) {
          const dx = grain.x - pointer.x;
          const dy = grain.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REACH && dist > 0.0001) {
            const force = (1 - dist / REACH) * PUSH * 0.02;
            ax += (dx / dist) * force;
            ay += (dy / dist) * force;
          }
        }
        grain.vx = (grain.vx + ax) * DAMPING;
        grain.vy = (grain.vy + ay) * DAMPING;
        grain.x += grain.vx;
        grain.y += grain.vy;
        motion += Math.abs(grain.vx) + Math.abs(grain.vy) + Math.abs(grain.hx - grain.x) * 0.05;
      }
      paint();
      frame = isVisible && (pointer || motion > REST) ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (!frame && isVisible && !isStill) frame = requestAnimationFrame(tick);
    };

    const { stage, destroy } = mountCanvas(canvas, paint);
    paint();
    if (isStill) return () => destroy();

    const toLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      return {
        x: (event.clientX - rect.left - (rect.width - size) / 2) / size,
        y: (event.clientY - rect.top - (rect.height - size) / 2) / size,
      };
    };
    const handleMove = (event: PointerEvent) => {
      pointer = toLocal(event);
      wake();
    };
    const handleLeave = () => {
      pointer = null;
      wake();
    };

    const stopWatching = observeVisibility(wrap, (next) => {
      isVisible = next;
      if (next) wake();
    });
    wrap.addEventListener("pointermove", handleMove);
    wrap.addEventListener("pointerleave", handleLeave);

    return () => {
      stopWatching();
      wrap.removeEventListener("pointermove", handleMove);
      wrap.removeEventListener("pointerleave", handleLeave);
      cancelAnimationFrame(frame);
      destroy();
    };
  }, [count]);

  return (
    <div ref={wrapRef} className={`relative ${className}`} role={label ? "img" : undefined} aria-label={label}>
      <canvas ref={canvasRef} aria-hidden="true" className="block aspect-square w-full" />
    </div>
  );
}
