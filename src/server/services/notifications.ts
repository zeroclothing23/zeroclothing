import { prisma } from "@/server/db";
import { sendEmail, adminEmail } from "@/server/services/email";
import { BRAND } from "@/lib/constants";

function money(v: unknown) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
  }).format(Number(v));
}

function shell(title: string, inner: string) {
  return `
  <div style="background:#0a0a0a;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5">
    <div style="max-width:560px;margin:0 auto;background:#111;border:1px solid #242424;border-radius:12px;padding:32px">
      <h1 style="font-size:22px;letter-spacing:2px;margin:0 0 4px">ZER<span style="color:#c9a86a">Ø</span></h1>
      <h2 style="font-size:18px;margin:14px 0 12px;color:#f5f5f5">${title}</h2>
      ${inner}
      <p style="margin-top:24px;font-size:12px;color:#777">${BRAND.name} · Premium Streetwear · Sri Lanka<br/>Questions? WhatsApp us at +${BRAND.whatsapp}.</p>
    </div>
  </div>`;
}

/** Email the customer (and admin) when an order is confirmed/paid. */
export async function sendOrderConfirmation(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return;

  const rows = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;color:#cfcfcf;font-size:13px">${i.name} (${i.size}/${i.color}) ×${i.quantity}</td>
          <td style="padding:6px 0;text-align:right;color:#f5f5f5;font-size:13px">${money(Number(i.unitPrice) * i.quantity)}</td>
        </tr>`,
    )
    .join("");

  const inner = `
    <p style="font-size:14px;line-height:1.6;color:#cfcfcf">
      Thank you for your order, ${order.fullName.split(" ")[0]}! We've received it and will begin processing right away.
    </p>
    <p style="font-size:14px;margin:10px 0;color:#c9a86a;font-weight:bold">Order ${order.orderNumber}</p>
    <table style="width:100%;border-collapse:collapse;margin:12px 0">
      ${rows}
      <tr><td style="padding-top:10px;border-top:1px solid #242424;color:#999;font-size:13px">Subtotal</td><td style="padding-top:10px;border-top:1px solid #242424;text-align:right;font-size:13px">${money(order.subtotal)}</td></tr>
      ${Number(order.discount) > 0 ? `<tr><td style="color:#999;font-size:13px">Discount</td><td style="text-align:right;font-size:13px">- ${money(order.discount)}</td></tr>` : ""}
      <tr><td style="color:#999;font-size:13px">Shipping</td><td style="text-align:right;font-size:13px">${money(order.shippingFee)}</td></tr>
      <tr><td style="color:#f5f5f5;font-weight:bold;padding-top:6px">Total</td><td style="text-align:right;color:#c9a86a;font-weight:bold;padding-top:6px">${money(order.total)}</td></tr>
    </table>
    <p style="font-size:13px;color:#999">
      Delivering to:<br/>${order.fullName}, ${order.addressLine}, ${order.district}, ${order.province} ${order.postalCode}
    </p>`;

  await sendEmail({
    to: order.email,
    subject: `Order confirmed — ${order.orderNumber}`,
    html: shell("Order Confirmed", inner),
  });

  // Notify admin
  await sendEmail({
    to: adminEmail,
    subject: `New paid order — ${order.orderNumber} (${money(order.total)})`,
    html: shell("New Order Received", inner),
  });
}

/** Email the customer when an order status changes. */
export async function sendOrderStatusUpdate(orderId: string, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  const map: Record<string, string> = {
    PROCESSING: "We're preparing your order.",
    PRINTING: "Your custom pieces are being printed.",
    PACKED: "Your order is packed and ready to ship.",
    SHIPPED: "Your order is on its way via Speed Post!",
    DELIVERED: "Your order has been delivered. Welcome to ZERØ.",
    CANCELLED: "Your order has been cancelled.",
  };
  const message = map[status] ?? `Your order status is now ${status}.`;

  await sendEmail({
    to: order.email,
    subject: `Order ${order.orderNumber} — ${status}`,
    html: shell(
      `Order ${status}`,
      `<p style="font-size:14px;line-height:1.6;color:#cfcfcf">${message}</p>
       <p style="font-size:14px;margin-top:10px;color:#c9a86a;font-weight:bold">Order ${order.orderNumber}</p>`,
    ),
  });
}
