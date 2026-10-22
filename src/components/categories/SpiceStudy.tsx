import Image from "next/image";
import Link from "next/link";
import { AddToEnquiry } from "@/components/enquiry/AddToEnquiry";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/content/products";

/**
 * A colour study of the three pouches. Each field's text colour was chosen by
 * computed contrast, not by eye: forest on turmeric 6.4:1, ivory on the olive
 * 5.7:1, ivory on chilli 6.4:1.
 */
const FIELDS: Record<string, { background: string; isLight: boolean }> = {
  "turmeric-powder": { background: "#c8952b", isLight: false },
  "coriander-powder": { background: "#5e6238", isLight: true },
  "chilli-powder": { background: "#9e3328", isLight: true },
};

export function SpiceStudy({ items }: { items: readonly Product[] }) {
  return (
    <section aria-label="The three spices" className="grid md:grid-cols-3">
      {items.map((product, index) => {
        const field = FIELDS[product.slug] ?? { background: "#13301f", isLight: true };
        const ink = field.isLight ? "text-ivory" : "text-forest-deep";
        return (
          <Reveal key={product.slug} delay={index * 0.08} className="flex">
            <article
              className="flex min-h-[38rem] w-full flex-col justify-between p-8 md:p-10"
              style={{ backgroundColor: field.background }}
            >
              <p className={`t-meta ${ink}`}>
                {String(index + 1).padStart(2, "0")} · {product.packSizes[0] ?? "Size on request"}
              </p>
              <Link href={`/products/spices/${product.slug}`} data-cursor-label="VIEW PRODUCT" className="group block">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    width={1000}
                    height={1000}
                    sizes="(max-width: 768px) 70vw, 24vw"
                    className="pack-on-dark pack mx-auto h-auto w-[72%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:-rotate-2"
                  />
                ) : null}
                <h2 className={`mt-8 font-display text-[clamp(2rem,1.4rem+2vw,3rem)] leading-none tracking-[-0.02em] ${ink}`}>
                  {product.name}
                </h2>
                <p className={`mt-3 max-w-[34ch] text-sm leading-relaxed ${ink} opacity-90`}>{product.summary}</p>
              </Link>
              <div className="mt-6">
                <AddToEnquiry
                  slug={product.slug}
                  name={product.name}
                  packSizes={product.packSizes}
                  tone={field.isLight ? "dark" : "light"}
                />
              </div>
            </article>
          </Reveal>
        );
      })}
    </section>
  );
}
