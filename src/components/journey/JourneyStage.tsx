"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { along, tenth } from "@/lib/iso";
import { convoyAt, dwellProgress, journeyAt, resolveLength, topForProgress } from "@/lib/journey";
import { observeVisibility, reducedMotionNow, useIsomorphicLayoutEffect } from "@/lib/motion";
import { trackScrollProgress, type ProgressRange } from "@/lib/scroll";
import { CAMERA_STOPS, CARGO_LEGS, CHAPTERS, WORLD } from "./chapters";
import { usePointerTilt } from "./usePointerTilt";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
/** Where the whole hero pins; narrower, the stage alone holds under the header. */
const DESKTOP = "(min-width: 768px)";
/** Per-frame catch-up toward the scroll position — a soft scrub. */
const SCRUB_SMOOTHING = 0.14;

/** A media query as an external store, for useSyncExternalStore. */
function mediaStore(query: string) {
  return {
    subscribe(onChange: () => void) {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    read: () => window.matchMedia(query).matches,
  };
}

const motionPreference = mediaStore(REDUCED_MOTION);
const desktopLayout = mediaStore(DESKTOP);
/** The server can answer neither: it renders motion allowed, and the layout is CSS's. */
const serverSnapshot = () => false;

const chapterNumber = (index: number) => String(index + 1).padStart(2, "0");
const thousandth = (n: number) => Math.round(n * 1000) / 1000;

type TrackState = "done" | "current" | "next";

function trackState(index: number, active: number): TrackState {
  if (index < active) return "done";
  return index > active ? "next" : "current";
}

/** Sets one inline style, skipping the frames where it has not changed. */
function styleWriter(element: HTMLElement | SVGElement, property: "transform" | "opacity") {
  let last = "";
  return (value: string) => {
    if (value === last) return;
    last = value;
    element.style[property] = value;
  };
}

type Framing = { scale: number; focusX: number; focusY: number };

/** The camera's framing, which CSS sets per breakpoint: its scale and where in the viewport the focus lands. */
function readFraming(camera: HTMLElement, viewport: HTMLElement): Framing {
  const style = getComputedStyle(camera);
  const { width, height } = viewport.getBoundingClientRect();
  return {
    scale: Number.parseFloat(style.getPropertyValue("--scale")) || 1,
    focusX: resolveLength(style.getPropertyValue("--focus-x"), width),
    focusY: resolveLength(style.getPropertyValue("--focus-y"), height),
  };
}

/**
 * Paints the journey for scroll progress p — the camera, the rail's bars and
 * the cargo — and returns the chapter in view. A frame is a handful of
 * inline transforms and opacities on elements found once.
 */
function framePainter(root: HTMLElement, camera: HTMLElement) {
  const moveCamera = styleWriter(camera, "transform");
  const scaleBars = Array.from(root.querySelectorAll<HTMLElement>(".journey-rail__fill"), (bar) =>
    styleWriter(bar, "transform"),
  );
  const vehicles = CARGO_LEGS.map(({ id }) => {
    const group = root.querySelector<SVGGElement>(`[data-cargo="${id}"]`);
    return group && { move: styleWriter(group, "transform"), fade: styleWriter(group, "opacity") };
  });

  return (progress: number, { scale, focusX, focusY }: Framing): number => {
    const { chapter, x, y, chapterProgress } = journeyAt(progress, CAMERA_STOPS);
    moveCamera(`translate3d(${tenth(focusX - x * scale)}px, ${tenth(focusY - y * scale)}px, 0)`);
    scaleBars.forEach((scaleBar, index) => {
      const full = index < chapter ? 1 : index > chapter ? 0 : chapterProgress;
      scaleBar(`scaleX(${thousandth(full)})`);
    });
    convoyAt(progress, CARGO_LEGS, CHAPTERS.length).forEach(({ travelled, opacity }, index) => {
      const vehicle = vehicles[index];
      if (!vehicle) return;
      const [dx, dy] = along(travelled);
      vehicle.move(`translate(${tenth(dx)}px, ${tenth(dy)}px)`);
      vehicle.fade(String(thousandth(opacity)));
    });
    return chapter;
  };
}

type ScrollDriverOptions = {
  root: HTMLElement;
  panel: HTMLElement;
  camera: HTMLElement;
  viewport: HTMLElement;
  onChapter: (index: number) => void;
};

type ScrollDriver = { goTo: (index: number) => void; stop: () => void };

/**
 * Drives the journey from the scroll. A sticky element travels through its
 * track — the hero's frame through the pinned section on desktop, the stage's
 * panel through the stage on phones — and progress along that travel paints
 * each frame. The camera's subtree is the whole world, so nothing on it is a
 * CSS variable per frame, and React only hears about it when the chapter
 * changes. Expects to sit inside JourneyHero's `.journey-frame`.
 */
function driveByScroll({ root, panel, camera, viewport, onChapter }: ScrollDriverOptions): ScrollDriver {
  const desktop = window.matchMedia(DESKTOP);
  const paint = framePainter(root, camera);
  let framing = readFraming(camera, viewport);
  let progress = 0;
  let shown = -1;
  let track: HTMLElement | null = null;
  let range: ProgressRange = { start: 0, end: 1 };
  let stopTracking = () => {};

  const render = (next: number) => {
    progress = next;
    const chapter = paint(next, framing);
    if (chapter === shown) return;
    shown = chapter;
    onChapter(chapter);
  };

  const attach = () => {
    stopTracking();
    const sticky = desktop.matches ? root.closest<HTMLElement>(".journey-frame") : panel;
    track = sticky?.parentElement ?? null;
    if (!sticky || !track) return;
    // Progress reads 0 as the sticky element takes hold at its `top` and 1 as it lets go:
    // it fills the viewport below that offset, so its track's bottom is then the viewport's.
    range = { start: (Number.parseFloat(getComputedStyle(sticky).top) || 0) / window.innerHeight, end: 1 };
    framing = readFraming(camera, viewport);
    stopTracking = trackScrollProgress(track, render, { ...range, smoothing: SCRUB_SMOOTHING });
  };

  const reframe = new ResizeObserver(() => {
    framing = readFraming(camera, viewport);
    render(progress);
  });

  attach();
  desktop.addEventListener("change", attach);
  reframe.observe(viewport);

  return {
    goTo(index) {
      if (!track) return;
      const { top, height } = track.getBoundingClientRect();
      const target = topForProgress(dwellProgress(index, CHAPTERS.length), height, window.innerHeight, range);
      window.scrollTo({ top: window.scrollY + top - target, behavior: "smooth" });
    },
    stop() {
      stopTracking();
      desktop.removeEventListener("change", attach);
      reframe.disconnect();
      camera.style.transform = "";
      root.querySelectorAll<HTMLElement>(".journey-rail__fill").forEach((fill) => {
        fill.style.transform = "";
      });
    },
  };
}

type JourneyStageProps = {
  children: ReactNode;
  pack: { src: string; alt: string };
};

/**
 * Plays the journey: the camera over the world, the caption and the rail.
 * The world arrives as server-rendered children and never re-renders. With
 * motion allowed the visitor's scroll drives it (driveByScroll) and choosing a
 * chapter scrolls to it; with reduced motion it is a stepper — the rail
 * switches chapters instantly over a still world. Ambient loops pause when
 * the stage is off screen (`data-on-screen`, styles/journey.css).
 */
export function JourneyStage({ children, pack }: JourneyStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLElement | null>(null);
  const goToRef = useRef<((index: number) => void) | null>(null);
  const isReduced = useSyncExternalStore(motionPreference.subscribe, motionPreference.read, serverSnapshot);
  const isDesktop = useSyncExternalStore(desktopLayout.subscribe, desktopLayout.read, serverSnapshot);
  const isScrollDriven = !isReduced;
  const [active, setActive] = useState(0);
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return observeVisibility(root, setIsOnScreen);
  }, []);

  // A layout effect, so the frame is found before the tilt's effect reads it.
  useIsomorphicLayoutEffect(() => {
    frameRef.current = rootRef.current?.closest<HTMLElement>(".journey-frame") ?? null;
  }, []);

  // On desktop the copy sits over the world, so the pointer is followed across
  // the whole frame — the headline included — rather than letting go of the
  // tilt at the copy's edge. On phones the stage's panel is the stage alone.
  usePointerTilt(tiltRef, isDesktop ? frameRef : panelRef);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const panel = panelRef.current;
    const camera = cameraRef.current;
    const viewport = viewportRef.current;
    // Hydration renders with the server's answer (motion allowed); the live check
    // keeps reduced motion from attaching even for that first commit.
    if (!isScrollDriven || reducedMotionNow() || !root || !panel || !camera || !viewport) return;
    const driver = driveByScroll({ root, panel, camera, viewport, onChapter: setActive });
    goToRef.current = driver.goTo;
    return () => {
      goToRef.current = null;
      driver.stop();
    };
  }, [isScrollDriven]);

  const handleChoose = (index: number) => {
    if (goToRef.current) goToRef.current(index);
    else setActive(index);
  };

  // Scroll-driven, the variables stay on the first stop (the server-rendered frame) while
  // an inline transform moves the camera, so chapter changes never restyle the world.
  const [cameraX, cameraY] = CAMERA_STOPS[isScrollDriven ? 0 : active];
  const camera = {
    "--world-w": WORLD.width,
    "--world-h": WORLD.height,
    "--cx": cameraX,
    "--cy": cameraY,
  } as CSSProperties;

  return (
    <div ref={rootRef} className="journey-stage" data-on-screen={isOnScreen ? "true" : "false"}>
      <div ref={panelRef} className="journey-stage__panel">
        <div ref={viewportRef} className="journey-viewport" aria-hidden="true">
          <div ref={tiltRef} className="journey-tilt">
            <div ref={cameraRef} className="journey-camera" style={camera}>
              {children}
            </div>
          </div>
          <div className="journey-veil" />
        </div>

        <div className="journey-hud">
          <div className="journey-caption" aria-hidden="true">
            {CHAPTERS.map((chapter, index) => (
              <div key={chapter.id} className="journey-caption__card" data-active={index === active ? "true" : "false"}>
                <div className="min-w-0">
                  <p className="t-meta text-gold">
                    {chapterNumber(index)} · {chapter.label}
                  </p>
                  <p className="mt-2 font-display text-[1.3rem] leading-[1.15] tracking-[-0.01em] text-forest">
                    {chapter.title}
                  </p>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-charcoal/75">{chapter.text}</p>
                </div>
                {chapter.id === "packed" ? (
                  <Image src={pack.src} alt="" width={240} height={240} sizes="80px" className="pack h-20 w-auto shrink-0" />
                ) : null}
              </div>
            ))}
          </div>

          <div className="shell">
            <div className="journey-rail-bar">
              <ol className="journey-rail" aria-label="The journey, chapter by chapter">
                {CHAPTERS.map((chapter, index) => (
                  <li key={chapter.id}>
                    <button
                      type="button"
                      className="journey-rail__button"
                      aria-current={index === active ? "step" : undefined}
                      aria-describedby={`journey-note-${chapter.id}`}
                      onClick={() => handleChoose(index)}
                    >
                      <span className="flex items-baseline gap-2">
                        <span className="t-index text-[0.95rem]">{chapterNumber(index)}</span>
                        <span className="journey-rail__label t-meta">{chapter.label}</span>
                      </span>
                      <span
                        className="journey-rail__track"
                        data-state={isScrollDriven ? undefined : trackState(index, active)}
                      >
                        <span className="journey-rail__fill" />
                      </span>
                    </button>
                    <span id={`journey-note-${chapter.id}`} className="sr-only">
                      {chapter.title}. {chapter.text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
