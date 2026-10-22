import { numberWord } from "@/lib/format";

type CatalogueCardProps = {
  productCount: number;
  tone?: "light" | "dark";
};

/**
 * The thing a purchasing manager forwards: the whole range as one PDF,
 * generated at build time from the same catalogue as the site.
 */
export function CatalogueCard({ productCount, tone = "light" }: CatalogueCardProps) {
  const isDark = tone === "dark";
  return (
    <a
      href="/catalogue.pdf"
      download="tf-suncons-trade-catalogue.pdf"
      data-cursor-label="PDF"
      className={`group relative flex items-stretch gap-5 border p-5 transition-colors duration-200 ${
        isDark ? "border-ivory/25 hover:border-ivory/60" : "border-sand bg-paper hover:border-forest/50"
      }`}
    >
      {/* A small drawn document: hairlines for the rows, the 91 as the mark. */}
      <span
        aria-hidden="true"
        className={`relative flex w-16 shrink-0 flex-col gap-1.5 border p-2 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:rotate-[-2deg] ${
          isDark ? "border-ivory/30 bg-forest-deep" : "border-sand bg-ivory"
        }`}
      >
        <span className={`t-index text-[0.95rem] leading-none ${isDark ? "text-gold-soft" : "text-gold"}`}>91</span>
        {[0, 1, 2, 3].map((row) => (
          <span key={row} className={`h-px w-full ${isDark ? "bg-ivory/25" : "bg-sand"}`} />
        ))}
      </span>
      <span className="flex flex-col justify-center">
        <span className={`t-meta ${isDark ? "text-gold-soft" : "text-gold"}`}>Trade catalogue · PDF</span>
        <span className={`mt-1.5 font-display text-[1.2rem] leading-snug ${isDark ? "text-ivory" : "text-forest"}`}>
          All {numberWord(productCount)} lines, with pack sizes
        </span>
        <span className={`t-meta mt-2 link-underline self-start ${isDark ? "text-ivory/70" : "text-muted"}`}>
          Download →
        </span>
      </span>
    </a>
  );
}
