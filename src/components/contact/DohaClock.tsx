"use client";

import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Qatar",
  hour: "2-digit",
  minute: "2-digit",
  weekday: "long",
});

/** A shared one-minute tick, aligned to the minute so the clock turns over on time. */
function subscribe(onTick: () => void) {
  let timer = 0;
  const schedule = () => {
    timer = window.setTimeout(() => {
      onTick();
      schedule();
    }, 60_000 - (Date.now() % 60_000));
  };
  schedule();
  return () => window.clearTimeout(timer);
}

const snapshot = () => formatter.format(new Date());
const serverSnapshot = () => "";

/**
 * The time in Doha, live — a small, true detail that makes a trading house
 * read as staffed. It states the time only: no open/closed state, because the
 * company publishes no business hours.
 */
export function DohaClock() {
  const now = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

  return (
    <p className="flex items-baseline gap-3">
      <span className="t-meta text-gold">Doha, now</span>
      <span className="t-index text-[clamp(1.6rem,1.2rem+1.4vw,2.4rem)] leading-none text-forest" suppressHydrationWarning>
        {now || "—"}
      </span>
    </p>
  );
}
