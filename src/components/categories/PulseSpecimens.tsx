import Link from "next/link";
import { AddToEnquiry } from "@/components/enquiry/AddToEnquiry";
import { Reveal } from "@/components/motion/Reveal";
import { TypeSpecimen } from "@/components/ui/TypeSpecimen";
import type { Product } from "@/content/products";

/**
 * Four lines with no photography of their own. Rather than borrow someone
 * else's bowl of lentils, each is set as a type specimen — and the reason is
 * the first thing on the page, not a footnote.
 */
export function PulseSpecimens({ items }: { items: readonly Product[] }) {
  return (
    <section aria-label="The four pulse lines" className="section bg-ivory pt-0">
      <div className="shell">
        <Reveal>
          <p className="hairline max-w-[62ch] pt-5 text-[1.05rem] leading-relaxed text-charcoal/80">
            We don&rsquo;t yet have our own photography for this range, so these lines are shown by
            name rather than with stock pictures of someone else&rsquo;s product. Pack sizes and grades
            are quoted on enquiry.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {items.map((product, index) => (
            <Reveal key={product.slug} delay={(index % 2) * 0.08}>
              <article className="flex flex-col">
                <Link
                  href={`/products/pulses/${product.slug}`}
                  data-cursor-label="VIEW PRODUCT"
                  className="block aspect-[5/4] bg-paper transition-colors hover:bg-[color-mix(in_oklab,var(--color-sand)_35%,var(--color-paper))]"
                >
                  <TypeSpecimen name={product.name} size="hero" />
                </Link>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-muted">{product.summary}</p>
                  <AddToEnquiry slug={product.slug} name={product.name} packSizes={product.packSizes} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
