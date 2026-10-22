"use client";

import { basketActions, useBasket } from "./basketStore";
import { QuantityStepper } from "./QuantityStepper";

type BasketLinesProps = {
  tone?: "light" | "dark";
  /** Shown when the basket is empty; omit to render nothing. */
  emptyHint?: string;
};

/**
 * The basket as a short manifest: product, pack size, quantity, remove.
 * Used in the enquiry form so the buyer sees exactly what will be sent.
 */
export function BasketLines({ tone = "light", emptyHint }: BasketLinesProps) {
  const basket = useBasket();
  const isDark = tone === "dark";

  if (basket.length === 0) {
    return emptyHint ? (
      <p className={`text-sm leading-relaxed ${isDark ? "text-ivory/60" : "text-muted"}`}>
        {emptyHint}
      </p>
    ) : null;
  }

  return (
    <ul className={`divide-y ${isDark ? "divide-ivory/15" : "divide-sand"}`}>
      {basket.map((line) => (
        <li
          key={`${line.slug}-${line.packSize}`}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
        >
          <div className="min-w-0">
            <p className={`font-display text-[1.15rem] leading-tight ${isDark ? "text-ivory" : "text-forest"}`}>
              {line.name}
            </p>
            <p className={`t-meta mt-1 ${isDark ? "text-gold-soft" : "text-gold"}`}>
              {line.packSize || "Size on request"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <QuantityStepper
              quantity={line.quantity}
              onChange={(quantity) => basketActions.set(line.slug, line.packSize, quantity)}
              unitLabel={line.packSize ? `${line.packSize} pack` : "pack"}
              productName={line.name}
              tone={tone}
            />
            <button
              type="button"
              onClick={() => basketActions.remove(line.slug, line.packSize)}
              className={`t-meta link-underline min-h-11 px-1 ${isDark ? "text-ivory/60" : "text-muted"}`}
            >
              Remove<span className="sr-only"> {line.name}</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
