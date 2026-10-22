"use client";

import dynamic from "next/dynamic";

/** The flag storm canvas: its markup is server-rendered, the animation loads after. */
export const LazyFlagStorm = dynamic(() =>
  import("@/components/motion/FlagStorm").then((module) => module.FlagStorm),
);
