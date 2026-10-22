/**
 * The flag storm's loop, as a pure function of time: hold on India, storm
 * across to Qatar, hold, storm back. Kept separate so the timing is testable.
 */

const HOLD_INDIA = 1.5;
const TO_QATAR = 3.2;
const HOLD_QATAR = 1.8;
const TO_INDIA = 3.2;

export const FLAG_CYCLE_SECONDS = HOLD_INDIA + TO_QATAR + HOLD_QATAR + TO_INDIA;

const sineInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** 0 = India, 1 = Qatar, for any number of seconds into the loop. */
export function flagProgress(seconds: number): number {
  const t = ((seconds % FLAG_CYCLE_SECONDS) + FLAG_CYCLE_SECONDS) % FLAG_CYCLE_SECONDS;
  if (t < HOLD_INDIA) return 0;
  if (t < HOLD_INDIA + TO_QATAR) return sineInOut((t - HOLD_INDIA) / TO_QATAR);
  if (t < HOLD_INDIA + TO_QATAR + HOLD_QATAR) return 1;
  return 1 - sineInOut((t - HOLD_INDIA - TO_QATAR - HOLD_QATAR) / TO_INDIA);
}
