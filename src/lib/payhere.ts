import crypto from "crypto";

/**
 * PayHere integration helpers (Sri Lanka card gateway).
 * Docs: https://support.payhere.lk/api-&-mobile-sdk/checkout-api
 *
 * Flow:
 *  1. Server builds a checkout payload incl. a `hash` and renders an
 *     auto-submitting form to PayHere's checkout URL.
 *  2. User pays on PayHere's hosted page.
 *  3. PayHere POSTs an IPN to `notify_url` — we verify `md5sig` server-side
 *     and mark the order/payment PAID. (return_url is informational only.)
 */

const SANDBOX_CHECKOUT = "https://sandbox.payhere.lk/pay/checkout";
const LIVE_CHECKOUT = "https://www.payhere.lk/pay/checkout";

export function payhereConfig() {
  const mode = process.env.PAYHERE_MODE === "live" ? "live" : "sandbox";
  return {
    mode,
    merchantId: process.env.PAYHERE_MERCHANT_ID ?? "",
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET ?? "",
    checkoutUrl: mode === "live" ? LIVE_CHECKOUT : SANDBOX_CHECKOUT,
  };
}

function md5Upper(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex").toUpperCase();
}

/** Amount must be formatted to 2 decimals with no thousands separators. */
export function formatPayhereAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

/**
 * Hash sent with the checkout request:
 * UPPER( MD5( merchant_id + order_id + amount + currency + UPPER(MD5(secret)) ) )
 */
export function generateCheckoutHash(params: {
  merchantId: string;
  orderId: string;
  amount: string; // already formatted
  currency: string;
  merchantSecret: string;
}): string {
  const secretHash = md5Upper(params.merchantSecret);
  return md5Upper(
    params.merchantId + params.orderId + params.amount + params.currency + secretHash,
  );
}

/**
 * Verify the IPN signature PayHere posts to the notify_url:
 * md5sig = UPPER( MD5( merchant_id + order_id + payhere_amount +
 *                      payhere_currency + status_code + UPPER(MD5(secret)) ) )
 */
export function verifyNotifySignature(payload: {
  merchant_id: string;
  order_id: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
}): boolean {
  const { merchantSecret } = payhereConfig();
  if (!merchantSecret) return false;
  const secretHash = md5Upper(merchantSecret);
  const local = md5Upper(
    payload.merchant_id +
      payload.order_id +
      payload.payhere_amount +
      payload.payhere_currency +
      payload.status_code +
      secretHash,
  );
  return local === payload.md5sig?.toUpperCase();
}

/** status_code 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback */
export function mapPayhereStatus(
  statusCode: string,
): "PAID" | "PENDING" | "FAILED" | "REFUNDED" {
  switch (statusCode) {
    case "2":
      return "PAID";
    case "0":
      return "PENDING";
    case "-3":
      return "REFUNDED";
    default:
      return "FAILED";
  }
}

/** Build the fields for the auto-submit checkout form. */
export function buildCheckoutFields(order: {
  orderNumber: string;
  amount: number;
  fullName: string;
  email: string;
  phone: string;
  addressLine: string;
  district: string;
  itemsLabel: string;
}) {
  const cfg = payhereConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const amount = formatPayhereAmount(order.amount);
  const currency = "LKR";
  const [firstName, ...rest] = order.fullName.trim().split(" ");

  return {
    actionUrl: cfg.checkoutUrl,
    fields: {
      merchant_id: cfg.merchantId,
      return_url: `${appUrl}/checkout/success?order=${order.orderNumber}`,
      cancel_url: `${appUrl}/checkout/cancelled?order=${order.orderNumber}`,
      notify_url: `${appUrl}/api/payhere/notify`,
      order_id: order.orderNumber,
      items: order.itemsLabel,
      currency,
      amount,
      first_name: firstName || order.fullName,
      last_name: rest.join(" ") || "-",
      email: order.email,
      phone: order.phone,
      address: order.addressLine,
      city: order.district,
      country: "Sri Lanka",
      hash: generateCheckoutHash({
        merchantId: cfg.merchantId,
        orderId: order.orderNumber,
        amount,
        currency,
        merchantSecret: cfg.merchantSecret,
      }),
    },
  };
}
