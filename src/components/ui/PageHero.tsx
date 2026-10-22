import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { TextReveal } from "@/components/motion/TextReveal";

type Crumb = { href: string; label: string };

type PageHeroProps = {
  eyebrow: string;
  lines: readonly string[];
  description?: string;
  crumbs?: readonly Crumb[];
  tone?: "light" | "dark";
  /** Optional right-hand block. Without it the masthead stays full width. */
  aside?: ReactNode;
  /** Give the aside half the masthead instead of five columns. */
  isAsideWide?: boolean;
};

/** Above the fold, so it animates from first paint rather than waiting for an observer. */
const arrive = (seconds: number) => ({ "--reveal-delay": `${seconds}s` }) as CSSProperties;

/** The shared masthead for every page below the homepage. */
export function PageHero({
  eyebrow,
  lines,
  description,
  crumbs = [],
  tone = "light",
  aside,
  isAsideWide = false,
}: PageHeroProps) {
  const isDark = tone === "dark";

  return (
    <section
      className={`grain relative overflow-hidden pt-[72px] ${
        isDark ? "dark-section" : "bg-ivory"
      }`}
    >
      <div
        className={`shell pb-16 pt-16 md:pb-24 md:pt-24 ${
          aside ? "md:grid md:grid-cols-12 md:items-end md:gap-10" : ""
        }`}
      >
        <div className={aside ? (isAsideWide ? "md:col-span-5" : "md:col-span-6") : undefined}>
        {crumbs.length > 0 ? (
          <div data-arrive style={arrive(0)}>
            <nav aria-label="Breadcrumb">
              <ol className="t-meta flex flex-wrap items-center gap-2 text-muted">
                {crumbs.map((crumb) => (
                  <li key={crumb.href} className="flex items-center gap-2">
                    <Link href={crumb.href} className="link-underline">
                      {crumb.label}
                    </Link>
                    <span aria-hidden="true" className="opacity-40">
                      /
                    </span>
                  </li>
                ))}
                <li aria-current="page" className={isDark ? "text-gold-soft" : "text-gold"}>
                  {eyebrow}
                </li>
              </ol>
            </nav>
          </div>
        ) : (
          <p data-arrive style={arrive(0)} className={`t-meta ${isDark ? "text-gold-soft" : "text-gold"}`}>
            {eyebrow}
          </p>
        )}

        <TextReveal
          as="h1"
          immediate
          delay={0.1}
          lines={lines}
          className={`t-hero mt-7 max-w-[14ch] ${isDark ? "text-ivory" : "text-forest"}`}
        />

        {description ? (
          <p
            data-arrive
            style={arrive(0.45)}
            className={`t-lead mt-8 max-w-[56ch] ${isDark ? "text-ivory/70" : "text-charcoal/75"}`}
          >
            {description}
          </p>
        ) : null}
        </div>

        {aside ? (
          <div
            data-arrive
            style={arrive(0.3)}
            className={`mt-14 md:mt-0 ${isAsideWide ? "md:col-span-7 md:col-start-6" : "md:col-span-5 md:col-start-8"}`}
          >
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}
