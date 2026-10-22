import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GradeGuide } from "@/components/categories/GradeGuide";
import { PulseSpecimens } from "@/components/categories/PulseSpecimens";
import { SpiceStudy } from "@/components/categories/SpiceStudy";
import { SugarFeature } from "@/components/categories/SugarFeature";
import { PageTransition } from "@/components/layout/PageTransition";
import { GrainMark } from "@/components/motion/GrainMark";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { NinetyOneMark } from "@/components/ui/NinetyOneMark";
import { PageHero } from "@/components/ui/PageHero";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  categories,
  getCategory,
  getProductsByCategory,
  type CategorySlug,
  type Product,
} from "@/content/products";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  return {
    title: `${category.name} — ${category.tagline}`,
    description: category.description,
    alternates: { canonical: `/products/${category.slug}` },
  };
}

function ProductGrid({ items }: { items: readonly Product[] }) {
  return (
    <section aria-label="Products" className="section bg-ivory pt-0">
      <div className="shell">
        <div className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product, index) => (
            <Reveal key={product.slug} delay={(index % 3) * 0.06}>
              <ProductCard product={product} index={index} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Each category gets the treatment its material suggests — one idea per page. */
function CategoryBody({ slug, items }: { slug: CategorySlug; items: readonly Product[] }) {
  switch (slug) {
    case "rice":
      return (
        <>
          <ProductGrid items={items} />
          <GradeGuide items={items} />
        </>
      );
    case "spices":
      return <SpiceStudy items={items} />;
    case "pulses":
      return <PulseSpecimens items={items} />;
    case "sugar":
      return items[0] ? <SugarFeature product={items[0]} /> : null;
  }
}

export default async function CategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = getProductsByCategory(category.slug as CategorySlug);

  return (
    <PageTransition>
      <PageHero
        eyebrow={category.name}
        lines={[category.tagline]}
        description={category.description}
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
        ]}
        aside={
          category.slug === "rice" ? (
            <GrainMark
              className="mx-auto w-full max-w-[26rem]"
              label="The 91 mark, built from rice grain"
            />
          ) : undefined
        }
      />

      <CategoryBody slug={category.slug} items={items} />

      <section className="dark-section contours section relative overflow-hidden">
        <NinetyOneMark className="-bottom-16 right-[4%]" size="lg" tone="dark" />
        <div className="shell relative grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="t-display text-ivory">Buying {category.name.toLowerCase()} for the trade?</h2>
            <p className="t-lead mt-5 max-w-[46ch] text-ivory/70">
              Tell us the volume and how often you order. We&rsquo;ll come back with availability, pack
              options and terms.
            </p>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <MagneticButton href="/contact#enquiry" variant="outline" className="text-ivory" cursorLabel="ENQUIRE">
              Start a trade enquiry
            </MagneticButton>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
