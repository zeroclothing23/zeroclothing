import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminOrder } from "@/server/queries/admin";
import { formatLKR } from "@/lib/utils";
import { OrderStatusPill } from "@/components/admin/order-status-pill";
import { OrderStatusControl } from "@/components/admin/order-status-control";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString("en-LK")} · <OrderStatusPill status={order.status} />
          </p>
        </div>
        <OrderStatusControl orderId={order.id} current={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card">
            <h2 className="border-b border-border p-4 font-medium">Items</h2>
            <ul className="divide-y divide-border">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.size} · {i.color} · {i.sku} · ×{i.quantity}</p>
                  </div>
                  <span>{formatLKR(i.unitPrice * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-border p-4 text-sm">
              <Row label="Subtotal" value={formatLKR(order.subtotal)} />
              {order.discount > 0 && <Row label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={`- ${formatLKR(order.discount)}`} />}
              <Row label="Shipping" value={formatLKR(order.shippingFee)} />
              <div className="flex justify-between pt-2 font-semibold">
                <span>Total</span><span className="text-primary">{formatLKR(order.total)}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="mb-3 font-medium">Customer</h2>
            <p>{order.fullName}</p>
            <p className="text-muted-foreground">{order.email}</p>
            <p className="text-muted-foreground">{order.phone}</p>
          </section>
          <section className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="mb-3 font-medium">Delivery</h2>
            <p>{order.addressLine}</p>
            <p className="text-muted-foreground">{order.district}, {order.province} {order.postalCode}</p>
            <p className="mt-2 text-muted-foreground">Weight: {(order.totalWeight / 1000).toFixed(2)}kg</p>
            {order.notes && <p className="mt-2 text-muted-foreground">Note: {order.notes}</p>}
          </section>
          <section className="rounded-xl border border-border bg-card p-4 text-sm">
            <h2 className="mb-3 font-medium">Payment</h2>
            <p className="text-muted-foreground">
              {order.payment ? `${order.payment.provider} · ${order.payment.status}` : "No payment record"}
            </p>
            {order.payment?.providerRef && (
              <p className="text-xs text-muted-foreground">Ref: {order.payment.providerRef}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span><span className="text-foreground">{value}</span>
    </div>
  );
}
