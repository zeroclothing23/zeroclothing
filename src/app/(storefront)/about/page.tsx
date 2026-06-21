import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <PageShell eyebrow="Our story" title="About ZERØ">
      <p>
        ZERØ Clothing was born from a simple belief: that world-class streetwear shouldn&apos;t
        require a passport. We build premium, heavyweight pieces — cotton printed, acid wash and
        oversized cuts — designed and finished right here in Sri Lanka.
      </p>
      <h2>Built different</h2>
      <p>
        Every tee starts with serious fabric: 240–300gsm combed and heavyweight cotton, cut for a
        boxy modern fit and printed with durable plastisol that survives the wash. No fast-fashion
        shortcuts — just considered pieces made to last.
      </p>
      <h2>Made for the island</h2>
      <p>
        From Colombo to Jaffna, we deliver island-wide via Speed Post, with secure card payments
        and a team that&apos;s a WhatsApp message away. ZERØ is the starting line — wear it, and
        build everything.
      </p>
    </PageShell>
  );
}
