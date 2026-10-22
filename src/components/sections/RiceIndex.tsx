"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { AddToEnquiry } from "@/components/enquiry/AddToEnquiry";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { trackScrollProgress } from "@/lib/scroll";
import { getFeaturedRice } from "@/content/products";

const rice = getFeaturedRice();

/**
 * The rice range as a pinned horizontal run on desktop: the heading holds
 * still on the left with a live count while the seven packs pass on the right,
 * the way they would line up on a pallet. Native `position: sticky` does the
 * pinning and the section's height is set in CSS from the card count, so
 * nothing shifts when scripts load. Phones, reduced motion and no-JS get a
 * plain swipeable row.
 *
 * Keyboard: the cards are ordinary links and buttons; focusing one that is
 * off to the side scrolls the page to the point where it is in view.
 */
export function RiceIndex() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    const pinned = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let stopTracking = () => {};
    let shown = -1;

    const attach = () => {
      stopTracking();
      track.style.translate = "";
      if (!pinned.matches) return;
      stopTracking = trackScrollProgress(
        section,
        (progress) => {
          const distance = Math.max(0, track.scrollWidth - viewport.clientWidth);
          track.style.translate = `${-progress * distance}px 0`;
          const current = Math.min(rice.length - 1, Math.round(progress * (rice.length - 1)));
          if (current !== shown && countRef.current) {
            shown = current;
            countRef.current.textContent = String(current + 1).padStart(2, "0");
          }
        },
        { start: 0, end: 1, smoothing: 0.16 },
      );
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!pinned.matches) return;
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-rice-card]");
      if (!card) return;
      const index = Number(card.dataset.index ?? 0);
      const progress = rice.length > 1 ? index / (rice.length - 1) : 0;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const range = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + range * progress, behavior: "instant" });
    };

    attach();
    pinned.addEventListener("change", attach);
    track.addEventListener("focusin", handleFocusIn);
    return () => {
      stopTracking();
      pinned.removeEventListener("change", attach);
      track.removeEventListener("focusin", handleFocusIn);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="rice-heading"
      id="rice"
      className="rice-index story-pin dark-section contours relative"
      style={{ "--cards": rice.length } as CSSProperties}
    >
      <div className="story-pin__sticky rice-index__panel">
        <div className="rice-index__head shell md:max-w-none md:px-0">
          <SectionHeading
            index="04"
            label="Rice portfolio"
            id="rice-heading"
            lines={["Seven packs,", "seven jobs."]}
            description="Each variety exists for a different kitchen — a 1121 basmati for the banquet, a sona masoori for the staff canteen, a sortex-cleaned long grain for everyday service."
          />
          <p aria-hidden="true" className="t-meta mt-10 hidden items-baseline gap-2 text-gold-soft md:flex">
            <span ref={countRef} className="t-index text-[2.6rem] leading-none text-ivory">
              01
            </span>
            <span>/ {String(rice.length).padStart(2, "0")}</span>
          </p>
        </div>

        <div ref={viewportRef} className="rice-index__viewport">
          <div ref={trackRef} className="rice-index__track">
            {rice.map((product, index) => (
              <article
                key={product.slug}
                data-rice-card
                data-index={index}
                className="rice-index__card group flex flex-col"
              >
                <Link
                  href={`/products/rice/${product.slug}`}
                  data-cursor-label="VIEW PRODUCT"
                  className="flex flex-col"
                >
                  <div className="pack-stage window-light rice-index__stage relative p-[9%]">
                    <span className="t-index t-meta absolute left-5 top-5 z-10 text-gold-soft">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.imageAlt}
                        width={1000}
                        height={1000}
                        sizes="(max-width: 768px) 78vw, 24rem"
                        className="pack h-full w-auto object-contain transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                      />
                    ) : null}
                  </div>
                  <div className="hairline mt-5 flex items-baseline justify-between gap-4 pt-4">
                    <h3 className="t-title text-[clamp(1.35rem,1.1rem+0.6vw,1.7rem)] text-ivory">
                      {product.name}
                    </h3>
                    {product.packSizes.length > 0 ? (
                      <span className="t-meta shrink-0 text-gold-soft">{product.packSizes.join(" · ")}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-ivory/60">{product.summary}</p>
                </Link>
                <div className="mt-4">
                  <AddToEnquiry slug={product.slug} name={product.name} packSizes={product.packSizes} tone="dark" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
