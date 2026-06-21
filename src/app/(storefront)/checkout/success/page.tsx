import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { prisma } from "@/server/db";
import { formatLKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;
  const order = orderNumber
    ? await prisma.order.findUnique({ where: { orderNumber } }).catch(() => null)
    : null;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <ClearCartOnMount />
      <CheckCircle2 className="h-16 w-16 text-primary" />
      <h1 className="font-display text-3xl font-semibold">Thank You</h1>
      <p className="text-muted-foreground">
        Your order has been placed successfully. A confirmation email is on its way.
      </p>
      {order && (
        <div className="w-full rounded-xl border border-border bg-card p-6 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number</span>
            <span className="font-medium text-primary">{order.orderNumber}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium">{formatLKR(Number(order.total))}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">{order.status}</span>
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <Button asChild size="lg"><Link href="/shop">Continue Shopping</Link></Button>
        <Button asChild size="lg" variant="outline"><Link href="/orders">View Orders</Link></Button>
      </div>
    </div>
  );
}
