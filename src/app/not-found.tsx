import Link from "next/link";
import { GrainMark } from "@/components/motion/GrainMark";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { categories } from "@/content/products";

/**
 * Most bad links will be old WordPress URLs, so this leads straight back into
 * the portfolio. The 91 mark scatters under the pointer and gathers again.
 */
export default function NotFound() {
  return (
    <section className="grain relative overflow-hidden bg-ivory pt-[72px]">
      <div className="shell grid min-h-[78svh] items-center gap-12 py-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <p className="t-meta text-gold">Error 404</p>
          <h1 className="t-hero mt-6 max-w-[16ch] text-forest">That page isn&rsquo;t on the shelf.</h1>
          <p className="t-lead mt-7 max-w-[46ch] text-charcoal/75">
            The link may be from the old site. The portfolio is all here — rice, spices, pulses and
            sugar.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton href="/products" cursorLabel="VIEW">
              View the portfolio
            </MagneticButton>
            <MagneticButton href="/contact" variant="outline" className="text-forest">
              Contact us
            </MagneticButton>
          </div>

          <ul className="hairline mt-14 flex flex-wrap gap-x-8 gap-y-3 pt-5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/products/${category.slug}`} className="t-meta link-underline text-muted hover:text-forest">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <GrainMark className="mx-auto w-full max-w-[28rem]" label="The 91 mark, built from rice grain" />
          <p className="t-meta mt-4 text-center text-muted">Move through it — it gathers again</p>
        </div>
      </div>
    </section>
  );
}
