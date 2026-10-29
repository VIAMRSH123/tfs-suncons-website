"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  INTRO_EASE,
  INTRO_ENTRY_ATTRIBUTE,
  INTRO_SEEN_KEY,
  INTRO_TIMING,
  flightBetween,
  flightTransform,
  onIntroRequest,
  type IntroPhase,
} from "@/lib/intro";
import { reducedMotionNow } from "@/lib/motion";

const HOME = "/";
/** Any of these while the intro waits says the visitor wants the site now. */
const SKIP_EVENTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_SOFT = "cubic-bezier(0.65, 0, 0.35, 1)";

type Parts = {
  top: HTMLElement;
  bottom: HTMLElement;
  logo: HTMLElement;
  rule: HTMLElement;
  tagline: HTMLElement;
  shine: HTMLElement;
};

const html = () => document.documentElement;
const phaseNow = () => html().getAttribute("data-intro") as IntroPhase | null;

function setPhase(phase: IntroPhase | null) {
  if (phase) {
    html().setAttribute("data-intro", phase);
    return;
  }
  html().removeAttribute("data-intro");
  html().removeAttribute(INTRO_ENTRY_ATTRIBUTE);
}

function rememberPlayed() {
  try {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Storage blocked (some private windows): the intro may simply play again next load.
  }
}

/** The header's logo: where the intro's logo lands, and where it takes off from after a click. */
function headerLogoBox(): DOMRect | null {
  const box = document.querySelector<HTMLElement>("[data-site-logo]")?.getBoundingClientRect();
  return box && box.width > 0 ? box : null;
}

/** Straight to the top, even though the site scrolls smoothly: this happens under the curtain. */
function jumpToTop() {
  const root = html();
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = "";
}

function findParts(root: HTMLElement | null): Parts | null {
  const part = (name: string) => root?.querySelector<HTMLElement>(`[data-intro-part="${name}"]`) ?? null;
  const parts = {
    top: part("top"),
    bottom: part("bottom"),
    logo: part("logo"),
    rule: part("rule"),
    tagline: part("tagline"),
    shine: part("shine"),
  };
  return Object.values(parts).every(Boolean) ? (parts as Parts) : null;
}

function cancelAll(parts: Parts) {
  Object.values(parts).forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
}

/** Waits `ms`, or less if the visitor scrolls, taps or presses a key; resolves true if they did. */
function waitOrSkip(ms: number): Promise<boolean> {
  return new Promise((resolve) => {
    const finish = (skipped: boolean) => {
      window.clearTimeout(timer);
      SKIP_EVENTS.forEach((type) => window.removeEventListener(type, handleSkip));
      resolve(skipped);
    };
    const handleSkip = () => finish(true);
    const timer = window.setTimeout(() => finish(false), ms);
    SKIP_EVENTS.forEach((type) => window.addEventListener(type, handleSkip, { passive: true }));
  });
}

/**
 * After a logo click: the curtain closes over the page as the logo flies out
 * of the header to the centre, then the rule draws and the glint crosses.
 */
async function closeOver(parts: Parts): Promise<void> {
  cancelAll(parts);
  setPhase("cover");
  const { top, bottom, logo, rule, tagline, shine } = parts;
  const from = headerLogoBox();
  const start = from ? flightTransform(flightBetween(logo.getBoundingClientRect(), from)) : "scale(0.92)";
  const closing = { duration: INTRO_TIMING.cover, easing: INTRO_EASE, fill: "both" } as const;
  top.animate([{ transform: "translateY(-100%)" }, { transform: "none" }], closing);
  bottom.animate([{ transform: "translateY(100%)" }, { transform: "none" }], closing);
  rule.animate([{ transform: "scaleX(0)" }, { transform: "none" }], {
    duration: 520,
    delay: INTRO_TIMING.cover * 0.5,
    easing: INTRO_EASE,
    fill: "both",
  });
  tagline.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], {
    duration: 450,
    delay: INTRO_TIMING.cover * 0.7,
    easing: EASE_OUT,
    fill: "both",
  });
  shine.animate([{ transform: "translateX(-130%)" }, { transform: "translateX(260%)" }], {
    duration: 800,
    delay: INTRO_TIMING.cover,
    easing: EASE_SOFT,
    fill: "both",
  });
  const landing = logo.animate([{ transform: start, opacity: from ? 1 : 0 }, { transform: "none", opacity: 1 }], closing);
  await landing.finished;
}

