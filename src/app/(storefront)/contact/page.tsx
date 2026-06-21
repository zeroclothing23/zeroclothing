import type { Metadata } from "next";
import { MessageCircle, Mail, Instagram } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = { title: "Contact Us" };

export default function ContactPage() {
  return (
    <PageShell eyebrow="Get in touch" title="Contact Us">
      <p>
        Questions about an order, sizing, or a custom design? Our team is quick to respond — WhatsApp
        is the fastest way to reach us.
      </p>
      <div className="grid gap-4 pt-4 sm:grid-cols-2">
        <a
          href={`https://wa.me/${BRAND.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
        >
          <MessageCircle className="h-6 w-6 text-[#25D366]" />
          <div>
            <p className="font-medium text-foreground">WhatsApp</p>
            <p className="text-xs">+{BRAND.whatsapp}</p>
          </div>
        </a>
        <a
          href={`mailto:${BRAND.email}`}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
        >
          <Mail className="h-6 w-6 text-primary" />
          <div>
            <p className="font-medium text-foreground">Email</p>
            <p className="text-xs">{BRAND.email}</p>
          </div>
        </a>
      </div>
      <div className="pt-6">
        <Button asChild size="lg" className="bg-[#25D366] text-black hover:bg-[#20bd5a]">
          <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </Button>
      </div>
      <p className="flex items-center gap-2 pt-4">
        <Instagram className="h-4 w-4 text-primary" /> Follow{" "}
        <a href="https://instagram.com/zeroclothing.lk" target="_blank" rel="noopener noreferrer">@zeroclothing.lk</a>
      </p>
    </PageShell>
  );
}
