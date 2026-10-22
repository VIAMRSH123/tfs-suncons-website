"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { revealOnEnter } from "@/lib/motion";

type TextRevealProps = {
  /** Each entry is one masked line. Copy is authored as lines deliberately. */
  lines: readonly string[];
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Play from first paint rather than on scroll — above-the-fold headings. */
  immediate?: boolean;
  id?: string;
};

/**
 * The "unmask" verb: each line slides up from behind its own mask.
 * The lines are real text in the DOM at all times, so the heading stays
 * selectable, searchable and readable to assistive technology. `immediate`
 * headings are a plain CSS animation — they never wait for hydration, which
 * keeps them out of the way of the largest contentful paint.
 */
export function TextReveal({
  lines,
  as: Tag = "h2",
  className,
  delay = 0,
  immediate = false,
  id,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || immediate) return;
    return revealOnEnter(element);
  }, [immediate]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      data-reveal-line
      data-immediate={immediate ? "" : undefined}
      style={{ "--reveal-delay": `${delay}s` } as CSSProperties}
    >
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <span data-line-inner className="block" style={{ "--line": index } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
