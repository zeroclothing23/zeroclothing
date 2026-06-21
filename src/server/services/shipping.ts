import { prisma } from "@/server/db";
import { SHIPPING_BASE_FEE } from "@/lib/constants";

/**
 * Weight-based Speed Post shipping calculation for Sri Lanka.
 * Rate tiers are admin-configurable (ShippingRate table). Falls back to the
 * base fee (LKR 300) when no active tier matches the parcel weight.
 */
export async function calculateShipping(totalWeightGrams: number): Promise<number> {
  const rates = await prisma.shippingRate.findMany({
    where: { isActive: true },
    orderBy: { minWeight: "asc" },
  });

  const match = rates.find((r) => {
    const aboveMin = totalWeightGrams >= r.minWeight;
    const belowMax = r.maxWeight == null || totalWeightGrams <= r.maxWeight;
    return aboveMin && belowMax;
  });

  if (match) return Number(match.price);

  // No tier configured / matched → highest tier price or base fee.
  if (rates.length > 0) return Number(rates[rates.length - 1].price);
  return SHIPPING_BASE_FEE;
}

/** Sum the weight of all cart/order line items. */
export function totalCartWeight(
  items: { weightGrams: number; quantity: number }[],
): number {
  return items.reduce((sum, i) => sum + i.weightGrams * i.quantity, 0);
}
