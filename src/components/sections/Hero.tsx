import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import { DepthField } from "@/components/motion/DepthField";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { TextReveal } from "@/components/motion/TextReveal";
import { company } from "@/content/company";
import { getProduct, type Product } from "@/content/products";

/**
 * Each row is read off the catalogue, and the origin column holds only what a
 * pack or the company states: "Telangana" is printed on the 91 pack; the other
 * two are marked Produce of India / Indian premium grade.
 */
const MANIFEST = [
  { slug: "91-telangana-gold", origin: "Telangana" },
  { slug: "bharat-gate", origin: "India" },
  { slug: "golden-grand", origin: "India" },
] as const;

type Row = { product: Product; origin: string; grade: string; weight: string };

const rows: Row[] = MANIFEST.map(({ slug, origin }) => {
  const product = getProduct("rice", slug);
  if (!product) throw new Error(`Hero manifest names a product that is not in the catalogue: ${slug}`);
  return { product, origin, grade: product.attributes[0] ?? "", weight: product.packSizes[0] ?? "" };
});

/** Where each pack stands in the composition — back to front. */
const PACK_LAYOUT = [
  { depth: 1, className: "left-[30%] bottom-[2%] w-[30%] -rotate-[5deg]" },
  { depth: 2, className: "right-[1%] bottom-[5%] w-[33%] rotate-[5deg]" },
  { depth: 3, className: "left-[47%] -bottom-[3%] w-[37%] z-10" },
] as const;

const delay = (seconds: number) => ({ "--reveal-delay": `${seconds}s` }) as CSSProperties;
const indexed = (i: number, seconds: number) =>
  ({ "--i": i, "--reveal-delay": `${seconds}s` }) as CSSProperties;

