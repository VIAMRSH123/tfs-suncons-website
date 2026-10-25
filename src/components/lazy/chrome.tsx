"use client";

import dynamic from "next/dynamic";

/*
 * Site-wide chrome that renders nothing meaningful on the server — the cursor
 * never appears on touch devices, the tray stays hidden until something is in
 * the basket — so both load after hydration, off the critical path.
 */

export const LazyCustomCursor = dynamic(
  () => import("@/components/motion/CustomCursor").then((module) => module.CustomCursor),
  { ssr: false },
);

export const LazyEnquiryTray = dynamic(
  () => import("@/components/enquiry/EnquiryTray").then((module) => module.EnquiryTray),
  { ssr: false },
);

/**
 * The logo intro is the exception: it is server-rendered, so its curtain is in
 * the HTML for the first paint, and only its choreography arrives in its own
 * chunk once hydration starts. Until then the mark simply holds, as a
 * preloader should.
 */
export const LazyLogoIntro = dynamic(() =>
  import("@/components/intro/LogoIntro").then((module) => module.LogoIntro),
);
