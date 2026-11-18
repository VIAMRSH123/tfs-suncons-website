import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LazyCustomCursor, LazyEnquiryTray, LazyLogoIntro } from "@/components/lazy/chrome";
import { company } from "@/content/company";
import { INTRO_BOOT_SCRIPT } from "@/lib/intro";
import "./globals.css";

/**
 * Fraunces ships optional SOFT and WONK axes. We pin both to 0 in CSS, so
 * requesting them only adds weight to the font file — the variable font drops
 * from ~118 kB to ~60 kB without them.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.siteUrl),
  title: {
    default: `${company.tradingName} — Rice, Spices & Pulses Supplier in Doha, Qatar`,
    template: `%s — ${company.tradingName}`,
  },
  description:
    "Suncons Trading & Contracting W.L.L. supplies Indian rice, spices, pulses and sugar to Qatar's retail, industrial and food-service trade. Basmati, sona masoori and ground spices in trade pack sizes.",
  keywords: [
    "rice supplier Qatar",
    "basmati rice Doha",
    "sona masoori Qatar",
    "foodstuff trading Doha",
    "spices wholesale Qatar",
    "pulses supplier Qatar",
    "TFS Suncons",
  ],
  authors: [{ name: company.legalName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_QA",
    url: company.siteUrl,
    siteName: company.tradingName,
    title: `${company.tradingName} — Rice, Spices & Pulses Supplier in Doha`,
    description: company.descriptor,
    images: [
      {
        url: "/products/bharat-gate.png",
        width: 1000,
        height: 1000,
        alt: "Bharat Gate 1121 premium basmati rice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.tradingName} — Rice, Spices & Pulses Supplier in Doha`,
    description: company.descriptor,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#13301f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The intro's boot script marks <html> before hydration, so React must not object to that attribute.
    <html lang="en" className={`${fraunces.variable} ${inter.variable} js-motion`} suppressHydrationWarning>
      <head>
        {/* Before the first paint: decides whether the logo intro plays (lib/intro.ts). */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT_SCRIPT }} />
        {/* Scroll-revealed elements start hidden. Without scripting nothing
            would ever reveal them, so turn the whole system off there. */}
        <noscript>
          <style>{`.js-motion [data-reveal],.js-motion [data-reveal="stagger"]>*,.js-motion [data-reveal-line] [data-line-inner],.js-motion [data-reveal-mask],.js-motion [data-reveal-mask] img,.js-motion [data-arrive],.js-motion [data-draw-rule]{opacity:1!important;translate:none!important;scale:none!important;clip-path:none!important;animation:none!important}.js-motion [data-draw] *,.js-motion [data-draw-now] *{stroke-dashoffset:0!important;animation:none!important}.js-motion .story-pin{height:auto!important}.js-motion .story-pin__sticky{position:static!important;height:auto!important}.js-motion .journey-hero{height:auto!important}.js-motion .journey-stage::after{display:none!important}.js-motion .journey-stage__panel{height:auto!important}.js-motion .rice-index{height:auto!important}.js-motion .rice-index__panel{display:block!important;padding-block:var(--space-section)!important}.js-motion .rice-index__viewport{overflow-x:auto!important;mask-image:none!important;-webkit-mask-image:none!important}.js-motion .rice-index__track{translate:none!important}.js-motion .journey__chapter{opacity:1!important}.js-motion .pack-cloud__label,.js-motion .pack-cloud__specimen{opacity:1!important}.manifest-band__track{width:auto!important}.manifest-band__copy{flex-wrap:wrap!important}.manifest-band__copy[data-copy="1"]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <LazyLogoIntro />
        <LazyCustomCursor />
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <LazyEnquiryTray />
      </body>
    </html>
  );
}