/**
 * "The packing list that becomes the packs." A trade document draws itself —
 * rules, then rows — and each row's pack lands in front of it under window
 * light. Everything is server-rendered in its final state and choreographed in
 * CSS from first paint, so nothing waits for JavaScript; the pointer depth is
 * the only enhancement.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="grain relative overflow-hidden bg-ivory pt-[72px]">
      <div className="shell grid min-h-[88svh] items-center gap-14 py-12 md:grid-cols-12 md:gap-8 md:py-16">
        <div className="md:col-span-6 lg:col-span-5">
          <p data-arrive style={delay(0.05)} className="t-meta text-gold">
            {company.tradingName} · Doha trading house
          </p>

          <TextReveal
            as="h1"
            id="hero-heading"
            immediate
            delay={0.12}
            lines={["Quality that", "travels well."]}
            className="t-hero mt-6 text-forest"
          />

          <p data-arrive style={delay(0.55)} className="t-lead mt-8 max-w-[44ch] text-charcoal/75">
            Basmati, sona masoori, ground spices and pulses — sourced in India, packed for the
            trade in 18, 20 and 35&nbsp;kg, and supplied to Qatar&rsquo;s wholesalers,
            supermarkets, hotels and caterers.
          </p>

          <div data-arrive style={delay(0.7)} className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton href="/products" cursorLabel="VIEW">
              View the portfolio
            </MagneticButton>
            <MagneticButton href="/contact#enquiry" variant="outline" cursorLabel="ENQUIRE" className="text-forest">
              Start a trade enquiry
            </MagneticButton>
          </div>
        </div>

        <DepthField className="window-light relative mx-auto w-full max-w-[44rem] md:col-span-6 lg:col-span-7">
          <div className="relative aspect-[5/4.4] w-full">
            <PackingList />

            {rows.map(({ product }, i) => (
              <div
                key={product.slug}
                data-depth={PACK_LAYOUT[i].depth}
                className={`absolute ${PACK_LAYOUT[i].className}`}
              >
                <div data-arrive style={{ ...delay(1.25 + i * 0.16), "--reveal-distance": "44px" } as CSSProperties}>
                  <span className="t-meta absolute -top-1 left-[8%] z-10 bg-forest px-1.5 py-0.5 text-[0.625rem] text-ivory">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Image
                    src={product.image ?? ""}
                    alt={product.imageAlt}
                    width={1000}
                    height={1000}
                    priority={PACK_LAYOUT[i].depth === 3}
                    sizes="(max-width: 768px) 38vw, 18vw"
                    className="pack h-auto w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </DepthField>
      </div>

      <div className="shell">
        <div className="hairline flex items-center justify-between py-5">
          <span className="t-meta text-muted">Scroll</span>
          <span
            aria-hidden="true"
            className="h-10 w-px animate-[heroCue_2.4s_var(--ease-in-out-soft)_infinite] bg-gradient-to-b from-gold to-transparent"
          />
          <span className="t-meta text-muted">Industrial Area, Doha</span>
        </div>
      </div>
    </section>
  );
}

/** The document itself: real text, a real table, rules that draw in. */
function PackingList() {
  return (
    /* Depth (pointer) and arrival (CSS animation) sit on separate elements: an
       animation's final frame would otherwise override the inline translate. */
    <div data-depth="1" className="absolute left-0 top-0 w-[86%] -rotate-[1.4deg]">
    <div
      data-arrive
      data-draw-now
      style={delay(0.3)}
      className="bg-paper px-5 py-5 shadow-[0_30px_60px_-34px_rgb(19_48_31/0.45)] md:px-7 md:py-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-[clamp(1.05rem,0.8rem+0.9vw,1.5rem)] tracking-[-0.01em] text-forest">
          Packing list
        </p>
        <p className="t-meta text-gold">TFS / DOH · No. 91</p>
      </div>
      <div data-draw-rule style={indexed(0, 0.45)} className="mt-3 h-px bg-forest/70" />
      <p className="t-meta mt-3 text-[0.6rem] text-muted">
        Shipper · {company.legalName}
      </p>

      <table className="mt-4 w-full border-collapse text-left">
        <caption className="sr-only">Three of the rice lines TFS supplies, as a packing list</caption>
        <thead>
          <tr className="t-meta text-[0.6rem] text-muted">
            <th scope="col" className="pb-2 pr-2 font-medium">No.</th>
            <th scope="col" className="pb-2 pr-2 font-medium">Description</th>
            <th scope="col" className="hidden pb-2 pr-2 font-medium sm:table-cell">Grade</th>
            <th scope="col" className="pb-2 pr-2 text-right font-medium">Net wt</th>
            <th scope="col" className="hidden pb-2 text-right font-medium sm:table-cell">Origin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, grade, weight, origin }, i) => (
            <Fragment key={product.slug}>
              {/* A ruled line that draws in — decoration, so screen readers skip it. */}
              <tr aria-hidden="true">
                <td colSpan={5} className="p-0">
                  <div data-draw-rule style={indexed(i + 1, 0.55)} className="h-px bg-sand" />
                </td>
              </tr>
              <tr
                data-arrive
                style={{ ...delay(0.85 + i * 0.12), "--reveal-distance": "0px" } as CSSProperties}
                className="align-baseline text-[clamp(0.72rem,0.62rem+0.35vw,0.9rem)] text-charcoal"
              >
                <td className="t-index py-2.5 pr-2 text-gold">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-2.5 pr-2 font-display text-[1.1em] text-forest">{product.name}</td>
                <td className="hidden py-2.5 pr-2 text-muted sm:table-cell">{grade}</td>
                <td className="t-index py-2.5 pr-2 text-right">{weight}</td>
                <td className="hidden py-2.5 text-right text-muted sm:table-cell">{origin}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <div data-draw-rule style={indexed(4, 0.6)} className="h-px bg-forest/70" />
      <p data-arrive style={delay(1.2)} className="t-meta mt-3 text-[0.6rem] text-muted">
        Labelled in three scripts · EN · AR · TE
      </p>
    </div>
    </div>
  );
}
