"use client";

import { useEffect, type RefObject } from "react";
import { createFollower } from "@/lib/follow";
import { isTouchDevice, observeVisibility } from "@/lib/motion";
import {
  ORIENTATION_RANGE,
  TILT_LEAN,
  TILT_MAX_ANGLE,
  isNeutralTilt,
  orientationPosition,
  pointerPosition,
  tiltFromPosition,
  tiltTransform,
  type Attitude,
  type TiltPosition,
} from "@/lib/tilt";

export type PointerTiltOptions = {
  /** Degrees the model tips with the pointer at the surface's edge. Default 3. */
  maxAngle?: number;
  /** Pixels the model leans toward the pointer at the edge. Default 8. */
  lean?: number;
  /** Share of each half-axis around the centre that does nothing (0–1). Default 0.05. */
  deadZone?: number;
  /** Per-frame smoothing, as in lib/follow: lower is softer. Default 0.08, about 0.6 s to settle. */
  smoothing?: number;
  /** The phone tilt's strength relative to the pointer's, angle and lean alike; 0 turns it off. Default 0.5. */
  orientationScale?: number;
  /** Degrees of phone tilt, either way from how it was first held, for the full effect. Default 20. */
  orientationRange?: number;
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** About 0.6 s to settle: slow enough to read as the weight of a tabletop model. */
const TILT_SMOOTHING = 0.08;
const DEAD_ZONE = 0.05;
/** Phones get half the pointer's tip and lean: 1.5° and 4 px at the defaults. */
const ORIENTATION_SCALE = 0.5;

/**
 * The follower works in hundredths of the reach, so its 0.05 "arrived" snap is
 * far below anything visible (under 0.002° and 0.005 px at the defaults).
 */
const FOLLOW_UNITS = 100;

/** Readings that move the phone's target less than this (0.2° at the default range) are sensor noise. */
const ORIENTATION_NOISE = 0.01;

const CENTRE: TiltPosition = { x: 0, y: 0 };

type Aim = (position: TiltPosition) => void;
type TiltInput = { start: () => void; stop: () => void };

/**
 * True where the browser can report the phone's attitude at all. Listening
 * never prompts: iOS sends no readings until `requestPermission()` is called,
 * which a decoration never does, so there the listener simply hears nothing.
 * Chromium defines `requestPermission` too but grants it unasked, so whether
 * it exists says nothing about a prompt.
 */
function canReadOrientation(): boolean {
  return typeof DeviceOrientationEvent !== "undefined";
}

function currentScreenAngle(): number {
  return window.screen.orientation?.angle ?? 0;
}

/**
 * A fine pointer over `surface` aims the tilt; leaving the surface sends it
 * back to the centre. The surface's rect is read on pointerenter and, after a
 * scroll or resize, once on the next move — never on every move.
 */
function pointerInput(surface: HTMLElement, aim: Aim): TiltInput {
  let rect: DOMRect | null = null;

  const handleMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    rect ??= surface.getBoundingClientRect();
    aim(pointerPosition(rect, event.clientX, event.clientY));
  };
  const handleEnter = (event: PointerEvent) => {
    rect = null;
    handleMove(event);
  };
  const handleLeave = (event: PointerEvent) => {
    if (event.pointerType !== "touch") aim(CENTRE);
  };
  const forgetRect = () => {
    rect = null;
  };

  return {
    start() {
      surface.addEventListener("pointerenter", handleEnter);
      surface.addEventListener("pointermove", handleMove);
      surface.addEventListener("pointerleave", handleLeave);
      window.addEventListener("scroll", forgetRect, { passive: true });
      window.addEventListener("resize", forgetRect);
    },
    stop() {
      surface.removeEventListener("pointerenter", handleEnter);
      surface.removeEventListener("pointermove", handleMove);
      surface.removeEventListener("pointerleave", handleLeave);
      window.removeEventListener("scroll", forgetRect);
      window.removeEventListener("resize", forgetRect);
      rect = null;
    },
  };
}

/**
 * The phone's attitude aims the tilt, relative to how it was held when the
 * stage last came on screen (or the screen last turned). Jitter below
 * ORIENTATION_NOISE is ignored, so the frame loop sleeps while the phone is
 * held still.
 */
function orientationInput(aim: Aim, range: number): TiltInput {
  let origin: Attitude | null = null;
  let originAngle = 0;
  let aimed = CENTRE;

  const handleOrientation = ({ beta, gamma }: DeviceOrientationEvent) => {
    if (beta === null || gamma === null) return;
    const screenAngle = currentScreenAngle();
    if (!origin || screenAngle !== originAngle) {
      origin = { beta, gamma };
      originAngle = screenAngle;
    }
    const next = orientationPosition({ beta, gamma }, origin, { range, screenAngle });
    const isJitter =
      Math.abs(next.x - aimed.x) < ORIENTATION_NOISE && Math.abs(next.y - aimed.y) < ORIENTATION_NOISE;
    if (isJitter) return;
    aimed = next;
    aim(next);
  };

  return {
    start() {
      origin = null;
      aimed = CENTRE;
      window.addEventListener("deviceorientation", handleOrientation);
    },
    stop() {
      window.removeEventListener("deviceorientation", handleOrientation);
    },
  };
}

