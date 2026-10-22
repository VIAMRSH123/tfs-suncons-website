import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/content/products";

const SOURCE: Record<Product["verified"], string> = {
  pack: "Read off the pack",
  site: "Published by TFS",
  owner: "Supplied by TFS",
};

/**
 * Seven rice lines, side by side — the comparison a buyer actually makes.
 * Only fields readable on the pack or published by TFS; grades, moisture and
 * broken-grain figures are quoted on enquiry rather than guessed at here.
 */
export function GradeGuide({ items }: { items: readonly Product[] }) {
  return (
    <section aria-labelledby="grade-guide-heading" className="section bg-paper">
      <div className="shell">
        <SectionHeading
          index="02"
          label="Grade guide"
          id="grade-guide-heading"
          lines={["Which rice", "for which kitchen."]}
          description="Every line in the range, compared on what is printed on the pack. Moisture and broken-grain specifications are shared on enquiry."
          className="max-w-3xl"
        />

        <Reveal className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <caption className="sr-only">The seven TFS rice lines compared by grade, pack size and printed marks</caption>
            <thead>
              <tr className="t-meta border-b border-forest/60 text-muted">
                <th scope="col" className="py-3 pr-4 font-medium">No.</th>
                <th scope="col" className="py-3 pr-4 font-medium">Line</th>
                <th scope="col" className="py-3 pr-4 font-medium">Grade</th>
                <th scope="col" className="py-3 pr-4 font-medium">Pack</th>
                <th scope="col" className="py-3 pr-4 font-medium">Also on the pack</th>
                <th scope="col" className="py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product, index) => (
                <tr key={product.slug} className="group border-b border-sand align-baseline">
                  <td className="t-index py-4 pr-4 text-gold">{String(index + 1).padStart(2, "0")}</td>
                  <th scope="row" className="py-4 pr-4 font-normal">
                    <Link
                      href={`/products/rice/${product.slug}`}
                      data-cursor-label="VIEW PRODUCT"
                      className="font-display text-[1.2rem] text-forest transition-colors group-hover:text-leaf"
                    >
                      {product.name}
                    </Link>
                  </th>
                  <td className="py-4 pr-4 text-charcoal/80">{product.attributes[0]}</td>
                  <td className="t-index py-4 pr-4 text-charcoal">{product.packSizes.join(" · ") || "On request"}</td>
                  <td className="py-4 pr-4 text-sm text-muted">{product.attributes.slice(1).join(" · ")}</td>
                  <td className="t-meta py-4 text-muted">{SOURCE[product.verified]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
