import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { sendOrderConfirmation } from "@/server/services/notifications";

/**
 * DEV-ONLY: simulate a successful PayHere payment so the post-payment flow
 * (order → PAID, stock decrement, confirmation email) can be exercised locally
 * without a public webhook URL. Disabled in production.
 *
 *   POST /api/dev/mark-paid?order=ZERO-2026-000001
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "disabled_in_production" }, { status: 403 });
  }

  const orderNumber = req.nextUrl.searchParams.get("order");
  if (!orderNumber) {
    return NextResponse.json({ ok: false, error: "missing_order" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true },
  });
  if (!order) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  if (order.payment?.status === "PAID") {
    return NextResponse.json({ ok: true, already: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId: order.id },
      data: { status: "PAID", providerRef: "dev-simulated" },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  });

  sendOrderConfirmation(order.id).catch((e) => console.error("[dev mark-paid] email", e));
  return NextResponse.json({ ok: true, orderNumber, status: "PAID" });
}
