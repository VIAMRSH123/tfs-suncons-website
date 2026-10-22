"use client";

import { useEffect, useSyncExternalStore } from "react";

type FilterOption = { slug: string; name: string; count: number };

type ProductFilterProps = {
  options: readonly FilterOption[];
  total: number;
  /** The element whose `data-filter` the CSS reads to show one category. */
  targetId: string;
};

const PARAM = "c";
/** Fired after we rewrite the URL ourselves; replaceState does not emit popstate. */
const FILTER_EVENT = "tfs:filter";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(FILTER_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(FILTER_EVENT, onChange);
  };
}

const readFilter = () => new URLSearchParams(window.location.search).get(PARAM) ?? "all";
const serverFilter = () => "all";

/**
 * Category chips for the portfolio. The choice lives in the URL (`?c=rice`) so
 * a filtered view can be sent to a colleague, and it is applied by setting one
 * attribute — the server-rendered grid never re-renders. Without JavaScript
 * every category simply shows.
 */
export function ProductFilter({ options, total, targetId }: ProductFilterProps) {
  // The URL is the state: read through useSyncExternalStore, never copied into React state.
  const fromUrl = useSyncExternalStore(subscribe, readFilter, serverFilter);
  const active = options.some((option) => option.slug === fromUrl) ? fromUrl : "all";

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (target) target.dataset.filter = active;
  }, [active, targetId]);

  const choose = (slug: string) => {
    const url = new URL(window.location.href);
    if (slug === "all") url.searchParams.delete(PARAM);
    else url.searchParams.set(PARAM, slug);
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(FILTER_EVENT));
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chips = [{ slug: "all", name: "All", count: total }, ...options];

  return (
    <nav
      aria-label="Filter the portfolio"
      className="sticky top-[72px] z-30 border-y border-sand bg-ivory/92 backdrop-blur-sm"
    >
      <div className="shell flex gap-2 overflow-x-auto py-3 [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => {
          const isActive = chip.slug === active;
          return (
            <button
              key={chip.slug}
              type="button"
              aria-pressed={isActive}
              onClick={() => choose(chip.slug)}
              className={`t-meta inline-flex min-h-11 shrink-0 items-center gap-2.5 border px-4 transition-colors duration-200 ${
                isActive
                  ? "border-forest bg-forest text-ivory"
                  : "border-sand text-muted hover:border-forest/50 hover:text-forest"
              }`}
            >
              {chip.name}
              <span className={isActive ? "text-gold-soft" : "text-gold"}>
                {String(chip.count).padStart(2, "0")}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