/**
 * The curtain parts along the rule and the logo flies into the header's logo,
 * which takes over the moment it lands — so the intro hands the visitor the
 * site rather than cutting to it. The page's own entrance plays meanwhile.
 */
async function openOnto(parts: Parts, duration: number): Promise<void> {
  setPhase("exit");
  const { top, bottom, logo, rule, tagline } = parts;
  const target = headerLogoBox();
  const end = target ? flightTransform(flightBetween(logo.getBoundingClientRect(), target)) : "translateY(-40vh) scale(0.3)";
  const fade = { duration: duration * 0.3, easing: "ease-out", fill: "forwards" } as const;
  rule.animate([{ opacity: 1 }, { opacity: 0 }], fade);
  tagline.animate([{ opacity: 1 }, { opacity: 0 }], fade);
  const parting = { duration: duration * 0.92, delay: duration * 0.08, easing: INTRO_EASE, fill: "both" } as const;
  top.animate([{ transform: "none" }, { transform: "translateY(-100%)" }], parting);
  bottom.animate([{ transform: "none" }, { transform: "translateY(100%)" }], parting);
  const flight = logo.animate([{ transform: "none", opacity: 1 }, { transform: end, opacity: target ? 1 : 0 }], {
    duration,
    easing: INTRO_EASE,
    fill: "forwards",
  });
  await flight.finished;
  // One frame: the curtain goes, and the header's own logo shows exactly where this one landed.
  setPhase(null);
  rememberPlayed();
  cancelAll(parts);
}

/**
 * The logo intro (styles/intro.css). On a visit's first paint the mark draws
 * itself in — CSS, before any script — and this opens onto the site once it
 * has; the header's logo plays it again on the way home. A scroll, tap or key
 * press cuts the wait short. Nothing here runs with reduced motion: the boot
 * script never starts it, and the header doesn't ask.
 */
export function LogoIntro() {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  const arrivedHome = useRef<(() => void) | null>(null);

  useEffect(() => {
    pathnameRef.current = pathname;
    if (pathname !== HOME || !arrivedHome.current) return;
    const resolve = arrivedHome.current;
    arrivedHome.current = null;
    resolve();
  }, [pathname]);

  // First load: open onto the site once the entrance has drawn, counted from navigation start.
  useEffect(() => {
    const parts = findParts(rootRef.current);
    if (phaseNow() !== "load" || !parts) return;
    let isCurrent = true;
    waitOrSkip(Math.max(0, INTRO_TIMING.entrance - performance.now())).then((skipped) => {
      if (isCurrent && phaseNow() === "load") void openOnto(parts, skipped ? INTRO_TIMING.skip : INTRO_TIMING.exit);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const playHome = useCallback(async () => {
    const parts = findParts(rootRef.current);
    if (!parts) return;
    await closeOver(parts);
    const coveredAt = performance.now();
    setPhase("hold");
    await new Promise<void>((resolve) => {
      if (pathnameRef.current === HOME) {
        resolve();
        return;
      }
      arrivedHome.current = resolve;
      router.push(HOME, { scroll: false });
    });
    jumpToTop();
    const skipped = await waitOrSkip(Math.max(0, INTRO_TIMING.hold - (performance.now() - coveredAt)));
    await openOnto(parts, skipped ? INTRO_TIMING.skip : INTRO_TIMING.exit);
  }, [router]);

  useEffect(
    () =>
      onIntroRequest(() => {
        if (phaseNow() || reducedMotionNow()) return false;
        void playHome();
        return true;
      }),
    [playHome],
  );

  return (
    <div ref={rootRef} className="intro" aria-hidden="true">
      <div className="intro__veil intro__veil--top" data-intro-part="top" />
      <div className="intro__veil intro__veil--bottom" data-intro-part="bottom" />
      <div className="intro__stage">
        <div className="intro__logo" data-intro-part="logo">
          <div className="intro__rise">
            {/* The logo is a CSS background, as is the glint's mask: one file, preloaded by the boot script only when the intro plays. */}
            <span className="intro__image" />
            <span className="intro__glint">
              <span className="intro__shine" data-intro-part="shine" />
            </span>
          </div>
        </div>
        <span className="intro__rule" data-intro-part="rule" />
        <p className="intro__tagline t-meta" data-intro-part="tagline">
          Rice · Spices · Pulses — Doha, Qatar
        </p>
      </div>
    </div>
  );
}
