import Link from "next/link";
import { listOrders } from "@/server/queries/admin";
import { formatLKR } from "@/lib/utils";
import { OrderStatusPill } from "@/components/admin/order-status-pill";

export const dynamic = "force-dynamic";

const FILTERS = ["ALL", "PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status = "ALL" } = await searchParams;
  const orders = await listOrders(status);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/orders?status=${f}`}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${
              status === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">District</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No orders found.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-secondary/30">
                <td className="p-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td className="p-3">{o.fullName}</td>
                <td className="p-3 text-muted-foreground">{o.district}</td>
                <td className="p-3">{formatLKR(o.total)}</td>
                <td className="p-3"><OrderStatusPill status={o.status} /></td>
                <td className="p-3 text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString("en-LK")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
