import type { CSSProperties } from "react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { TextReveal } from "@/components/motion/TextReveal";
import { company } from "@/content/company";
import { getProduct } from "@/content/products";
import { JourneyStage } from "./JourneyStage";
import { JourneyWorld } from "./JourneyWorld";

const delay = (seconds: number) => ({ "--reveal-delay": `${seconds}s` }) as CSSProperties;

/** The "Packed" chapter shows the real pack: the design direction keeps packs as photographs. */
const pack = getProduct("rice", "91-telangana-gold");
if (!pack?.image) throw new Error("Journey hero: 91 Telangana Gold has no pack image in the catalogue");
const packImage = { src: pack.image, alt: pack.imageAlt };

/**
 * "Quality that travels well", shown travelling: one isometric world from a
 * Telangana paddy field to a Doha kitchen, with the gold sack as the only
 * thing in it that is TFS's own. The visitor's scroll carries it down the
 * route: on desktop the section pins a viewport-high frame for a scroll story,
 * on phones the stage holds under the header (styles/journey.css). The copy
 * paints first and never waits for the scene; the buttons arrive within 0.35 s.
 */
export function JourneyHero() {
  return (
    <section aria-labelledby="hero-heading" className="journey-hero relative overflow-clip bg-ivory">
      <div className="journey-frame">
        <div className="journey-copy">
          <div className="shell">
            <div className="journey-copy__inner">
              <p data-arrive style={delay(0.05)} className="t-meta text-gold">
                {company.tradingName} · Doha trading house
              </p>

              <TextReveal
                as="h1"
                id="hero-heading"
                immediate
                delay={0.1}
                lines={["Quality that", "travels well."]}
                className="t-hero mt-6 text-forest"
              />

              <p data-arrive style={delay(0.25)} className="t-lead mt-7 max-w-[40ch] text-charcoal/75">
                Basmati, sona masoori, ground spices and pulses — sourced in India, packed for the
                trade in 18, 20 and 35&nbsp;kg, and supplied to Qatar&rsquo;s wholesalers,
                supermarkets, hotels and caterers.
              </p>

              <div data-arrive style={delay(0.35)} className="mt-9 flex flex-wrap items-center gap-4">
                <MagneticButton href="/products" cursorLabel="VIEW">
                  View the portfolio
                </MagneticButton>
                <MagneticButton href="/contact#enquiry" variant="outline" cursorLabel="ENQUIRE" className="text-forest">
                  Start a trade enquiry
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        <div data-arrive style={delay(0.2)} className="journey-arrive">
          <JourneyStage pack={packImage}>
            <JourneyWorld />
          </JourneyStage>
        </div>
      </div>
    </section>
  );
}
