import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { verifyNotifySignature, mapPayhereStatus } from "@/lib/payhere";
import { sendOrderConfirmation } from "@/server/services/notifications";

/**
 * PayHere server-to-server IPN. PayHere POSTs form-encoded data here after a
 * payment attempt. We verify the md5 signature, then update the order/payment
 * and (on success) decrement stock + email the customer. Always 200 so PayHere
 * does not retry indefinitely once we've processed it.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const payload = Object.fromEntries(form.entries()) as Record<string, string>;

  const required = [
    "merchant_id",
    "order_id",
    "payhere_amount",
    "payhere_currency",
    "status_code",
    "md5sig",
  ];
  if (required.some((k) => !payload[k])) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const valid = verifyNotifySignature({
    merchant_id: payload.merchant_id,
    order_id: payload.order_id,
    payhere_amount: payload.payhere_amount,
    payhere_currency: payload.payhere_currency,
    status_code: payload.status_code,
    md5sig: payload.md5sig,
  });
  if (!valid) {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber: payload.order_id },
    include: { payment: true, items: true },
  });
  if (!order) {
    return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
  }

  const paymentStatus = mapPayhereStatus(payload.status_code);

  // Idempotency: if already paid, do nothing further.
  if (order.payment?.status === "PAID") {
    return NextResponse.json({ ok: true, already: true });
  }

  await prisma.payment.update({
    where: { orderId: order.id },
    data: {
      status: paymentStatus,
      providerRef: payload.payment_id ?? null,
      rawPayload: payload,
    },
  });

  if (paymentStatus === "PAID") {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      // Decrement stock now that payment is confirmed
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    });
    // Fire-and-forget email (do not block the 200 response)
    sendOrderConfirmation(order.id).catch((e) => console.error("[notify] email", e));
  } else if (paymentStatus === "FAILED" || paymentStatus === "REFUNDED") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
  }

  return NextResponse.json({ ok: true });
}
