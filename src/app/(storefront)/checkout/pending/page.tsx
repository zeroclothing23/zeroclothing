import Link from "next/link";
import { MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { prisma } from "@/server/db";
import { formatLKR } from "@/lib/utils";
import { BRAND as BRAND_CONST } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Shown when the online gateway isn't configured yet — the order is created as
 * PENDING and the customer is routed to a WhatsApp-assisted payment flow.
 */
export default async function CheckoutPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } }).catch(() => null)
    : null;

  const waText = encodeURIComponent(
    `Hi ZERØ! I'd like to complete payment for my order ${orderNumber ?? ""} (${
      order ? formatLKR(Number(order.total)) : ""
    }).`,
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <ClearCartOnMount />
      <Clock className="h-16 w-16 text-primary" />
      <h1 className="font-display text-3xl font-semibold">Order Received</h1>
      <p className="text-muted-foreground">
        Your order has been created and is awaiting payment. Complete your payment via WhatsApp and
        we&apos;ll confirm it right away.
      </p>
      {order && (
        <div className="w-full rounded-xl border border-border bg-card p-6 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-medium text-primary">{order.orderNumber}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Amount Due</span>
            <span className="font-medium">{formatLKR(Number(order.total))}</span>
          </div>
        </div>
      )}
      <Button asChild size="lg" className="bg-[#25D366] text-black hover:bg-[#20bd5a]">
        <a
          href={`https://wa.me/${BRAND_CONST.whatsapp}?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="h-4 w-4" /> Complete Payment on WhatsApp
        </a>
      </Button>
      <Link href="/shop" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
        Continue shopping
      </Link>
    </div>
  );
}
