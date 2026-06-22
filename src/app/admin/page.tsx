import Link from "next/link";
import { ShoppingCart, DollarSign, Users, Package, AlertTriangle } from "lucide-react";
import { getDashboardStats, getRevenueByDay } from "@/server/queries/admin";
import { formatLKR } from "@/lib/utils";
import { OrderStatusPill } from "@/components/admin/order-status-pill";
import { SalesChart } from "@/components/admin/sales-chart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, revenue] = await Promise.all([getDashboardStats(), getRevenueByDay(14)]);

  const cards = [
    { label: "Revenue", value: formatLKR(stats.revenue), icon: DollarSign },
    { label: "Orders", value: String(stats.orderCount), icon: ShoppingCart, sub: `${stats.pendingCount} pending` },
    { label: "Customers", value: String(stats.customerCount), icon: Users },
    { label: "Products", value: String(stats.productCount), icon: Package },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-semibold">{c.value}</p>
            {c.sub && <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>}
          </div>
        ))}
      </div>

      <SalesChart data={revenue} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-medium">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          <ul className="divide-y divide-border">
            {stats.recentOrders.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">No orders yet.</li>
            )}
            {stats.recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex items-center justify-between p-4 hover:bg-secondary/40">
                  <div>
                    <p className="text-sm font-medium text-primary">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">{o.fullName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{formatLKR(o.total)}</span>
                    <OrderStatusPill status={o.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Low stock */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <h2 className="font-medium">Low Stock Alerts</h2>
          </div>
          <ul className="divide-y divide-border">
            {stats.lowStock.length === 0 && (
              <li className="p-4 text-sm text-muted-foreground">All stocked up.</li>
            )}
            {stats.lowStock.map((v) => (
              <li key={v.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm">{v.product}</p>
                  <p className="text-xs text-muted-foreground">{v.size} · {v.color} · {v.sku}</p>
                </div>
                <span className={`text-sm font-semibold ${v.stock === 0 ? "text-destructive" : "text-primary"}`}>
                  {v.stock} left
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
