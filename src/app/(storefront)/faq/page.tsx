import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "FAQ" };

const FAQS = [
  { q: "How long does delivery take?", a: "Orders are dispatched within 1–3 working days and typically arrive within 2–5 working days island-wide via Speed Post." },
  { q: "What payment methods do you accept?", a: "We accept Visa, MasterCard, and other major debit/credit cards through our secure PayHere gateway. Cash on delivery is not available." },
  { q: "How is shipping calculated?", a: "Shipping is weight-based and calculated automatically at checkout, starting from LKR 300." },
  { q: "What are your sizes like?", a: "Our tees run with a boxy modern fit. XS–XXL are available. Oversized styles intentionally run larger." },
  { q: "Can I return or exchange an item?", a: "Yes — unworn items in original condition can be returned within 7 days. See our Refund Policy for details." },
  { q: "Do you make custom designs?", a: "Absolutely. Head to our Custom Design page, upload your artwork and we'll quote you." },
];

export default function FaqPage() {
  return (
    <PageShell eyebrow="Help center" title="Frequently Asked Questions">
      <div className="space-y-6">
        {FAQS.map((f) => (
          <div key={f.q}>
            <h2>{f.q}</h2>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
