import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import { ChapterIndex } from "@/components/about/ChapterIndex";
import { ReachDiagram } from "@/components/about/ReachDiagram";
import { PageTransition } from "@/components/layout/PageTransition";
import { LazyFlagStorm } from "@/components/lazy/about";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/content/company";

export const metadata: Metadata = {
  title: "About — A Doha food trading house",
  description:
    "Suncons Trading & Contracting W.L.L. supplies Indian rice, spices, pulses and sugar from Doha's Industrial Area to Qatar's retail, industrial and food-service trade.",
  alternates: { canonical: "/about" },
};

const chapters = [
  { id: "growing-side", title: "The growing side" },
  { id: "reach-story", title: "How far it travels" },
  { id: "doha-today", title: "Doha today" },
  { id: "mission", title: "Mission & vision" },
] as const;

function Chapter({ id, index, title, children }: { id: string; index: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-32">
      <Reveal className="hairline flex items-baseline gap-4 pt-4">
        <span className="t-index t-meta text-gold">{String(index).padStart(2, "0")}</span>
        <h2 id={`${id}-heading`} className="t-meta text-muted">
          {title}
        </h2>
      </Reveal>
      <Reveal stagger className="t-lead mt-8 max-w-[58ch] space-y-6 text-charcoal/80">
        {children}
      </Reveal>
    </section>
  );
}

export default function AboutPage() {
  return (
    <PageTransition>
      <PageHero
        eyebrow="About"
        lines={["Grain is", "a promise", "kept twice."]}
        description="Once when it is bought in India, and again when it lands in Doha and has to be exactly what the buyer was told it would be."
        crumbs={[{ href: "/", label: "Home" }]}
        aside={<LazyFlagStorm />}
        isAsideWide
      />

      <div className="section bg-ivory pt-0">
        <div className="shell grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-3">
            <ChapterIndex chapters={chapters} />
          </div>

          <div className="space-y-24 md:col-span-8 md:col-start-5">
            <Chapter id="growing-side" index={1} title="The growing side">
              <p>
                TF Suncons was established to put basmati and non-basmati rice of a dependable grade in
                front of customers who cannot afford a surprise — without trading away flavour or
                nutritional value to get there.
              </p>
              <p>
                The people behind the business came to it from the growing, cultivation and production
                side of rice. That is an unglamorous advantage, and it shows up in the part customers
                actually feel: the pack opened in month six matches the sample from month one.
              </p>
            </Chapter>

            <Chapter id="reach-story" index={2} title="How far it travels">
              <p>
                Over the years the business has reached customers across several states in India, a
                handful of countries in Africa, and the Gulf — Dubai and Qatar. The processing
                techniques used control quality and hygiene, while the blend of fragrance and taste is
                what keeps the product moving across those markets.
              </p>
            </Chapter>

            <Chapter id="doha-today" index={3} title="Doha today">
              <p>
                Today the operation runs out of Doha&rsquo;s Industrial Area — {company.address.building},{" "}
                {company.address.zone}, {company.address.street} — supplying rice, spices, pulses and
                sugar to the retail, industrial and food-service trade.
              </p>
            </Chapter>

            <section id="mission" aria-labelledby="mission-heading" className="dark-section contours scroll-mt-32 p-8 md:p-12">
              <div className="flex items-baseline gap-4 border-t border-ivory/20 pt-4">
                <span className="t-index t-meta text-gold-soft">04</span>
                <h2 id="mission-heading" className="t-meta text-ivory/60">
                  Mission &amp; vision — in the company&rsquo;s own words
                </h2>
              </div>
              <div className="mt-10 grid gap-12 md:grid-cols-2 md:gap-10">
                <Reveal>
                  <figure className="m-0">
                    <figcaption className="t-meta text-gold-soft">Our mission</figcaption>
                    <blockquote className="t-title mt-5 text-ivory">
                      <p>&ldquo;{company.mission}&rdquo;</p>
                    </blockquote>
                  </figure>
                </Reveal>
                <Reveal delay={0.08}>
                  <figure className="m-0">
                    <figcaption className="t-meta text-gold-soft">Our vision</figcaption>
                    <blockquote className="t-title mt-5 text-ivory">
                      <p>&ldquo;{company.vision}&rdquo;</p>
                    </blockquote>
                  </figure>
                </Reveal>
              </div>
            </section>
          </div>
        </div>
      </div>

      <section aria-label="Harvest and distribution" className="bg-paper">
        <div className="shell py-10 md:py-14">
          <ImageReveal
            src="/brand/about-banner.jpg"
            alt="Bharat Gate basmati beside an illustrated scene of a rice harvest"
            width={1663}
            height={400}
            sizes="100vw"
            className="w-full"
            imageClassName="h-auto w-full"
          />
        </div>
      </section>

      <section aria-labelledby="reach-heading" className="section bg-ivory">
        <div className="shell">
          <SectionHeading
            index="05"
            label="Reach & markets"
            id="reach-heading"
            lines={["Where the", "product goes."]}
            description="The company's own description of its reach — no countries, ports or routes have been added to it."
            className="max-w-3xl"
          />
          <div className="mt-14">
            <ReachDiagram />
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-4">
              <Image
                src="/brand/rice-sacks.png"
                alt="Jute bags of milled rice beside paddy stalks"
                width={379}
                height={369}
                sizes="(max-width: 768px) 70vw, 28vw"
                className="h-auto w-full max-w-xs"
              />
            </Reveal>
            <Reveal delay={0.06} as="dl" stagger className="space-y-7 md:col-span-7 md:col-start-6">
              <div className="hairline pt-4">
                <dt className="t-meta text-muted">Markets served</dt>
                <dd className="mt-3">
                  <ul className="grid gap-x-8 gap-y-1.5 text-charcoal/80 sm:grid-cols-2">
                    {company.markets.map((market) => (
                      <li key={market}>{market}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="hairline pt-4">
                <dt className="t-meta text-muted">Quality assurance</dt>
                <dd className="mt-3 text-charcoal/80">{company.qualityStatement}</dd>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section bg-paper">
        <div className="shell grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="t-display text-forest">Work with us on your next order.</h2>
            <p className="t-lead mt-5 max-w-[48ch] text-charcoal/75">
              Wholesale, retail, hospitality or catering — tell us what you buy and how often.
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
