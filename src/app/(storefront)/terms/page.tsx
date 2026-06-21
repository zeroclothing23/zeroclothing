import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <PageShell eyebrow="The fine print" title="Terms &amp; Conditions">
      <p>By using zeroclothing.lk and placing an order, you agree to the following terms.</p>
      <h2>Orders</h2>
      <p>All orders are subject to availability and confirmation of payment. We reserve the right to refuse or cancel any order.</p>
      <h2>Pricing</h2>
      <p>Prices are listed in Sri Lankan Rupees (LKR) and include applicable taxes unless stated otherwise. We may update prices at any time.</p>
      <h2>Payment</h2>
      <p>Payments are processed securely via PayHere. Orders are only confirmed once payment is successfully received.</p>
      <h2>Intellectual property</h2>
      <p>All brand assets, designs, and content on this site are the property of ZERØ Clothing and may not be reproduced without permission.</p>
      <h2>Custom designs</h2>
      <p>By submitting artwork for a custom order, you confirm you hold the rights to use it. ZERØ is not liable for third-party IP infringement in customer-supplied designs.</p>
    </PageShell>
  );
}
