import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Shipping Policy" };

export default function ShippingPolicyPage() {
  return (
    <PageShell eyebrow="Delivery" title="Shipping Policy">
      <p>We deliver across Sri Lanka via Speed Post. Cash on delivery is not available — all orders are prepaid.</p>
      <h2>Processing time</h2>
      <p>Orders are processed and dispatched within 1–3 working days. Custom designs may take longer depending on complexity.</p>
      <h2>Delivery time</h2>
      <p>Estimated delivery is 2–5 working days island-wide after dispatch.</p>
      <h2>Shipping rates</h2>
      <p>Shipping is weight-based and calculated automatically at checkout:</p>
      <ul className="list-disc pl-5">
        <li>0–500g — LKR 300</li>
        <li>500g–1kg — LKR 400</li>
        <li>1kg–2kg — LKR 550</li>
        <li>2kg+ — LKR 750</li>
      </ul>
      <p>Rates may be updated from time to time. The rate shown at checkout is final.</p>
    </PageShell>
  );
}
