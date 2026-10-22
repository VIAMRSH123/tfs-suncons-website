import Image from "next/image";
import Link from "next/link";
import { AddToEnquiry } from "@/components/enquiry/AddToEnquiry";
import type { Product } from "@/content/products";
import { TypeSpecimen } from "./TypeSpecimen";

type ProductCardProps = {
  product: Product;
  index: number;
  tone?: "light" | "dark";
};

/**
 * One card for every product grid on the site. The link covers the pack and
 * its name; "Add to enquiry" sits outside it, because a button inside a link
 * is invalid and unusable by keyboard. A SKU with no photograph renders as a
 * type specimen rather than borrowing an unrelated stock image.
 */
export function ProductCard({ product, index, tone = "light" }: ProductCardProps) {
  const isDark = tone === "dark";

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/products/${product.category}/${product.slug}`}
        data-cursor-label="VIEW PRODUCT"
        className="flex flex-1 flex-col"
      >
        <div className={`pack-stage relative aspect-[4/5] ${product.image ? "window-light p-8" : ""}`}>
          <span
            className={`t-index t-meta absolute left-5 top-5 z-10 ${
              isDark ? "text-gold-soft" : "text-gold"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>

          {product.image ? (
            <Image
              src={product.image}
              alt={product.imageAlt}
              width={1000}
              height={1000}
              sizes="(max-width: 640px) 88vw, (max-width: 1024px) 45vw, 24vw"
              className="pack h-full w-auto object-contain transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
            />
          ) : (
            <TypeSpecimen name={product.name} tone={tone} />
          )}
        </div>

        <div className="hairline mt-5 flex items-baseline justify-between gap-3 pt-4">
          <h3 className={`t-title text-[1.4rem] ${isDark ? "text-ivory" : "text-forest"}`}>
            {product.name}
          </h3>
          <span className={`t-meta shrink-0 ${isDark ? "text-gold-soft" : "text-gold"}`}>
            {product.packSizes.length > 0 ? product.packSizes.join(" · ") : "Size on request"}
          </span>
        </div>

        <p className={`mt-2.5 text-sm leading-relaxed ${isDark ? "text-ivory/60" : "text-muted"}`}>
          {product.summary}
        </p>
      </Link>

      <div className="mt-5">
        <AddToEnquiry
          slug={product.slug}
          name={product.name}
          packSizes={product.packSizes}
          tone={tone}
        />
      </div>
    </article>
  );
}
