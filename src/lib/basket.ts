/**
 * The enquiry basket — what a buyer has marked to ask about. Pure functions,
 * never mutating: the store in components/enquiry persists the result.
 *
 * A line is a product in one pack size. The server re-checks every slug and
 * pack size against the catalogue, so nothing here is trusted beyond shape.
 */

export type BasketLine = {
  slug: string;
  name: string;
  packSize: string;
  quantity: number;
};

export type Basket = readonly BasketLine[];

export const MAX_LINES = 50;
export const MAX_QUANTITY = 100_000;

const clampQuantity = (quantity: number) =>
  Math.min(MAX_QUANTITY, Math.max(0, Math.floor(quantity)));

const sameLine = (line: BasketLine, slug: string, packSize: string) =>
  line.slug === slug && line.packSize === packSize;

/** Adds packs to a line, merging with an existing line for the same product and size. */
export function addLine(basket: Basket, line: BasketLine): Basket {
  const quantity = clampQuantity(line.quantity);
  if (quantity === 0) return basket;

  const existing = basket.find((item) => sameLine(item, line.slug, line.packSize));
  if (existing) {
    return basket.map((item) =>
      item === existing ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item,
    );
  }
  if (basket.length >= MAX_LINES) return basket;
  return [...basket, { ...line, quantity }];
}

/** Sets an exact quantity; zero or less removes the line. */
export function setQuantity(
  basket: Basket,
  slug: string,
  packSize: string,
  quantity: number,
): Basket {
  const next = clampQuantity(quantity);
  if (next === 0) return removeLine(basket, slug, packSize);
  return basket.map((item) => (sameLine(item, slug, packSize) ? { ...item, quantity: next } : item));
}

export function removeLine(basket: Basket, slug: string, packSize: string): Basket {
  return basket.filter((item) => !sameLine(item, slug, packSize));
}

export function countPacks(basket: Basket): number {
  return basket.reduce((total, item) => total + item.quantity, 0);
}

export function findLine(basket: Basket, slug: string, packSize: string): BasketLine | undefined {
  return basket.find((item) => sameLine(item, slug, packSize));
}

function isLine(value: unknown): value is BasketLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.slug === "string" &&
    typeof line.name === "string" &&
    typeof line.packSize === "string" &&
    typeof line.quantity === "number" &&
    Number.isFinite(line.quantity)
  );
}

/** Restores a stored basket, dropping anything that is not a well-formed line. */
export function parseBasket(raw: string | null): Basket {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return data.filter(isLine).reduce<Basket>((basket, line) => addLine(basket, line), []);
}
