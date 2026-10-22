import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { Category, Product } from "@/content/products";

/**
 * The trade catalogue as a PDF, built from the same catalogue the site renders,
 * so it can never drift from it. Set as a trade document: Times for display,
 * Helvetica for the small metadata, hairline rules, nothing claimed beyond the
 * pack or the published site.
 */

export type CatalogueInput = {
  categories: readonly Category[];
  products: readonly Product[];
  company: {
    legalName: string;
    tradingName: string;
    positioning: string;
    email: string;
    phones: readonly { display: string; label: string }[];
    address: { oneLine: string };
    domain: string;
  };
  /** Returns JPEG bytes for a product image path, or null if unavailable. */
  loadImage: (path: string) => Promise<Uint8Array | null>;
  /** e.g. "October 2026" — passed in so builds are reproducible in tests. */
  edition: string;
};

const A4 = { width: 595.28, height: 841.89 };
const MARGIN = 56;
const FOREST = rgb(0.075, 0.188, 0.122);
const GOLD = rgb(0.549, 0.396, 0.161);
const MUTED = rgb(0.388, 0.412, 0.384);
const RULE = rgb(0.89, 0.87, 0.81);

const VERIFIED_NOTE: Record<Product["verified"], string> = {
  pack: "Details read off the pack",
  site: "As published on the TFS website",
  owner: "Supplied by TFS",
};

/** Standard PDF fonts only encode WinAnsi; swap the few characters the data uses that it cannot. */
export function toWinAnsi(text: string): string {
  return text
    .replace(/→/g, "->")
    .replace(/[‐-―]/g, (dash) => (dash === "—" || dash === "–" ? dash : "-"))
    .replace(/[^\x20-\x7E -ÿ–—‘’“”•…·×]/g, "");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

type Fonts = { display: PDFFont; italic: PDFFont; sans: PDFFont; sansBold: PDFFont };

class Writer {
  page!: PDFPage;
  y = 0;
  pages: PDFPage[] = [];

  constructor(
    private readonly doc: PDFDocument,
    private readonly fonts: Fonts,
  ) {
    this.addPage();
  }

  addPage() {
    this.page = this.doc.addPage([A4.width, A4.height]);
    this.pages.push(this.page);
    this.y = A4.height - MARGIN;
  }

  ensure(height: number) {
    if (this.y - height < MARGIN + 30) this.addPage();
  }

  text(value: string, opts: { font: PDFFont; size: number; color?: ReturnType<typeof rgb>; x?: number; maxWidth?: number; leading?: number }) {
    const x = opts.x ?? MARGIN;
    const maxWidth = opts.maxWidth ?? A4.width - MARGIN - x;
    const leading = opts.leading ?? opts.size * 1.35;
    for (const line of wrap(value, opts.font, opts.size, maxWidth)) {
      this.ensure(leading);
      this.page.drawText(line, { x, y: this.y - opts.size, size: opts.size, font: opts.font, color: opts.color ?? FOREST });
      this.y -= leading;
    }
  }

  meta(value: string, x = MARGIN, color = GOLD) {
    this.page.drawText(toWinAnsi(value.toUpperCase()), { x, y: this.y - 7, size: 7, font: this.fonts.sans, color });
  }

  rule(color = RULE, thickness = 0.6) {
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: A4.width - MARGIN, y: this.y },
      thickness,
      color,
    });
  }
}

