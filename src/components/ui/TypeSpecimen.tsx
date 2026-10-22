type TypeSpecimenProps = {
  name: string;
  tone?: "light" | "dark";
  size?: "card" | "hero";
};

/**
 * The stand-in for a product with no photograph of its own: the name set as a
 * type specimen. It is designed to look intentional — and the note says
 * plainly why there is no picture, rather than borrowing someone else's.
 */
export function TypeSpecimen({ name, tone = "light", size = "card" }: TypeSpecimenProps) {
  const isDark = tone === "dark";
  const isHero = size === "hero";

  return (
    <div
      className={`contours flex h-full w-full flex-col justify-between text-left ${
        isHero ? "p-8 md:p-12" : "p-6"
      } ${isDark ? "" : "contours-light"}`}
    >
      <span className={`t-meta ${isDark ? "text-gold-soft" : "text-gold"}`}>Specimen</span>
      <span
        className={`font-display italic leading-[0.92] tracking-[-0.03em] [text-wrap:balance] ${
          isHero ? "text-[clamp(3.5rem,2rem+6vw,7.5rem)]" : "text-[clamp(2.6rem,1.6rem+3vw,3.6rem)]"
        } ${isDark ? "text-ivory" : "text-forest"}`}
      >
        {name}
      </span>
      <span className={`t-meta ${isDark ? "text-ivory/50" : "text-muted"}`}>
        Named, not yet pictured
      </span>
    </div>
  );
}
