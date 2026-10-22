"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { revealOnEnter } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  /** Wrapper element — keep the page's heading/semantic structure intact. */
  as?: ElementType;
  className?: string;
  /** Stagger direct children instead of revealing the wrapper as one block. */
  stagger?: boolean;
  delay?: number;
  /** Distance in px the element rises from. */
  distance?: number;
}

/**
 * The "rise" verb: 24px up and a fade, when the element scrolls into view.
 * The transition is CSS (styles/motion.css); this only flags the arrival.
 * Hidden states apply under `.js-motion` alone, so content is never invisible
 * without JavaScript or under reduced motion.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className,
  stagger = false,
  delay = 0,
  distance = 24,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (stagger) {
      Array.from(element.children).forEach((child, index) => {
        (child as HTMLElement).style.setProperty("--i", String(index));
      });
    }
    return revealOnEnter(element);
  }, [stagger]);

  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-distance": `${distance}px`,
  } as CSSProperties;

  return (
    <Tag ref={ref} data-reveal={stagger ? "stagger" : ""} style={style} className={className}>
      {children}
    </Tag>
  );
}
