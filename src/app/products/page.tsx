import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { CatalogueCard } from "@/components/products/CatalogueCard";
import { ProductFilter } from "@/components/products/ProductFilter";
import { PageHero } from "@/components/ui/PageHero";
import { ProductCard } from "@/components/ui/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { categories, getProductsByCategory, products } from "@/content/products";
import { sentenceCount, numberWord } from "@/lib/format";

export const metadata: Metadata = {
  title: "Products — Rice, Spices, Pulses & Sugar",
  description:
    "The full TF Suncons portfolio: seven rice varieties from 1121 basmati to sona masoori, ground spices at 1 kg, pulses and sugar — supplied across Qatar in trade pack sizes.",
  alternates: { canonical: "/products" },
};

const groups = categories.map((category) => ({ category, items: getProductsByCategory(category.slug) }));

/** Both counts come from the catalogue, so the copy can never fall behind it again. */
const summary = `${sentenceCount(categories.length, "category", "categories")}, ${numberWord(products.length)} lines. Rice is the core; spices, pulses and sugar travel the same route and are held to the same handling.`;

export default function ProductsPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="Portfolio"
        lines={["Everything", "we supply."]}
        description={summary}
        crumbs={[{ href: "/", label: "Home" }]}
        aside={<CatalogueCard productCount={products.length} />}
      />

      <ProductFilter
        targetId="portfolio-groups"
        total={products.length}
        options={groups.map(({ category, items }) => ({
          slug: category.slug,
          name: category.name,
          count: items.length,
        }))}
      />

      <div id="portfolio-groups" data-filter="all" className="product-groups scroll-mt-[140px]">
        {groups.map(({ category, items }, categoryIndex) => {
          const isDark = categoryIndex % 2 === 1;
          return (
            <section
              key={category.slug}
              id={category.slug}
              data-category={category.slug}
              aria-labelledby={`${category.slug}-heading`}
              className={`section scroll-mt-32 ${isDark ? "dark-section contours" : "bg-ivory"}`}
            >
              <div className="shell">
                <div className="grid gap-8 md:grid-cols-12">
                  <SectionHeading
                    index={String(categoryIndex + 1).padStart(2, "0")}
                    label={`${items.length} ${items.length === 1 ? "line" : "lines"}`}
                    id={`${category.slug}-heading`}
                    lines={[category.name]}
                    className="md:col-span-4"
                  />
                  <Reveal delay={0.08} className="md:col-span-7 md:col-start-6 md:self-end">
                    <p className={`t-lead ${isDark ? "text-ivory/70" : "text-charcoal/75"}`}>
                      {category.description}
                    </p>
                  </Reveal>
                </div>

                <div className="mt-14 grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((product, index) => (
                    <Reveal key={product.slug} delay={(index % 4) * 0.05}>
                      <ProductCard product={product} index={index} tone={isDark ? "dark" : "light"} />
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="section bg-paper">
        <div className="shell grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="t-display text-forest">Need a pack size or grade that isn&rsquo;t listed?</h2>
            <p className="t-lead mt-5 max-w-[48ch] text-charcoal/75">
              Pack weights, grades and formats vary by order. Tell us what you buy and we&rsquo;ll come
              back with what we can supply.
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <MagneticButton href="/contact#enquiry" cursorLabel="ENQUIRE">
              Start a trade enquiry
            </MagneticButton>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
