"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { auth } from "@/auth";
import { checkoutSchema } from "@/lib/validations/checkout";
import { calculateShipping } from "@/server/services/shipping";
import { generateOrderNumber } from "@/server/services/orderNumber";
import { buildCheckoutFields, payhereConfig } from "@/lib/payhere";
import { effectivePrice } from "@/lib/utils";

export type CheckoutCartItem = { variantId: string; quantity: number };

type CheckoutResult =
  | {
      ok: true;
      orderNumber: string;
      // when PayHere is configured, redirect the browser via auto-submit form
      checkout: { actionUrl: string; fields: Record<string, string> } | null;
    }
  | { ok: false; message: string };

/**
 * Authoritative checkout: re-prices the cart server-side, validates stock and
 * coupon, computes weight-based shipping, creates a PENDING order + payment,
 * and returns PayHere checkout fields (or null when the gateway is not yet
 * configured — the UI then falls back to WhatsApp-assisted payment).
 */
export async function createOrder(
  rawInput: unknown,
  cart: CheckoutCartItem[],
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details." };
  }
  if (!cart.length) return { ok: false, message: "Your bag is empty." };

  const session = await auth();
  const input = parsed.data;

  // Authoritative variant data
  const variantIds = cart.map((c) => c.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const lines = cart.map((c) => {
    const v = variants.find((x) => x.id === c.variantId);
    if (!v) throw new Error("variant_missing");
    const qty = Math.max(1, Math.min(c.quantity, v.stock));
    const unitPrice = effectivePrice(Number(v.product.price), v.product.discountPrice ? Number(v.product.discountPrice) : null);
    return {
      variant: v,
      quantity: qty,
      unitPrice,
      lineTotal: unitPrice * qty,
      weight: v.product.weightGrams * qty,
    };
  });

  // Stock check
  for (const l of lines) {
    if (l.variant.stock < 1) {
      return { ok: false, message: `${l.variant.product.name} (${l.variant.size}) is sold out.` };
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const totalWeight = lines.reduce((w, l) => w + l.weight, 0);

  // Coupon (optional)
  let discount = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } });
    const now = new Date();
    const valid =
      coupon &&
      coupon.isActive &&
      (!coupon.startsAt || coupon.startsAt <= now) &&
      (!coupon.expiresAt || coupon.expiresAt >= now) &&
      (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
      (!coupon.minSubtotal || subtotal >= Number(coupon.minSubtotal));
    if (valid && coupon) {
      discount =
        coupon.type === "PERCENT"
          ? Math.round((subtotal * Number(coupon.value)) / 100)
          : Number(coupon.value);
      discount = Math.min(discount, subtotal);
      couponCode = coupon.code;
    } else {
      return { ok: false, message: "That coupon is not valid." };
    }
  }

  const shippingFee = await calculateShipping(totalWeight);
  const total = subtotal - discount + shippingFee;

  // Create order + items + payment in a transaction with a unique order number
  const year = new Date().getFullYear();
  const order = await prisma.$transaction(async (tx) => {
    const orderNumber = await generateOrderNumber(tx, year);
    return tx.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id ?? null,
        status: "PENDING",
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        province: input.province,
        district: input.district,
        addressLine: input.addressLine,
        postalCode: input.postalCode,
        notes: input.notes || null,
        subtotal: new Prisma.Decimal(subtotal),
        discount: new Prisma.Decimal(discount),
        shippingFee: new Prisma.Decimal(shippingFee),
        total: new Prisma.Decimal(total),
        couponCode,
        totalWeight,
        items: {
          create: lines.map((l) => ({
            productId: l.variant.productId,
            variantId: l.variant.id,
            name: l.variant.product.name,
            sku: l.variant.sku,
            size: l.variant.size,
            color: l.variant.color,
            unitPrice: new Prisma.Decimal(l.unitPrice),
            quantity: l.quantity,
          })),
        },
        payment: {
          create: {
            provider: "payhere",
            status: "PENDING",
            amount: new Prisma.Decimal(total),
            currency: "LKR",
          },
        },
      },
    });
  });

  // Build PayHere checkout fields when configured
  const cfg = payhereConfig();
  if (cfg.merchantId && cfg.merchantSecret) {
    const itemsLabel = lines
      .map((l) => `${l.variant.product.name} x${l.quantity}`)
      .join(", ")
      .slice(0, 200);
    const { actionUrl, fields } = buildCheckoutFields({
      orderNumber: order.orderNumber,
      amount: total,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      addressLine: input.addressLine,
      district: input.district,
      itemsLabel,
    });
    return { ok: true, orderNumber: order.orderNumber, checkout: { actionUrl, fields } };
  }

  // Gateway not configured → WhatsApp-assisted fallback
  return { ok: true, orderNumber: order.orderNumber, checkout: null };
}
