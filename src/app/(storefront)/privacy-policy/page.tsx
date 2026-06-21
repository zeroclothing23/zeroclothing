import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <PageShell eyebrow="Your data" title="Privacy Policy">
      <p>This policy explains what information we collect and how we use it when you shop with ZERØ Clothing.</p>
      <h2>Information we collect</h2>
      <p>We collect the details you provide at checkout and registration — name, email, phone, and delivery address — as well as order history. Payment card details are handled securely by our payment provider (PayHere) and are never stored on our servers.</p>
      <h2>How we use it</h2>
      <p>To process and deliver your orders, provide support, send order updates, and — if you opt in — share news about drops and offers.</p>
      <h2>Sharing</h2>
      <p>We share data only with the providers needed to run the store (payments, delivery, email) and never sell your information.</p>
      <h2>Your rights</h2>
      <p>You can request access to or deletion of your personal data at any time by contacting us.</p>
    </PageShell>
  );
}
