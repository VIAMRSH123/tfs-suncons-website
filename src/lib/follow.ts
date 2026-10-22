/**
 * Moves a point toward a target with frame-rate independent exponential
 * smoothing — what the cursor and the magnetic buttons need, without an
 * animation library. The frame loop sleeps as soon as the point has arrived.
 */

export type Follower = {
  to: (x: number, y: number) => void;
  jump: (x: number, y: number) => void;
  stop: () => void;
};

/** Pure: one smoothing step, corrected for frames that took longer than 60 fps. */
export function step(current: number, target: number, smoothing: number, frames: number): number {
  const k = 1 - Math.pow(1 - smoothing, frames);
  return current + (target - current) * k;
}

const SETTLED = 0.05;
const FRAME_MS = 1000 / 60;

export function createFollower(
  apply: (x: number, y: number) => void,
  smoothing: number,
): Follower {
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let frame = 0;
  let last = 0;

  const tick = (now: number) => {
    const frames = last ? Math.min((now - last) / FRAME_MS, 4) : 1;
    last = now;
    x = step(x, tx, smoothing, frames);
    y = step(y, ty, smoothing, frames);

    if (Math.abs(tx - x) < SETTLED && Math.abs(ty - y) < SETTLED) {
      x = tx;
      y = ty;
      apply(x, y);
      frame = 0;
      last = 0;
      return;
    }
    apply(x, y);
    frame = requestAnimationFrame(tick);
  };

  return {
    to(nextX, nextY) {
      tx = nextX;
      ty = nextY;
      if (!frame) frame = requestAnimationFrame(tick);
    },
    jump(nextX, nextY) {
      tx = x = nextX;
      ty = y = nextY;
      apply(x, y);
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    },
  };
}
