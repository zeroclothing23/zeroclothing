import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Sri Lankan Rupees. */
export function formatLKR(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

/** URL-safe slug from a product/category name. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Effective price after discount. */
export function effectivePrice(price: number, discountPrice?: number | null): number {
  if (discountPrice != null && discountPrice > 0 && discountPrice < price) {
    return discountPrice;
  }
  return price;
}

/** Discount percentage for display badges. */
export function discountPercent(price: number, discountPrice?: number | null): number | null {
  if (discountPrice != null && discountPrice > 0 && discountPrice < price) {
    return Math.round(((price - discountPrice) / price) * 100);
  }
  return null;
}
