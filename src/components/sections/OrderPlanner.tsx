"use client";

import { useId, useState } from "react";
import { basketActions } from "@/components/enquiry/basketStore";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { products } from "@/content/products";
import { monthlyKgFromPortions, packsFor, parsePackKg } from "@/lib/planner";

/** Only products with a printed, readable pack weight can be planned. */
const plannable = products.filter((product) => product.packSizes.some((size) => parsePackKg(size) !== null));

const field =
  "w-full border-b border-sand bg-transparent py-3 text-charcoal outline-none transition-colors placeholder:text-muted/60 focus:border-forest";

const formatKg = (kg: number) =>
  kg.toLocaleString("en-GB", { maximumFractionDigits: kg < 10 ? 2 : 0 });

/**
 * "Plan an order" — turn a monthly need into whole packs, then into an enquiry
 * line. Two kinds of number go in: the pack weights printed on TFS packs, and
 * the buyer's own figures. Nothing assumes a portion size or a container load;
 * container fill is left out until TFS confirms the loads it quotes.
 */
export function OrderPlanner() {
  const id = useId();
  const [slug, setSlug] = useState(plannable[0]?.slug ?? "");
  const [chosenSize, setChosenSize] = useState("");
  const [mode, setMode] = useState<"kg" | "portions">("kg");
  const [kg, setKg] = useState("");
  const [portions, setPortions] = useState("");
  const [grams, setGrams] = useState("");
  const [days, setDays] = useState("30");
  const [added, setAdded] = useState<string | null>(null);

  const product = plannable.find((candidate) => candidate.slug === slug) ?? plannable[0];
  if (!product) return null;

  const sizes = product.packSizes.filter((size) => parsePackKg(size) !== null);
  const packSize = sizes.includes(chosenSize) ? chosenSize : sizes[0];
  const packKg = parsePackKg(packSize) ?? 0;
  const monthlyKg =
    mode === "kg"
      ? Math.max(0, Number(kg) || 0)
      : monthlyKgFromPortions(Number(portions), Number(grams), Number(days));
  const { packs, suppliedKg } = packsFor(monthlyKg, packKg);

  const handleAdd = () => {
    if (packs === 0) return;
    basketActions.add({ slug: product.slug, name: product.name, packSize, quantity: packs });
    setAdded(`${packs} × ${product.name} (${packSize}) added to your enquiry.`);
  };

  return (
    <section aria-labelledby="planner-heading" className="section bg-ivory">
      <div className="shell grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <SectionHeading
            index="07"
            label="Plan an order"
            id="planner-heading"
            lines={["Work out the order", "before you call."]}
            description="Turn what your kitchen or shelf gets through into whole packs — then add it to your enquiry in one step."
          />
          <Reveal delay={0.1}>
            <p className="hairline mt-10 max-w-[44ch] pt-4 text-sm leading-relaxed text-muted">
              Pack weights are as printed on TFS packs. Your figures are only used on this page;
              nothing is sent until you submit an enquiry.
            </p>
          </Reveal>
        </div>

        <Reveal className="md:col-span-6 md:col-start-7">
          <div className="grid gap-7 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`${id}-product`} className="t-meta text-muted">
                Product
              </label>
              <select
                id={`${id}-product`}
                value={product.slug}
                onChange={(event) => {
                  setSlug(event.target.value);
                  setAdded(null);
                }}
                className={`${field} mt-2`}
              >
                {plannable.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name} — {option.packSizes.join(", ")}
                  </option>
                ))}
              </select>
            </div>

            {sizes.length > 1 ? (
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-size`} className="t-meta text-muted">
                  Pack size
                </label>
                <select
                  id={`${id}-size`}
                  value={packSize}
                  onChange={(event) => setChosenSize(event.target.value)}
                  className={`${field} mt-2`}
                >
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <fieldset className="sm:col-span-2">
              <legend className="t-meta text-muted">I know my</legend>
              <div className="mt-3 inline-flex border border-forest/30">
                {(
                  [
                    ["kg", "Monthly kilos"],
                    ["portions", "Portions a day"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={`t-meta flex min-h-11 cursor-pointer items-center px-4 transition-colors ${
                      mode === value ? "bg-forest text-ivory" : "text-forest hover:bg-forest/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`${id}-mode`}
                      value={value}
                      checked={mode === value}
                      onChange={() => setMode(value)}
                      className="sr-only"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {mode === "kg" ? (
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-kg`} className="t-meta text-muted">
                  Kilos you get through a month
                </label>
                <input
                  id={`${id}-kg`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={kg}
                  onChange={(event) => setKg(event.target.value)}
                  placeholder="Kilograms per month"
                  className={`${field} mt-2`}
                />
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor={`${id}-portions`} className="t-meta text-muted">
                    Portions a day
                  </label>
                  <input
                    id={`${id}-portions`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={portions}
                    onChange={(event) => setPortions(event.target.value)}
                    className={`${field} mt-2`}
                  />
                </div>
                <div>
                  <label htmlFor={`${id}-grams`} className="t-meta text-muted">
                    Grams per portion (uncooked)
                  </label>
                  <input
                    id={`${id}-grams`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={grams}
                    onChange={(event) => setGrams(event.target.value)}
                    className={`${field} mt-2`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor={`${id}-days`} className="t-meta text-muted">
                    Days you serve in a month
                  </label>
                  <input
                    id={`${id}-days`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={31}
                    value={days}
                    onChange={(event) => setDays(event.target.value)}
                    className={`${field} mt-2`}
                  />
                </div>
              </>
            )}
          </div>

          <div className="contours contours-light mt-10 bg-paper p-7 md:p-9">
            <p className="t-meta text-muted">You would need, each month</p>
            <p aria-live="polite" className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="t-index text-[clamp(3rem,2rem+4vw,5.5rem)] leading-none text-forest">{packs}</span>
              <span className="font-display text-[1.35rem] text-forest">
                × {packSize} {packs === 1 ? "pack" : "packs"}
              </span>
            </p>
            <p className="mt-3 text-sm text-muted">
              {packs > 0
                ? `Supplies ${formatKg(suppliedKg)} kg against your ${formatKg(monthlyKg)} kg.`
                : "Enter your figures to see whole packs."}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={handleAdd}
                disabled={packs === 0}
                data-cursor-label="ADD"
                className="t-meta min-h-11 bg-forest px-6 py-3.5 text-ivory transition-colors hover:bg-forest-soft disabled:pointer-events-none disabled:opacity-40"
              >
                Add {packs > 0 ? `${packs} ${packs === 1 ? "pack" : "packs"}` : "packs"} to my enquiry
              </button>
              <p role="status" className="text-sm text-leaf">
                {added}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
