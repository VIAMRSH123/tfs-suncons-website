"use client";

import { useEffect, useState } from "react";

type Chapter = { id: string; title: string };

/**
 * A sticky table of contents for a long read. The current chapter is tracked
 * with IntersectionObserver (the one nearest the top of the reading area wins)
 * and marked with aria-current, so it is announced as well as shown.
 */
export function ChapterIndex({ chapters }: { chapters: readonly Chapter[] }) {
  const [current, setCurrent] = useState(chapters[0]?.id ?? "");

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
        setCurrent(topmost.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav aria-label="Chapters" className="md:sticky md:top-[120px]">
      <ol className="space-y-1">
        {chapters.map((chapter, index) => {
          const isCurrent = chapter.id === current;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={isCurrent ? "true" : undefined}
                className={`group flex min-h-11 items-baseline gap-4 border-l py-2 pl-4 transition-colors duration-300 ${
                  isCurrent ? "border-forest text-forest" : "border-sand text-muted hover:text-forest"
                }`}
              >
                <span className={`t-index t-meta ${isCurrent ? "text-gold" : ""}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-[1.1rem] leading-snug">{chapter.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
