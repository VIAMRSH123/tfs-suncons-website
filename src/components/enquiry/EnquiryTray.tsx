"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { countPacks } from "@/lib/basket";
import { useBasket } from "./basketStore";

/**
 * A quiet pill that appears once something is in the basket and points to the
 * enquiry form. It steps aside while the form itself is on screen, where the
 * basket is already listed in full. The tray lives in the layout, so it looks
 * for the form again after every navigation.
 */
export function EnquiryTray() {
  const basket = useBasket();
  const pathname = usePathname();
  // The path on which the form was last seen on screen; any other path = not visible.
  const [formSeenOn, setFormSeenOn] = useState<string | null>(null);

  useEffect(() => {
    const form = document.getElementById("enquiry");
    if (!form || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormSeenOn(entry?.isIntersecting ? pathname : null),
      { rootMargin: "0px 0px -30% 0px" },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [pathname]);

  const packs = countPacks(basket);
  const isShown = basket.length > 0 && formSeenOn !== pathname;

  return (
    <div
      className="enquiry-tray pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 md:bottom-7 md:justify-end md:px-8"
      data-shown={isShown ? "true" : "false"}
    >
      <Link
        href="/contact#enquiry"
        tabIndex={isShown ? 0 : -1}
        aria-hidden={!isShown}
        data-cursor-label="REVIEW"
        className="enquiry-tray__pill pointer-events-auto inline-flex items-center gap-4 bg-forest py-3 pl-5 pr-4 text-ivory shadow-[0_18px_40px_-18px_rgb(11_31_20/0.6)]"
      >
        <span className="t-meta hidden text-gold-soft sm:inline">Your enquiry</span>
        <span className="whitespace-nowrap font-display text-[1.05rem] leading-none">
          {basket.length} {basket.length === 1 ? "product" : "products"} · {packs}{" "}
          {packs === 1 ? "pack" : "packs"}
        </span>
        <span aria-hidden="true" className="t-meta whitespace-nowrap border-l border-ivory/25 pl-4">
          Review →
        </span>
      </Link>
    </div>
  );
}
