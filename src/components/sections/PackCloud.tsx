"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createFollower } from "@/lib/follow";
import { reducedMotionNow } from "@/lib/motion";
import { clamp01, trackScrollProgress } from "@/lib/scroll";
import { categories, getProductsByCategory } from "@/content/products";

const columns = categories.map((category) => ({
  category,
  items: getProductsByCategory(category.slug),
}));

/** Deterministic scatter, so every visitor sees the same cloud. */
function seeded(seed: number) {
  let state = seed;
  return () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Flight = {
  element: HTMLElement;
  /** Displacement from the pack's home (its place in the sorted layout), px. */
  dx: number;
  dy: number;
  scale: number;
  rotate: number;
  depth: number;
  delay: number;
};

/**
 * "Four categories, one standard." Every photographed pack starts as a cloud at
 * different depths — drifting with the pointer — and the scroll sorts it into
 * its category. The markup *is* the sorted layout (FLIP): JavaScript only
 * measures each pack's home and displaces it, so phones, reduced motion and
 * no-JS all get the tidy columns directly.
 */
export function PackCloud() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    if (reducedMotionNow()) return;

    const packs = Array.from(stage.querySelectorAll<HTMLElement>("[data-cloud-pack]"));
    let flights: Flight[] = [];
    let progress = 0;
    let pointerX = 0;
    let pointerY = 0;
    let stopTracking = () => {};

    const render = () => {
      // Nothing in flight (phones, tablets): the sorted layout stands as it is.
      if (flights.length === 0) return;
      const q = clamp01((progress - 0.1) / 0.72);
      for (const flight of flights) {
        const t = easeInOut(clamp01((q - flight.delay) / (1 - flight.delay)));
        const away = 1 - t;
        const drift = away * flight.depth * 16;
        flight.element.style.translate = `${flight.dx * away + pointerX * drift}px ${flight.dy * away + pointerY * drift}px`;
        flight.element.style.scale = String(1 + (flight.scale - 1) * away);
        flight.element.style.rotate = `${flight.rotate * away}deg`;
      }
      section.dataset.settled = q > 0.96 ? "true" : "false";
    };

    const measure = () => {
      const rng = seeded(91);
      const box = stage.getBoundingClientRect();
      flights = packs.map((element) => {
        element.style.translate = "";
        element.style.scale = "";
        element.style.rotate = "";
        const home = element.getBoundingClientRect();
        const depth = 0.4 + rng() * 0.6;
        // Keep the cloud in the stage, clear of the heading above it — a pack
        // scaled up for depth grows outward, so the top band stays empty.
        const targetX = box.left + box.width * (0.06 + rng() * 0.88);
        const targetY = box.top + box.height * (0.26 + rng() * 0.62);
        return {
          element,
          dx: targetX - (home.left + home.width / 2),
          dy: targetY - (home.top + home.height / 2),
          scale: 0.72 + depth * 0.5,
          rotate: (rng() - 0.5) * 30,
          depth,
          delay: rng() * 0.32,
        };
      });
      render();
    };

    const pointer = createFollower((x, y) => {
      pointerX = x;
      pointerY = y;
      render();
    }, 0.08);
    const handleMove = (event: PointerEvent) => {
      pointer.to(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5);
    };

    const attach = () => {
      stopTracking();
      packs.forEach((element) => {
        element.style.translate = "";
        element.style.scale = "";
        element.style.rotate = "";
      });
      flights = [];
      section.dataset.settled = "true";
      if (!desktop.matches) return;
      measure();
      stopTracking = trackScrollProgress(
        section,
        (next) => {
          progress = next;
          render();
        },
        { start: 0, end: 1, smoothing: 0.14 },
      );
    };

    attach();
    desktop.addEventListener("change", attach);
    window.addEventListener("resize", attach);
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => {
      stopTracking();
      pointer.stop();
      desktop.removeEventListener("change", attach);
      window.removeEventListener("resize", attach);
      window.removeEventListener("pointermove", handleMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="portfolio-heading"
      data-settled="true"
      className="pack-cloud story-pin story-pin--cloud grain relative bg-ivory"
    >
      <div className="story-pin__sticky">
        <div className="shell flex h-full flex-col pt-[var(--space-section)] lg:pt-[calc(72px+3.5rem)]">
          <SectionHeading
            index="03"
            label="Portfolio"
            id="portfolio-heading"
            lines={["Four categories,", "one standard."]}
            description="Rice is the core. Spices, pulses and sugar travel the same route and are held to the same handling."
            className="max-w-3xl"
          />

          <div
            ref={stageRef}
            className="pack-cloud__stage mt-14 grid flex-1 grid-cols-2 gap-x-6 gap-y-14 pb-[var(--space-section)] lg:mt-10 lg:grid-cols-4 lg:gap-8 lg:pb-14"
          >
            {columns.map(({ category, items }) => {
              const photographed = items.filter((item) => item.image);
              return (
                <Link
                  key={category.slug}
                  href={`/products/${category.slug}`}
                  data-cursor-label="VIEW"
                  className="pack-cloud__column group flex flex-col justify-end"
                >
                  <div className="pack-cloud__fan relative flex h-[clamp(9rem,22vh,15rem)] items-end justify-center">
                    {photographed.length > 0 ? (
                      photographed.map((item, i) => {
                        const middle = (photographed.length - 1) / 2;
                        return (
                          <div
                            key={item.slug}
                            className="pack-cloud__slot absolute bottom-0 w-[42%] max-w-[9.5rem]"
                            style={{
                              left: `calc(50% + ${(i - middle) * 11}% - 21%)`,
                              rotate: `${(i - middle) * 4}deg`,
                              zIndex: i,
                            }}
                          >
                            <div data-cloud-pack>
                              <Image
                                src={item.image ?? ""}
                                alt={item.imageAlt}
                                width={1000}
                                height={1000}
                                sizes="(max-width: 1024px) 20vw, 10vw"
                                className="pack h-auto w-full"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <ul className="pack-cloud__specimen flex flex-col items-center text-center">
                        {items.map((item) => (
                          <li
                            key={item.slug}
                            className="font-display text-[clamp(1.35rem,1rem+1vw,2rem)] italic leading-[1.05] text-forest/80"
                          >
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="pack-cloud__label hairline mt-7 flex items-baseline justify-between gap-3 pt-4">
                    <h3 className="t-title text-[clamp(1.5rem,1.1rem+1vw,2.1rem)] text-forest">
                      {category.name}
                    </h3>
                    <span className="t-meta text-gold">
                      {String(items.length).padStart(2, "0")} {items.length === 1 ? "line" : "lines"}
                    </span>
                  </div>
                  <p className="pack-cloud__label mt-2 text-sm text-muted">
                    {photographed.length === 0 ? "Named, not yet pictured · " : ""}
                    <span className="link-underline text-forest">Explore {category.name.toLowerCase()} →</span>
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
