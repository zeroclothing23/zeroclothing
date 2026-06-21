import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CheckoutCancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <XCircle className="h-16 w-16 text-destructive" />
      <h1 className="font-display text-3xl font-semibold">Payment Cancelled</h1>
      <p className="text-muted-foreground">
        Your payment wasn&apos;t completed{order ? ` for order ${order}` : ""}. Your bag is still saved —
        you can try again or reach us on WhatsApp for help.
      </p>
      <div className="flex gap-3">
        <Button asChild size="lg"><Link href="/checkout">Try Again</Link></Button>
        <Button asChild size="lg" variant="outline">
          <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer">
            WhatsApp Support
          </a>
        </Button>
      </div>
    </div>
  );
}
