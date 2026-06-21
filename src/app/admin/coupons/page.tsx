import { prisma } from "@/server/db";
import { saveCoupon } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatLKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-semibold">Coupons</h1>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Value</th>
              <th className="p-3">Min Subtotal</th>
              <th className="p-3">Uses</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No coupons yet.</td></tr>
            )}
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-medium text-primary">{c.code}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3">{c.type === "PERCENT" ? `${Number(c.value)}%` : formatLKR(Number(c.value))}</td>
                <td className="p-3">{c.minSubtotal ? formatLKR(Number(c.minSubtotal)) : "—"}</td>
                <td className="p-3">{c.usedCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                <td className="p-3">{c.isActive ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={saveCoupon} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Create / Update Coupon</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input name="code" placeholder="ZERO10" required className="uppercase" />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <select name="type" className="flex h-11 w-full rounded-md border border-input bg-secondary/40 px-3 text-sm">
              <option value="PERCENT">Percent (%)</option>
              <option value="FIXED">Fixed (LKR)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Value</Label>
            <Input name="value" type="number" min="0" required />
          </div>
          <div className="space-y-1.5">
            <Label>Min Subtotal (optional)</Label>
            <Input name="minSubtotal" type="number" min="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Max Uses (optional)</Label>
            <Input name="maxUses" type="number" min="0" />
          </div>
        </div>
        <Button type="submit">Save Coupon</Button>
      </form>
    </div>
  );
}