/**
 * Runs `input` only while `element` is on screen and motion is allowed, and
 * rests the tilt the moment either stops being true. Both are watched, so
 * flipping the OS setting mid-visit takes effect at once. Returns a cleanup.
 */
function runWhileAllowed(element: Element, input: TiltInput, rest: () => void): () => void {
  const reducedMotion = window.matchMedia(REDUCED_MOTION);
  let isOnScreen = false;
  let isRunning = false;

  const sync = () => {
    const shouldRun = isOnScreen && !reducedMotion.matches;
    if (shouldRun === isRunning) return;
    isRunning = shouldRun;
    if (shouldRun) {
      input.start();
      return;
    }
    input.stop();
    rest();
  };

  const stopObserving = observeVisibility(element, (isVisible) => {
    isOnScreen = isVisible;
    sync();
  });
  reducedMotion.addEventListener("change", sync);

  return () => {
    stopObserving();
    reducedMotion.removeEventListener("change", sync);
    input.stop();
  };
}

/**
 * Tips `targetRef`'s element toward the pointer over `surfaceRef`'s element: a
 * few degrees about its centre plus a small lean, spring-smoothed, as if the
 * visitor were tipping a tabletop model toward where they are looking. Sign
 * conventions are documented in lib/tilt.ts.
 *
 * - Fine pointers (`(hover: hover) and (pointer: fine)`) follow the pointer and
 *   ease back to neutral when it leaves the surface.
 * - Touch devices whose browser sends attitude readings unasked (Chrome and
 *   Firefox on Android) get the same tilt, at half strength, from how the
 *   phone is tipped. iOS sends none until asked, and it is never asked.
 * - Nothing runs under prefers-reduced-motion or while the target is off
 *   screen. The inline transform is cleared at rest and on unmount, so CSS
 *   decides the resting state.
 *
 * The transform is written straight onto the target on animation frames: no
 * React state, no re-render. Keep the surface outside the target — its rect
 * would otherwise move with the tilt.
 *
 * @example JourneyStage: the tilt layer wraps the camera; the veil stays outside it.
 *   const tiltRef = useRef<HTMLDivElement>(null);
 *   usePointerTilt(tiltRef, stageRef);
 *
 *   <div className="journey-viewport" aria-hidden="true">
 *     <div className="journey-tilt" ref={tiltRef}>
 *       <div className="journey-camera" style={camera}>{children}</div>
 *     </div>
 *     <div className="journey-veil" />
 *   </div>
 */
export function usePointerTilt(
  targetRef: RefObject<HTMLElement | null>,
  surfaceRef: RefObject<HTMLElement | null>,
  {
    maxAngle = TILT_MAX_ANGLE,
    lean = TILT_LEAN,
    deadZone = DEAD_ZONE,
    smoothing = TILT_SMOOTHING,
    orientationScale = ORIENTATION_SCALE,
    orientationRange = ORIENTATION_RANGE,
  }: PointerTiltOptions = {},
): void {
  useEffect(() => {
    const target = targetRef.current;
    const surface = surfaceRef.current;
    if (!target || !surface) return;

    // Touch devices have no pointer to follow; the phone's attitude stands in where it is free to read.
    const isTouch = isTouchDevice();
    if (isTouch && !(orientationScale > 0 && canReadOrientation())) return;

    const strength = isTouch ? orientationScale : 1;
    const shape = { maxAngle: maxAngle * strength, lean: lean * strength, deadZone };
    const follower = createFollower((x, y) => {
      const tilt = tiltFromPosition({ x: x / FOLLOW_UNITS, y: y / FOLLOW_UNITS }, shape);
      target.style.transform = isNeutralTilt(tilt) ? "" : tiltTransform(tilt);
    }, smoothing);
    const aim: Aim = ({ x, y }) => follower.to(x * FOLLOW_UNITS, y * FOLLOW_UNITS);
    const rest = () => {
      follower.stop();
      follower.jump(0, 0);
    };

    const input = isTouch ? orientationInput(aim, orientationRange) : pointerInput(surface, aim);
    const stopRunning = runWhileAllowed(target, input, rest);

    return () => {
      stopRunning();
      follower.stop();
      target.style.transform = "";
    };
  }, [targetRef, surfaceRef, maxAngle, lean, deadZone, smoothing, orientationScale, orientationRange]);
}
