"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { revealOnEnter } from "@/lib/motion";

type ImageRevealProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * The "settle" verb: a clip-path wipe with the image scaling 1.06 → 1 behind
 * it, so the picture arrives rather than pops. Pure CSS once flagged.
 */
export function ImageReveal({
  src,
  alt,
  width,
  height,
  className,
  imageClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    return revealOnEnter(element);
  }, []);

  return (
    <div ref={ref} data-reveal-mask className={className}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        className={imageClassName}
      />
    </div>
  );
}
