"use client";

import { useEffect, useRef } from "react";
import { observeVisibility, reducedMotionNow } from "@/lib/motion";

/** The characters a flap cycles through before it lands. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·";

/**
 * The range stated the way the trade states it — grade and weight, no brand
 * names. Every line is checked against the catalogue in content/products.ts:
 * sona masoori ships at 18 kg, 1121 basmati at 20 kg, long grain at 35 kg,
 * ground spice at 1 kg, and every pack is labelled in three scripts.
 */
const ROWS = [
  { left: "SONA MASOORI", right: "18 KG" },
  { left: "BASMATI 1121", right: "20 KG" },
  { left: "LONG GRAIN", right: "35 KG" },
  { left: "GROUND SPICE", right: "01 KG" },
  { left: "EN · AR · TE", right: "PACKED" },
] as const;

const LEFT_WIDTH = 14;
const RIGHT_WIDTH = 6;

/**
 * A split-flap freight board. Each cell spins through glyphs and lands on its
 * character, staggered across the board so it ripples left to right — the
 * register of shipping and arrivals rather than retail.
 *
 * Under reduced motion every cell is simply set to its final character.
 */
export function TradeBoard() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (reducedMotionNow()) return;

    const cells = Array.from(root.querySelectorAll<HTMLElement>("[data-cell]"));
    let frame = 0;

    // One frame loop drives every flap: each has its own spin count, duration
    // and start offset, and eases out (power2) onto its character.
    const run = () => {
      cancelAnimationFrame(frame);
      const flaps = cells.map((cell, index) => ({
        cell,
        index,
        target: cell.dataset.target ?? "",
        spins: 7 + (index % 5) * 2,
        duration: 500 + (index % 7) * 90,
        delay: index * 12,
      }));
      const startedAt = performance.now();

      const tick = (now: number) => {
        let isBusy = false;
        for (const flap of flaps) {
          const t = (now - startedAt - flap.delay) / flap.duration;
          if (t >= 1) {
            if (flap.cell.textContent !== flap.target) flap.cell.textContent = flap.target;
            continue;
          }
          isBusy = true;
          if (t < 0) continue;
          const step = Math.floor((1 - (1 - t) * (1 - t)) * flap.spins);
          flap.cell.textContent =
            step >= flap.spins - 1
              ? flap.target
              : GLYPHS[(step * 7 + flap.index) % GLYPHS.length];
        }
        frame = isBusy ? requestAnimationFrame(tick) : 0;
      };
      frame = requestAnimationFrame(tick);
    };

    // Like the departures board it imitates, it flips each time it comes into view.
    let wasVisible = false;
    const stopWatching = observeVisibility(
      root,
      (isVisible) => {
        if (isVisible && !wasVisible) run();
        wasVisible = isVisible;
      },
      "0px 0px -20% 0px",
    );

    return () => {
      stopWatching();
      cancelAnimationFrame(frame);
    };
  }, []);

  const renderCells = (text: string, width: number, padStart: boolean) => {
    const padded = padStart
      ? text.padStart(width, " ")
      : text.padEnd(width, " ").slice(0, width);

    return padded.split("").map((char, i) => (
      <span
        key={`${text}-${padStart ? "r" : "l"}-${i}`}
        data-cell
        data-target={char}
        className={`inline-flex h-7 w-[15px] items-center justify-center bg-[color-mix(in_oklab,var(--color-charcoal)_9%,transparent)] font-mono text-[12px] ${
          padStart ? "text-gold" : "text-charcoal"
        }`}
      >
        {char}
      </span>
    ));
  };

  return (
    <div
      ref={rootRef}
      className="bg-[color-mix(in_oklab,var(--color-sand)_55%,var(--color-ivory))] p-7 md:p-9"
    >
      <p className="t-meta text-muted">The range, in trade terms</p>

      <div className="mt-6 space-y-2.5">
        {ROWS.map((row) => (
          <div
            key={row.left}
            className="flex items-center justify-between gap-4"
          >
            <span aria-hidden="true" className="flex gap-[2px]">
              {renderCells(row.left, LEFT_WIDTH, false)}
            </span>
            <span aria-hidden="true" className="flex shrink-0 gap-[2px]">
              {renderCells(row.right, RIGHT_WIDTH, true)}
            </span>
            {/* The flaps are a visual device; this is what is actually read. */}
            <span className="sr-only">
              {row.left} — {row.right}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
