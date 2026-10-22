"use client";

import { useState } from "react";
import { findLine } from "@/lib/basket";
import { basketActions, useBasket } from "./basketStore";
import { QuantityStepper } from "./QuantityStepper";

type AddToEnquiryProps = {
  slug: string;
  name: string;
  packSizes: readonly string[];
  tone?: "light" | "dark";
  /** Larger treatment for a product page; cards use the compact one. */
  size?: "compact" | "large";
};

/**
 * Marks a product for the trade enquiry. Packs with more than one printed size
 * get a size choice; products whose sizes are not published add as "size on
 * request". Once added, the button becomes a quantity stepper in place.
 */
export function AddToEnquiry({
  slug,
  name,
  packSizes,
  tone = "light",
  size = "compact",
}: AddToEnquiryProps) {
  const basket = useBasket();
  const [packSize, setPackSize] = useState(packSizes[0] ?? "");
  const line = findLine(basket, slug, packSize);
  const isDark = tone === "dark";
  const unitLabel = packSize ? `${packSize} pack` : "pack";

  const sizeChoice =
    packSizes.length > 1 ? (
      <label className="flex items-center gap-2">
        <span className="sr-only">Pack size for {name}</span>
        <select
          value={packSize}
          onChange={(event) => setPackSize(event.target.value)}
          className={`t-meta h-11 border bg-transparent px-3 ${
            isDark ? "border-ivory/30 text-ivory" : "border-forest/30 text-forest"
          }`}
        >
          {packSizes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    ) : null;

  if (line) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        {sizeChoice}
        <QuantityStepper
          quantity={line.quantity}
          onChange={(quantity) => basketActions.set(slug, packSize, quantity)}
          unitLabel={unitLabel}
          productName={name}
          tone={tone}
        />
      </div>
    );
  }

  const padding = size === "large" ? "px-6 py-3.5" : "px-4 py-2.5";
  return (
    <div className="flex flex-wrap items-center gap-3">
      {sizeChoice}
      <button
        type="button"
        onClick={() => basketActions.add({ slug, name, packSize, quantity: 1 })}
        data-cursor-label="ADD"
        className={`t-meta inline-flex min-h-11 items-center gap-2 border transition-colors duration-200 ${padding} ${
          isDark
            ? "border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory hover:text-forest"
            : "border-forest/40 text-forest hover:border-forest hover:bg-forest hover:text-ivory"
        }`}
      >
        <span aria-hidden="true">+</span> Add to enquiry
        <span className="sr-only">: {name}{packSize ? `, ${packSize}` : ""}</span>
      </button>
    </div>
  );
}
