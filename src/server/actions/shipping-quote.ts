"use server";

import { calculateShipping } from "@/server/services/shipping";

/** Live shipping fee for the current cart weight (used on the checkout page). */
export async function quoteShipping(totalWeightGrams: number): Promise<number> {
  if (!Number.isFinite(totalWeightGrams) || totalWeightGrams <= 0) return 0;
  return calculateShipping(Math.round(totalWeightGrams));
}
