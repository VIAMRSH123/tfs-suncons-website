import Image from "next/image";
import Link from "next/link";
import { company } from "@/content/company";
import { categories, getProductsByCategory } from "@/content/products";

const siteLinks = [
  { href: "/products", label: "All products" },
  { href: "/about", label: "About TFS" },
  { href: "/contact", label: "Contact" },
  { href: "/contact#enquiry", label: "Trade enquiry" },
] as const;

const cell = "border-t border-ivory/15 px-0 py-6 md:px-6 md:first:pl-0";

/**
 * Every page closes on the concept: the footer is set as a bill of lading.
 * Each field is literally true — the shipper is the company, the place of
 * delivery is its address, the marks are the 91 every pack carries. No port,
 * vessel or route is named, because none is published.
 */
export function Footer() {
  return (
    <footer className="dark-section contours relative overflow-hidden">
      <div className="shell py-20 md:py-24">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-ivory/25 pb-5">
          <p className="t-meta text-gold-soft">Bill of lading · TFS / DOH</p>
          <p className="t-meta text-ivory/50">Marks &amp; numbers · 91</p>
        </div>

        <div className="grid md:grid-cols-4">
          <section aria-labelledby="bl-shipper" className={cell}>
            <h2 id="bl-shipper" className="t-meta text-ivory/50">
              Shipper
            </h2>
            <p className="mt-4 font-display text-[1.25rem] leading-snug text-ivory">
              {company.legalName}
            </p>
          </section>

          <section aria-labelledby="bl-consignee" className={`${cell} md:border-l`}>
            <h2 id="bl-consignee" className="t-meta text-ivory/50">
              Consignee
            </h2>
            <p className="mt-4 font-display text-[1.25rem] leading-snug text-ivory">
              You — the trade buyer reading this.
            </p>
          </section>

          <section aria-labelledby="bl-delivery" className={`${cell} md:border-l`}>
            <h2 id="bl-delivery" className="t-meta text-ivory/50">
              Place of delivery
            </h2>
            <address className="mt-4 not-italic leading-relaxed text-ivory/85">
              {company.address.building}, {company.address.zone}, {company.address.street}
              <br />
              {company.address.area}, {company.address.city}, {company.address.country}
            </address>
          </section>

          <section aria-labelledby="bl-notify" className={`${cell} md:border-l`}>
            <h2 id="bl-notify" className="t-meta text-ivory/50">
              Notify party
            </h2>
            <ul className="mt-4 space-y-1.5">
              {company.phones.map((phone) => (
                <li key={phone.display}>
                  <a href={phone.href} data-cursor-label="CALL" className="link-underline text-ivory/85 hover:text-ivory">
                    {phone.display}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${company.email}`}
                  data-cursor-label="EMAIL"
                  className="link-underline break-all text-ivory/85 hover:text-ivory"
                >
                  {company.email}
                </a>
              </li>
            </ul>
          </section>
        </div>

        <section aria-labelledby="bl-goods" className="border-y border-ivory/15 py-7">
          <h2 id="bl-goods" className="t-meta text-ivory/50">
            Description of goods
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-10 gap-y-4">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products/${category.slug}`}
                  className="group inline-flex items-baseline gap-3"
                >
                  <span className="font-display text-[clamp(1.6rem,1rem+2vw,2.6rem)] leading-none text-ivory transition-colors group-hover:text-gold-soft">
                    {category.name}
                  </span>
                  <span className="t-meta text-gold-soft">
                    {String(getProductsByCategory(category.slug).length).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-10 pt-10 md:grid-cols-12">
          <div className="md:col-span-6">
            {/* The mark is green-on-light, so on forest it sits on its own ivory plate. */}
            <span className="inline-flex bg-ivory px-5 py-3">
              <Image
                src="/brand/tfs-logo-light.png"
                alt="TFS Suncons"
                width={496}
                height={296}
                className="h-11 w-auto"
              />
            </span>
            <p className="t-meta mt-6 max-w-sm text-gold-soft">{company.positioning}</p>
          </div>
          <nav aria-label="Footer" className="md:col-span-6 md:justify-self-end">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {siteLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="t-meta link-underline text-ivory/75 hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-ivory/15 pt-6 text-ivory/50 md:flex-row md:items-center md:justify-between">
          <p className="t-meta">
            © {new Date().getFullYear()} {company.legalName}
          </p>
          <p className="t-meta">Signed for the shipper · Doha</p>
        </div>
      </div>
    </footer>
  );
}