export async function buildCataloguePdf(input: CatalogueInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${input.company.tradingName} — Trade catalogue`);
  doc.setAuthor(input.company.legalName);
  doc.setSubject("Rice, spices, pulses and sugar supplied by TF Suncons, Doha");
  doc.setCreator(input.company.domain);

  const fonts: Fonts = {
    display: await doc.embedFont(StandardFonts.TimesRoman),
    italic: await doc.embedFont(StandardFonts.TimesRomanItalic),
    sans: await doc.embedFont(StandardFonts.Helvetica),
    sansBold: await doc.embedFont(StandardFonts.HelveticaBold),
  };
  const w = new Writer(doc, fonts);

  // ── Cover ────────────────────────────────────────────────────────────────
  w.meta(`Trade catalogue · TFS / DOH · ${input.edition}`);
  w.y -= 18;
  w.rule(FOREST, 1);
  w.y -= 70;
  w.text(input.company.tradingName, { font: fonts.display, size: 46, leading: 50 });
  w.text("Rice, spices, pulses & sugar for the trade.", { font: fonts.italic, size: 22, leading: 28, color: GOLD });
  w.y -= 26;
  w.text(input.company.positioning, { font: fonts.sans, size: 10.5, color: MUTED, maxWidth: 360 });
  w.y -= 40;
  w.rule();
  w.y -= 18;
  for (const category of input.categories) {
    const count = input.products.filter((product) => product.category === category.slug).length;
    w.ensure(30);
    w.page.drawText(toWinAnsi(category.name), { x: MARGIN, y: w.y - 16, size: 16, font: fonts.display, color: FOREST });
    w.page.drawText(toWinAnsi(category.tagline), { x: MARGIN + 110, y: w.y - 14, size: 9.5, font: fonts.sans, color: MUTED });
    w.page.drawText(`${String(count).padStart(2, "0")} ${count === 1 ? "line" : "lines"}`, {
      x: A4.width - MARGIN - 40,
      y: w.y - 14,
      size: 8,
      font: fonts.sans,
      color: GOLD,
    });
    w.y -= 30;
    w.rule();
    w.y -= 4;
  }
  w.y -= 30;
  w.meta("Shipper");
  w.y -= 14;
  w.text(input.company.legalName, { font: fonts.display, size: 12 });
  w.text(input.company.address.oneLine, { font: fonts.sans, size: 9, color: MUTED });
  w.text(
    `${input.company.phones.map((phone) => phone.display).join("  ·  ")}  ·  ${input.company.email}`,
    { font: fonts.sans, size: 9, color: MUTED },
  );

  // ── Products, by category ────────────────────────────────────────────────
  const imageCache = new Map<string, PDFImage | null>();
  const imageFor = async (path: string | null) => {
    if (!path) return null;
    if (!imageCache.has(path)) {
      const bytes = await input.loadImage(path);
      imageCache.set(path, bytes ? await doc.embedJpg(bytes) : null);
    }
    return imageCache.get(path) ?? null;
  };

  const IMAGE = 116;
  const TEXT_X = MARGIN + IMAGE + 22;
  const TEXT_W = A4.width - MARGIN - TEXT_X;

  for (const category of input.categories) {
    const items = input.products.filter((product) => product.category === category.slug);
    w.addPage();
    w.meta(`${category.name} · ${String(items.length).padStart(2, "0")} ${items.length === 1 ? "line" : "lines"}`);
    w.y -= 16;
    w.rule(FOREST, 1);
    w.y -= 18;
    w.text(category.name, { font: fonts.display, size: 30, leading: 34 });
    w.text(category.tagline, { font: fonts.italic, size: 13, color: GOLD });
    w.y -= 6;
    w.text(category.description, { font: fonts.sans, size: 9.5, color: MUTED, maxWidth: 420 });
    w.y -= 18;

    for (const product of items) {
      w.ensure(IMAGE + 24);
      w.rule();
      w.y -= 14;
      const top = w.y;
      const image = await imageFor(product.image);
      if (image) {
        const scale = Math.min(IMAGE / image.width, IMAGE / image.height);
        const dw = image.width * scale;
        const dh = image.height * scale;
        w.page.drawImage(image, { x: MARGIN + (IMAGE - dw) / 2, y: top - dh, width: dw, height: dh });
      } else {
        // The same honesty as the site: named, not pictured.
        w.page.drawText(toWinAnsi(product.name), { x: MARGIN, y: top - 34, size: 15, font: fonts.italic, color: FOREST, maxWidth: IMAGE });
        w.page.drawText("NAMED, NOT YET PICTURED", { x: MARGIN, y: top - 52, size: 6.5, font: fonts.sans, color: MUTED });
      }

      w.page.drawText(toWinAnsi(product.name), { x: TEXT_X, y: top - 16, size: 16, font: fonts.display, color: FOREST });
      const sizes = product.packSizes.length > 0 ? product.packSizes.join(" · ") : "Size on request";
      w.page.drawText(toWinAnsi(sizes.toUpperCase()), {
        x: A4.width - MARGIN - fonts.sans.widthOfTextAtSize(toWinAnsi(sizes.toUpperCase()), 7.5),
        y: top - 14,
        size: 7.5,
        font: fonts.sansBold,
        color: GOLD,
      });
      w.y = top - 26;
      if (product.brand) {
        w.text(product.brand, { font: fonts.italic, size: 10, color: GOLD, x: TEXT_X, maxWidth: TEXT_W });
      }
      w.text(product.description, { font: fonts.sans, size: 8.6, color: MUTED, x: TEXT_X, maxWidth: TEXT_W, leading: 12 });
      w.y -= 3;
      w.text(product.attributes.join("  ·  "), { font: fonts.sans, size: 7.6, color: FOREST, x: TEXT_X, maxWidth: TEXT_W, leading: 11 });
      w.y -= 2;
      w.text(
        `${VERIFIED_NOTE[product.verified]}  ·  ${input.company.domain}/products/${product.category}/${product.slug}`,
        { font: fonts.sans, size: 6.6, color: MUTED, x: TEXT_X, maxWidth: TEXT_W, leading: 10 },
      );
      w.y = Math.min(w.y, top - IMAGE) - 16;
    }
  }

  // ── Running footer on every page ─────────────────────────────────────────
  const total = w.pages.length;
  w.pages.forEach((page, index) => {
    const footer = toWinAnsi(
      `${input.company.tradingName} · Trade catalogue · ${input.edition}   —   Grades, moisture and broken-grain figures on enquiry: ${input.company.email}`,
    );
    page.drawText(footer, { x: MARGIN, y: 30, size: 6.5, font: fonts.sans, color: MUTED });
    const counter = `${index + 1} / ${total}`;
    page.drawText(counter, {
      x: A4.width - MARGIN - fonts.sans.widthOfTextAtSize(counter, 7),
      y: 30,
      size: 7,
      font: fonts.sans,
      color: GOLD,
    });
  });

  return doc.save();
}
