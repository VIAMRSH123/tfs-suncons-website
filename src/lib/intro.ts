/**
 * The logo intro's pure parts: when it plays, how long each phase lasts, the
 * logo's flight between two boxes, and the hook the header uses to ask for it.
 * components/intro/LogoIntro.tsx does the animating.
 *
 * The phase lives on <html data-intro>:
 * - `load`  — first paint of a visit; the mark draws itself in (pure CSS).
 * - `cover` — after a logo click; the curtain closes over the page.
 * - `hold`  — covered; the home page arrives underneath.
 * - `exit`  — the curtain opens and the logo flies into the header.
 * The page underneath loads and animates as it would without the intro, so the
 * largest contentful paint is never held back (styles/intro.css).
 */

export type IntroPhase = "load" | "cover" | "hold" | "exit";

/** sessionStorage key: set once the intro has played in this tab, so reloads skip it. */
export const INTRO_SEEN_KEY = "tfs-intro-seen";

/** <html data-intro-entry>: the first-load entrance is running, so its CSS keyframes apply. */
export const INTRO_ENTRY_ATTRIBUTE = "data-intro-entry";

/** The logo, used raw: styles/intro.css paints it and masks the glint with this same file. */
export const INTRO_LOGO = "/brand/tfs-logo-light.png";

export const INTRO_TIMING = {
  /** First load: from navigation start until the curtain begins to open, once the mark has drawn. */
  entrance: 1600,
  /** The curtain opening while the logo flies into the header. */
  exit: 1000,
  /** A visitor who scrolls, taps or presses a key gets a quicker exit. */
  skip: 550,
  /** After a logo click: the curtain closing as the logo flies out of the header. */
  cover: 750,
  /** Covered, at least this long once the home page is in, so the gold glint can cross the logo. */
  hold: 700,
  /** If scripts never arrive, the boot script lifts the intro after this long. */
  failsafe: 7000,
} as const;

/** A strong ease-in-out: the logo and the curtain move on screen, start to finish. */
export const INTRO_EASE = "cubic-bezier(0.77, 0, 0.175, 1)";

export type Box = { left: number; top: number; width: number; height: number };
export type Flight = { x: number; y: number; scale: number };

/** Pure: the translate and scale that land box `from` on box `to`, centre on centre (FLIP). */
export function flightBetween(from: Box, to: Box): Flight {
  if (!(from.width > 0) || !(to.width > 0)) return { x: 0, y: 0, scale: 1 };
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scale: to.width / from.width,
  };
}

/** Pure: a flight as a CSS transform; scaling about the element's centre is the CSS default. */
export function flightTransform({ x, y, scale }: Flight): string {
  return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${scale.toFixed(4)})`;
}

type ClickLike = {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  defaultPrevented: boolean;
};

/** Pure: a click the intro may take over — the main button, no modifier (new tab, new window), not already handled. */
export function isPlainClick(event: ClickLike): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

type IntroListener = () => boolean;
const listeners = new Set<IntroListener>();

/** LogoIntro listens here, answering whether it took the request. Returns an unsubscribe. */
export function onIntroRequest(listener: IntroListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Asks the intro to play on the way home. False when nothing took it — the link then navigates as usual. */
export function requestIntro(): boolean {
  for (const listener of listeners) {
    if (listener()) return true;
  }
  return false;
}

/**
 * Runs in <head> before the first paint. Starts the intro — `data-intro="load"`
 * plus the entry marker — when motion is allowed, the tab is in front and it
 * hasn't played in this tab yet, and preloads the logo only then; it lifts the
 * intro after the failsafe, should the page's scripts never arrive to do so.
 */
export const INTRO_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;if(document.hidden||matchMedia("(prefers-reduced-motion: reduce)").matches||sessionStorage.getItem("${INTRO_SEEN_KEY}"))return;d.setAttribute("data-intro","load");d.setAttribute("${INTRO_ENTRY_ATTRIBUTE}","");var l=document.createElement("link");l.rel="preload";l.as="image";l.href="${INTRO_LOGO}";l.setAttribute("fetchpriority","high");document.head.appendChild(l);setTimeout(function(){if(d.getAttribute("data-intro")==="load"){d.removeAttribute("data-intro");d.removeAttribute("${INTRO_ENTRY_ATTRIBUTE}")}},${INTRO_TIMING.failsafe})}catch(e){}})();`;
