import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { company } from "@/content/company";
import { categories, products } from "@/content/products";
import { buildCataloguePdf } from "@/lib/catalogue-pdf";

/** Rendered once, at build time, from the catalogue — served as a static file. */
export const dynamic = "force-static";

/** Pack renders are 1000×1000 PNGs; 420px JPEG on white keeps the PDF small. */
async function loadImage(path: string): Promise<Uint8Array | null> {
  try {
    const source = await readFile(join(process.cwd(), "public", path));
    const jpeg = await sharp(source)
      .resize(420, 420, { fit: "inside" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    return new Uint8Array(jpeg);
  } catch {
    return null;
  }
}

export async function GET() {
  const edition = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const pdf = await buildCataloguePdf({ categories, products, company, loadImage, edition });
  return new Response(Buffer.from(pdf), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'inline; filename="tf-suncons-trade-catalogue.pdf"',
    },
  });
}
