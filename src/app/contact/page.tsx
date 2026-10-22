import type { Metadata } from "next";
import { DohaClock } from "@/components/contact/DohaClock";
import { PageTransition } from "@/components/layout/PageTransition";
import { Reveal } from "@/components/motion/Reveal";
import { LazyEnquirySection } from "@/components/lazy/enquiry";
import { PageHero } from "@/components/ui/PageHero";
import { company } from "@/content/company";

export const metadata: Metadata = {
  title: "Contact — Industrial Area, Doha",
  description:
    "Reach Suncons Trading & Contracting W.L.L. in Doha's Industrial Area: Building No 493, Zone 57, Street 43. Call +974 4455 0945 or email info@tfsuncons.com.qa.",
  alternates: { canonical: "/contact" },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: company.legalName,
  alternateName: company.tradingName,
  url: `${company.siteUrl}/contact`,
  image: `${company.siteUrl}/brand/tfs-logo.png`,
  email: company.email,
  telephone: company.phones[0].display,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${company.address.building}, ${company.address.zone}, ${company.address.street}`,
    addressLocality: company.address.area,
    addressRegion: company.address.city,
    addressCountry: "QA",
  },
};

/** A search link rather than an embedded map: no third-party script, no cookies. */
const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address.oneLine)}`;

/** The address as a drawn plate — a stylised street grid, labelled as not to scale. */
function AddressPlate() {
  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor-label="MAP"
      className="group block border border-sand bg-paper p-5 transition-colors hover:border-forest/50"
    >
      <svg viewBox="0 0 320 180" aria-hidden="true" className="h-auto w-full">
        <g stroke="var(--color-sand)" strokeWidth="1">
          {[30, 75, 120, 160].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="320" y2={y} />
          ))}
          {[40, 110, 190, 260].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="180" />
          ))}
        </g>
        <line x1="0" y1="120" x2="320" y2="120" stroke="var(--color-gold)" strokeWidth="2" />
        <text x="8" y="114" className="fill-gold font-sans" fontSize="9" letterSpacing="1.5">
          STREET 43
        </text>
        <circle cx="190" cy="120" r="10" fill="var(--color-forest)" className="transition-transform duration-500 group-hover:scale-110" style={{ transformOrigin: "190px 120px" }} />
        <circle cx="190" cy="120" r="3.5" fill="var(--color-ivory)" />
        <text x="206" y="104" className="fill-forest font-display" fontSize="15">
          Building 493
        </text>
        <text x="206" y="146" className="fill-muted font-sans" fontSize="9" letterSpacing="1.5">
          ZONE 57
        </text>
        <text x="206" y="160" className="fill-muted font-sans" fontSize="9" letterSpacing="1.5">
          INDUSTRIAL AREA
        </text>
      </svg>
      <span className="mt-3 flex items-baseline justify-between gap-3">
        <span className="t-meta text-muted">Not to scale</span>
        <span className="t-meta link-underline text-forest">Open in Google Maps ↗</span>
      </span>
    </a>
  );
}

export default function ContactPage() {
  return (
    <PageTransition>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

      <PageHero
        eyebrow="Contact"
        lines={["Industrial Area,", "Doha."]}
        description="Call any of the numbers below, or send an enquiry and we'll come back to you."
        crumbs={[{ href: "/", label: "Home" }]}
        aside={
          <div className="space-y-6">
            <DohaClock />
            <AddressPlate />
          </div>
        }
      />

      <section aria-labelledby="details-heading" className="bg-ivory pb-20">
        <div className="shell">
          <h2 id="details-heading" className="sr-only">
            Contact details
          </h2>

          <Reveal stagger className="grid gap-10 md:grid-cols-3">
            <address className="hairline pt-5 not-italic">
              <p className="t-meta text-muted">Address</p>
              <p className="t-title mt-4 text-[1.35rem] leading-snug text-forest">
                {company.address.building},<br />
                {company.address.zone}, {company.address.street},<br />
                {company.address.area},<br />
                {company.address.city}, {company.address.country}
              </p>
            </address>

            <div className="hairline pt-5">
              <p className="t-meta text-muted">Telephone</p>
              <ul className="mt-4 space-y-3">
                {company.phones.map((phone) => (
                  <li key={phone.display}>
                    <a href={phone.href} data-cursor-label="CALL" className="t-title link-underline text-[1.35rem] text-forest">
                      {phone.display}
                    </a>
                    <span className="t-meta ml-3 text-muted">{phone.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hairline pt-5">
              <p className="t-meta text-muted">Email</p>
              <p className="mt-4">
                <a
                  href={`mailto:${company.email}`}
                  data-cursor-label="EMAIL"
                  className="t-title link-underline break-words text-[1.35rem] text-forest"
                >
                  {company.email}
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <LazyEnquirySection index="02" />
    </PageTransition>
  );
}
