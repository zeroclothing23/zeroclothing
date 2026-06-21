import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { getUserOrders } from "@/server/queries/account";
import { formatLKR } from "@/lib/utils";
import { OrderStatusPill } from "@/components/admin/order-status-pill";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const session = await requireUser("/orders");
  const orders = await getUserOrders(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button asChild><Link href="/shop">Start Shopping</Link></Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-primary">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString("en-LK")} · {o.itemCount} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium">{formatLKR(o.total)}</span>
                  <OrderStatusPill status={o.status} />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
