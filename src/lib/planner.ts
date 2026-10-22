/**
 * Order-planner arithmetic. Only two kinds of number go in: the pack weights
 * printed on TFS packs, and figures the buyer types themselves. Nothing here
 * assumes a portion size, a yield or a container load.
 */

/** "35 kg" → 35, "500 g" → 0.5. Null for anything that is not a positive weight. */
export function parsePackKg(packSize: string): number | null {
  const match = packSize.trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(kg|g)$/);
  if (!match) return null;
  const value = Number(match[1]) * (match[2] === "g" ? 0.001 : 1);
  return value > 0 ? value : null;
}

/** Whole packs needed to cover `monthlyKg`, and the weight those packs supply. */
export function packsFor(monthlyKg: number, packKg: number): { packs: number; suppliedKg: number } {
  if (!(monthlyKg > 0) || !(packKg > 0)) return { packs: 0, suppliedKg: 0 };
  // Work in grams so 1.2 kg of 0.5 kg packs is 3 packs, not a float artefact.
  const needG = Math.round(monthlyKg * 1000);
  const packG = Math.round(packKg * 1000);
  const packs = Math.ceil(needG / packG);
  return { packs, suppliedKg: (packs * packG) / 1000 };
}

/** The buyer's portions × grams × service days, in kilograms. */
export function monthlyKgFromPortions(
  portionsPerDay: number,
  gramsPerPortion: number,
  daysPerMonth: number,
): number {
  if (!(portionsPerDay > 0) || !(gramsPerPortion > 0) || !(daysPerMonth > 0)) return 0;
  return (portionsPerDay * gramsPerPortion * daysPerMonth) / 1000;
}
