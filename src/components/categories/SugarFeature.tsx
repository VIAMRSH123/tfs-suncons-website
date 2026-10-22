import Image from "next/image";
import Link from "next/link";
import { AddToEnquiry } from "@/components/enquiry/AddToEnquiry";
import { Reveal } from "@/components/motion/Reveal";
import type { Product } from "@/content/products";

/** One product does not need a grid: a single feature that hands straight to its page. */
export function SugarFeature({ product }: { product: Product }) {
  return (
    <section aria-label={product.name} className="section bg-ivory pt-0">
      <div className="shell grid items-center gap-12 md:grid-cols-12 md:gap-10">
        <Reveal className="md:col-span-7">
          <div className="pack-stage window-light aspect-[5/4] p-[10%]">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.imageAlt}
                width={1000}
                height={1000}
                sizes="(max-width: 768px) 90vw, 55vw"
                className="pack h-full w-auto object-contain"
              />
            ) : null}
          </div>
        </Reveal>
        <Reveal delay={0.08} className="md:col-span-4 md:col-start-9">
          <p className="t-meta text-gold">{product.packSizes.join(" · ") || "Size on request"}</p>
          <h2 className="t-display mt-4 text-forest">{product.name}</h2>
          <p className="t-lead mt-6 text-charcoal/75">{product.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {product.attributes.map((attribute) => (
              <li key={attribute} className="t-meta border border-sand px-3 py-2 text-muted">
                {attribute}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <AddToEnquiry slug={product.slug} name={product.name} packSizes={product.packSizes} size="large" />
            <Link href={`/products/sugar/${product.slug}`} className="t-meta link-underline text-forest">
              Product details →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
