"use client";

import dynamic from "next/dynamic";

/**
 * The homepage's below-the-fold interactive sections. Each is still
 * server-rendered — copy, images and layout are in the HTML from the first
 * byte — but its JavaScript arrives in its own chunk once hydration starts,
 * instead of on the critical path.
 */

export const LazyManifestBand = dynamic(() =>
  import("@/components/sections/ManifestBand").then((module) => module.ManifestBand),
);

export const LazyPackCloud = dynamic(() =>
  import("@/components/sections/PackCloud").then((module) => module.PackCloud),
);

export const LazyRiceIndex = dynamic(() =>
  import("@/components/sections/RiceIndex").then((module) => module.RiceIndex),
);

export const LazyOrderPlanner = dynamic(() =>
  import("@/components/sections/OrderPlanner").then((module) => module.OrderPlanner),
);

export const LazyGrainMorph = dynamic(() =>
  import("@/components/motion/GrainMorph").then((module) => module.GrainMorph),
);

export const LazyTradeBoard = dynamic(() =>
  import("@/components/motion/TradeBoard").then((module) => module.TradeBoard),
);
