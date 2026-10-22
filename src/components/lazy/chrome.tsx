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
