"use client";

import { useEffect, useRef } from "react";
import { observeVisibility, reducedMotionNow } from "@/lib/motion";
import { company } from "@/content/company";

/** Resting drift, px/s, and the most a fast scroll can add on top of it. */
const BASE_SPEED = 38;
const MAX_BOOST = 520;
/** Per-frame decay of the scroll boost back to the resting drift. */
const BOOST_DECAY = 0.93;

/**
 * The four proof points as a moving manifest. It answers the scroll: scrolling
 * down drives it left, scrolling up reverses it, and speed follows how fast you
 * scroll before easing back to a slow drift. The facts are the same four as
 * before — each readable on a pack or published — and are listed once, plainly,
 * for assistive technology; the moving copies are decoration.
 */
export function ManifestBand() {
  const bandRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    const track = trackRef.current;
    if (!band || !track || reducedMotionNow()) return;

    let offset = 0;
    let direction = 1;
    let boost = 0;
    let lastScroll = window.scrollY;
    let lastTime = 0;
    let frame = 0;

    const handleScroll = () => {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (delta === 0) return;
      direction = delta > 0 ? 1 : -1;
      boost = Math.min(MAX_BOOST, boost + Math.abs(delta) * 6);
    };

    const tick = (now: number) => {
      const seconds = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 0;
      lastTime = now;
      const half = track.scrollWidth / 2;
      offset += direction * (BASE_SPEED + boost) * seconds;
      // Two identical copies: wrapping by one copy's width is seamless.
      if (half > 0) offset = ((offset % half) + half) % half;
      track.style.translate = `${-offset}px 0`;
      boost *= BOOST_DECAY;
      frame = requestAnimationFrame(tick);
    };

    const stopWatching = observeVisibility(band, (isVisible) => {
      if (isVisible && !frame) {
        lastTime = 0;
        lastScroll = window.scrollY;
        window.addEventListener("scroll", handleScroll, { passive: true });
        frame = requestAnimationFrame(tick);
      } else if (!isVisible && frame) {
        window.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });

    return () => {
      stopWatching();
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const items = company.proof.map((item) => (
    <div key={item.label} className="flex shrink-0 items-baseline gap-5 pr-14 md:pr-20">
      <span className="t-meta text-gold-soft">{item.label}</span>
      <span className="font-display text-[clamp(1.6rem,1.1rem+1.6vw,2.6rem)] leading-none tracking-[-0.02em] text-ivory">
        {item.value}
      </span>
      <span className="hidden max-w-[22ch] text-[0.8rem] leading-snug text-ivory/50 lg:inline">
        {item.note}
      </span>
      <span aria-hidden="true" className="t-index ml-6 text-[1.1rem] text-gold-soft/60 md:ml-10">
        91
      </span>
    </div>
  ));

  return (
    <section
      ref={bandRef}
      aria-labelledby="manifest-heading"
      className="manifest-band dark-section contours relative overflow-hidden border-y border-ivory/10"
    >
      <h2 id="manifest-heading" className="sr-only">
        What we can show you
      </h2>
      <dl className="sr-only">
        {company.proof.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              {item.value} — {item.note}
            </dd>
          </div>
        ))}
      </dl>

      <div aria-hidden="true" className="py-9 md:py-12">
        <div ref={trackRef} className="manifest-band__track flex w-max">
          <div className="manifest-band__copy flex shrink-0 pl-[var(--space-gutter)]">{items}</div>
          <div data-copy="1" className="manifest-band__copy flex shrink-0 pl-[var(--space-gutter)]">
            {items}
          </div>
        </div>
      </div>
    </section>
  );
}
