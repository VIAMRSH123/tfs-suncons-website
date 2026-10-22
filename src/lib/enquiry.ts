import { products, type Product } from "@/content/products";

/** A basket line as it leaves the site: the catalogue's name, a published size. */
export type EnquiryItem = { slug: string; name: string; packSize: string; quantity: number };

type RequestedItem = { slug: string; packSize: string; quantity: number };

/**
 * Every basket line must name a real product in one of its published pack
 * sizes — or no size, for products whose sizes are quoted on request. Names
 * come from the catalogue, never from the request. Null if any line fails.
 */
export function resolveItems(
  items: readonly RequestedItem[],
  catalogue: readonly Product[] = products,
): EnquiryItem[] | null {
  const resolved: EnquiryItem[] = [];
  for (const item of items) {
    const product = catalogue.find((candidate) => candidate.slug === item.slug);
    if (!product) return null;
    const sizes = product.packSizes;
    const isKnownSize = sizes.length === 0 ? item.packSize === "" : sizes.includes(item.packSize);
    if (!isKnownSize) return null;
    resolved.push({ slug: product.slug, name: product.name, packSize: item.packSize, quantity: item.quantity });
  }
  return resolved;
}
