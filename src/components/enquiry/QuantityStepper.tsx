"use client";

type QuantityStepperProps = {
  quantity: number;
  onChange: (quantity: number) => void;
  /** What one unit is, for the accessible names: "35 kg pack". */
  unitLabel: string;
  productName: string;
  tone?: "light" | "dark";
};

/**
 * − n + for a basket line. Each button names exactly what it changes, and the
 * count is a live region so a screen reader hears the new quantity.
 */
export function QuantityStepper({
  quantity,
  onChange,
  unitLabel,
  productName,
  tone = "light",
}: QuantityStepperProps) {
  const isDark = tone === "dark";
  const button = `flex h-11 w-11 items-center justify-center text-lg leading-none transition-colors ${
    isDark ? "text-ivory hover:bg-ivory/10" : "text-forest hover:bg-forest/5"
  }`;

  return (
    <div
      className={`inline-flex items-center border ${isDark ? "border-ivory/30" : "border-forest/30"}`}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(quantity - 1)}
        aria-label={quantity === 1 ? `Remove ${productName}` : `One fewer ${unitLabel} of ${productName}`}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={`t-meta min-w-[4.5rem] text-center tabular-nums ${isDark ? "text-ivory" : "text-forest"}`}
      >
        {quantity} {quantity === 1 ? "pack" : "packs"}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(quantity + 1)}
        aria-label={`One more ${unitLabel} of ${productName}`}
      >
        +
      </button>
    </div>
  );
}
