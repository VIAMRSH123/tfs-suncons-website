"use client";

import dynamic from "next/dynamic";

/** The enquiry form and basket — below the fold on both pages that use it. */
export const LazyEnquirySection = dynamic(() =>
  import("@/components/sections/EnquirySection").then((module) => module.EnquirySection),
);
