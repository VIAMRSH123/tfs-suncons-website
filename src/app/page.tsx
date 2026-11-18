import type { Metadata } from "next";
import { PageTransition } from "@/components/layout/PageTransition";
import { JourneyHero } from "@/components/journey/JourneyHero";
import { CompanyIntro } from "@/components/sections/CompanyIntro";
import { SpiceBand } from "@/components/sections/SpiceBand";
import { Journey } from "@/components/sections/Journey";
import { QualitySection } from "@/components/sections/QualitySection";
import { LazyEnquirySection } from "@/components/lazy/enquiry";
import {
  LazyManifestBand,
  LazyOrderPlanner,
  LazyPackCloud,
  LazyRiceIndex,
} from "@/components/lazy/home";
import { company } from "@/content/company";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Organization schema — only fields that are verified on the official site.
 * No founding date, no employee count, no ratings.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.legalName,
  alternateName: company.tradingName,
  url: company.siteUrl,
  logo: `${company.siteUrl}/brand/tfs-logo.png`,
  description: company.descriptor,
  email: company.email,
  telephone: company.phones.map((phone) => phone.display),
  address: {
    "@type": "PostalAddress",
    streetAddress: `${company.address.building}, ${company.address.zone}, ${company.address.street}`,
    addressLocality: company.address.area,
    addressRegion: company.address.city,
    addressCountry: "QA",
  },
};

export default function HomePage() {
  return (
    <PageTransition>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <JourneyHero />
      <LazyManifestBand />
      <CompanyIntro />
      <LazyPackCloud />
      <LazyRiceIndex />
      <SpiceBand />
      <Journey />
      <LazyOrderPlanner />
      <QualitySection />
      <LazyEnquirySection />
    </PageTransition>
  );
}
