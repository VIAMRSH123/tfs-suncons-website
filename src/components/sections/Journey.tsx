import Image from "next/image";
import { LazyGrainMorph } from "@/components/lazy/home";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * One chapter per state of the grain morph. Every line is something a pack or
 * the company states: the printed Telangana origin and sortex marks, the trade
 * weights, the published address, the three-script labels. No port, vessel or
 * route is named, because none is published.
 */
const chapters = [
  {
    title: "In the field",
    body: "Bought where it is grown. The 91 Telangana Gold pack names its origin outright — Korutla, Telangana — and the Satake sortex marks record the grading.",
  },
  {
    title: "The crossing",
    body: "From India to the Gulf: the one route the whole range travels, packed into 18, 20 and 35 kg trade bags.",
  },
  {
    title: "Landfall",
    body: "Into Doha's Industrial Area — Building 493, Zone 57, Street 43 — and out to wholesalers, supermarkets, hotels and caterers.",
  },
  {
    title: "The mark",
    body: "Under the 91 every pack carries, labelled in English, Arabic and Telugu for Gulf shelves.",
  },
] as const;

/** Where the story is pinned; elsewhere the figure drives itself. */
const PINNED_MEDIA = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/**
 * "From the rice belt to the Gulf." The grain morph — 1,500 grains forming
 * paddy rows, an ocean swell, the Doha skyline and the 91 mark — moves here
 * from the About page and becomes the homepage's story: the section pins, the
 * scroll drives the grain, and the chapter beside it follows the grain's
 * `data-morph-state` in CSS, with no re-renders.
 */
export function Journey() {
  return (
    <>
      <section
        aria-labelledby="journey-heading"
        data-morph-driver
        data-morph-state="0"
        className="journey story-pin story-pin--journey grain relative bg-ivory"
      >
        <div className="story-pin__sticky">
          <div className="shell grid h-full items-center gap-12 py-[var(--space-section)] md:grid-cols-12 md:gap-8 md:py-0 md:pt-[72px]">
            <div className="md:col-span-5">
              <SectionHeading
                index="06"
                label="Sourcing & distribution"
                id="journey-heading"
                lines={["From the rice belt", "to the Gulf."]}
              />
              <ol className="journey__chapters mt-10 space-y-5">
                {chapters.map((chapter, index) => (
                  <li key={chapter.title} data-chapter={index} className="journey__chapter hairline pt-4">
                    <p className="t-meta text-gold">
                      {String(index + 1).padStart(2, "0")} · {chapter.title}
                    </p>
                    <p className="mt-2 max-w-[46ch] leading-relaxed text-charcoal/75">{chapter.body}</p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex justify-center md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
              <LazyGrainMorph
                driverSelector="[data-morph-driver]"
                range={{ start: 0, end: 1 }}
                pinnedMedia={PINNED_MEDIA}
                showCaption={false}
                className="max-w-[min(40rem,74svh)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="The crop, as the brand draws it" className="bg-paper">
        <div className="shell py-12 md:py-16">
          <Reveal>
            <figure className="m-0">
              <Image
                src="/journey/farm-vignettes.jpg"
                alt="The brand's own watercolour sequence: ploughing, harvesting, carting and delivering the crop"
                width={1663}
                height={417}
                sizes="(max-width: 1440px) 100vw, 1440px"
                className="h-auto w-full"
              />
              <figcaption className="hairline mt-4 flex flex-wrap items-baseline justify-between gap-3 pt-3">
                <span className="t-meta text-gold">Plough · harvest · cart · deliver</span>
                <span className="t-meta text-muted">The brand&rsquo;s own watercolours</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </>
  );
}
