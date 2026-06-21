import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Refund Policy" };

export default function RefundPolicyPage() {
  return (
    <PageShell eyebrow="Returns" title="Refund &amp; Returns Policy">
      <p>We want you to love your ZERØ pieces. If something isn&apos;t right, we&apos;re here to help.</p>
      <h2>Eligibility</h2>
      <p>Items may be returned within <strong>7 days</strong> of delivery, provided they are unworn, unwashed, and in original condition with tags attached.</p>
      <h2>Non-returnable items</h2>
      <p>Custom design and made-to-order items cannot be returned unless they arrive defective or incorrect.</p>
      <h2>How to request a return</h2>
      <p>Message us on WhatsApp with your order number and reason. Once approved, we&apos;ll guide you through sending the item back.</p>
      <h2>Refunds</h2>
      <p>Approved refunds are processed to your original payment method within 5–10 working days of us receiving the returned item. Shipping fees are non-refundable.</p>
    </PageShell>
  );
}
