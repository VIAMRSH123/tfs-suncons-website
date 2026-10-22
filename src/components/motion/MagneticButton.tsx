"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { createFollower } from "@/lib/follow";
import { isTouchDevice, reducedMotionNow } from "@/lib/motion";

type MagneticButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "solid" | "outline" | "ghost" | "gold";
  className?: string;
  /** Pull radius in px; the hit area itself never moves. */
  strength?: number;
  disabled?: boolean;
  cursorLabel?: string;
  ariaLabel?: string;
};

const base =
  "relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap px-7 py-3.5 text-[0.8125rem] font-medium tracking-[0.04em] uppercase transition-colors duration-200";

const variants = {
  solid:
    "bg-forest text-ivory hover:bg-forest-soft disabled:opacity-50 disabled:pointer-events-none",
  outline:
    "border border-current text-current hover:bg-current/5 disabled:opacity-50",
  ghost: "text-current hover:text-leaf",
  gold: "bg-gold-soft text-forest-deep hover:bg-ivory disabled:opacity-50 disabled:pointer-events-none",
} as const;

/** Per-frame smoothing for the pull — about half a second to settle. */
const PULL_SMOOTHING = 0.16;

/**
 * Magnetic pull on the *content*, never on the hit area — the clickable
 * rectangle stays exactly where the browser (and a keyboard user) expects it.
 * Pointer movement writes `translate` on a ref, so React never re-renders.
 */
export function MagneticButton({
  children,
  href,
  onClick,
  type = "button",
  variant = "solid",
  className = "",
  strength = 14,
  disabled = false,
  cursorLabel,
  ariaLabel,
}: MagneticButtonProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
    if (isTouchDevice() || reducedMotionNow()) return;

    const pull = createFollower((x, y) => {
      content.style.translate = `${x}px ${y}px`;
    }, PULL_SMOOTHING);

    const handleMove = (event: PointerEvent) => {
      const bounds = wrapper.getBoundingClientRect();
      const relX = event.clientX - (bounds.left + bounds.width / 2);
      const relY = event.clientY - (bounds.top + bounds.height / 2);
      pull.to((relX / bounds.width) * strength * 2, (relY / bounds.height) * strength * 2);
    };
    const handleLeave = () => pull.to(0, 0);

    wrapper.addEventListener("pointermove", handleMove);
    wrapper.addEventListener("pointerleave", handleLeave);
    return () => {
      wrapper.removeEventListener("pointermove", handleMove);
      wrapper.removeEventListener("pointerleave", handleLeave);
      pull.stop();
      content.style.translate = "";
    };
  }, [strength]);

  const classes = `${base} ${variants[variant]} ${className}`;
  const inner = (
    <span ref={contentRef} className="pointer-events-none inline-flex items-center gap-2.5">
      {children}
    </span>
  );

  return (
    <span ref={wrapperRef} className="inline-flex">
      {href ? (
        <Link href={href} className={classes} data-cursor-label={cursorLabel} aria-label={ariaLabel}>
          {inner}
        </Link>
      ) : (
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          className={classes}
          data-cursor-label={cursorLabel}
          aria-label={ariaLabel}
        >
          {inner}
        </button>
      )}
    </span>
  );
}
