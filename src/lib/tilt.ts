/**
 * Pointer and phone-attitude tilt, as pure math. usePointerTilt
 * (components/journey) does the listening and the frame loop.
 *
 * Positions are normalized: −1..1 on each axis, 0 at the centre, +x to the
 * right and +y down, like clientX/clientY.
 *
 * Sign convention: the model turns to face the pointer. Its surface swings
 * toward the pointer, so the edge nearest the pointer tips away from the
 * viewer: pointer high → top edge away (+rotateX); pointer right → right edge
 * away (+rotateY). The whole model also leans a few pixels toward the pointer,
 * the same way the site's depth layers drift with it (DepthField).
 */

export type TiltPosition = { x: number; y: number };

/** Degrees about the model's centre, and the lean in px. */
export type Tilt = { rotateX: number; rotateY: number; leanX: number; leanY: number };

export type TiltShape = {
  /** Degrees of tip with the pointer at the surface's edge. */
  maxAngle?: number;
  /** Pixels of lean toward the pointer at the edge. */
  lean?: number;
  /** Share of each half-axis, around the centre, that does nothing (0–1). */
  deadZone?: number;
};

/** A viewport-relative box, such as the DOMRect from getBoundingClientRect. */
export type SurfaceRect = { left: number; top: number; width: number; height: number };

/** A DeviceOrientationEvent's beta and gamma, in degrees. */
export type Attitude = { beta: number; gamma: number };

export type OrientationOptions = {
  /** Degrees of phone tilt, either way, for the full −1..1 range. */
  range?: number;
  /** `screen.orientation.angle`: 90 or 270 while the phone is held sideways. */
  screenAngle?: number;
};

export const TILT_MAX_ANGLE = 3;
export const TILT_LEAN = 8;
export const ORIENTATION_RANGE = 20;

/**
 * Perspective lives inside the transform, so the layer that tips owns its own
 * depth. styles/journey-tilt.css sizes it to the stage; 1600px stands in
 * wherever --tilt-perspective is not set.
 */
const PERSPECTIVE = "var(--tilt-perspective, 1600px)";

const RADIANS = Math.PI / 180;

function clampUnit(value: number): number {
  if (Number.isNaN(value)) return 0;
  return value < -1 ? -1 : value > 1 ? 1 : value;
}

/** 0 inside the dead zone; beyond it, rescaled so it still reaches ±1 and never jumps at the zone's edge. */
function outsideDeadZone(value: number, deadZone: number): number {
  const zone = deadZone > 0 ? Math.min(deadZone, 1) : 0;
  const size = Math.abs(value);
  if (size <= zone) return 0;
  return (Math.sign(value) * (size - zone)) / (1 - zone);
}

/** Pure: a normalized position → the tip and lean that face it. Inputs are clamped to −1..1. */
export function tiltFromPosition(
  { x, y }: TiltPosition,
  { maxAngle = TILT_MAX_ANGLE, lean = TILT_LEAN, deadZone = 0 }: TiltShape = {},
): Tilt {
  const towardX = outsideDeadZone(clampUnit(x), deadZone);
  const towardY = outsideDeadZone(clampUnit(y), deadZone);
  return {
    // Up the screen is −y, and tipping the top edge away is +rotateX. `0 - y`
    // rather than `-y` keeps the centre at +0, not −0.
    rotateX: (0 - towardY) * maxAngle,
    rotateY: towardX * maxAngle,
    leanX: towardX * lean,
    leanY: towardY * lean,
  };
}

/** −1 at the start of a span, 0 halfway, 1 at its end; 0 for a span with no size. */
function unitAcross(offset: number, span: number): number {
  return span > 0 ? clampUnit((offset / span) * 2 - 1) : 0;
}

/** Pure: where a pointer sits on a surface, as a normalized position clamped to its edges. */
export function pointerPosition(rect: SurfaceRect, clientX: number, clientY: number): TiltPosition {
  return {
    x: unitAcross(clientX - rect.left, rect.width),
    y: unitAcross(clientY - rect.top, rect.height),
  };
}

/** Degrees into [−180, 180). */
function wrapDegrees(angle: number): number {
  return ((((angle + 180) % 360) + 360) % 360) - 180;
}

/**
 * How far the screen's right edge dips below the horizon and how far its top
 * edge rises, in degrees. Read through gravity rather than from beta and gamma
 * directly: those are Euler angles, and on a phone held upright the slightest
 * roll sends gamma to ±90, which no clamp can hide.
 */
function screenTilt({ beta, gamma }: Attitude, screenAngle: number): { dip: number; rise: number } {
  const b = beta * RADIANS;
  const g = gamma * RADIANS;
  const a = screenAngle * RADIANS;
  // The world's "up" in the phone's own axes: x toward its right edge, y
  // toward its top edge, z out of the glass.
  const upX = -Math.sin(g) * Math.cos(b);
  const upY = Math.sin(b);
  const upZ = Math.cos(g) * Math.cos(b);
  // The same along the screen's axes, which turn with the content when the
  // phone is held sideways.
  const alongRight = upX * Math.cos(a) - upY * Math.sin(a);
  const alongTop = upX * Math.sin(a) + upY * Math.cos(a);
  return {
    dip: Math.asin(clampUnit(-alongRight)) / RADIANS,
    rise: Math.atan2(alongTop, upZ) / RADIANS,
  };
}

/**
 * Pure: a phone's attitude, relative to `origin` (how it was first held), as a
 * normalized position. The low edge plays the pointer, as if the model had
 * weight: dip the right edge and it leans and tips right; raise the top edge
 * and it leans toward the bottom. `range` degrees either way is the full range.
 */
export function orientationPosition(
  reading: Attitude,
  origin: Attitude,
  { range = ORIENTATION_RANGE, screenAngle = 0 }: OrientationOptions = {},
): TiltPosition {
  if (!(range > 0)) return { x: 0, y: 0 };
  const now = screenTilt(reading, screenAngle);
  const start = screenTilt(origin, screenAngle);
  return {
    x: clampUnit((now.dip - start.dip) / range),
    y: clampUnit(wrapDegrees(now.rise - start.rise) / range),
  };
}

/**
 * Pure: the CSS transform for a tilt — perspective, then the lean in screen
 * space, then the tip about the element's transform-origin.
 */
export function tiltTransform(
  { rotateX, rotateY, leanX, leanY }: Tilt,
  perspective: string = PERSPECTIVE,
): string {
  const lean = `translate(${leanX.toFixed(2)}px, ${leanY.toFixed(2)}px)`;
  const tip = `rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg)`;
  return `perspective(${perspective}) ${lean} ${tip}`;
}

/** True when nothing is tipped or leaning — the moment to drop the inline transform. */
export function isNeutralTilt({ rotateX, rotateY, leanX, leanY }: Tilt): boolean {
  return rotateX === 0 && rotateY === 0 && leanX === 0 && leanY === 0;
}
