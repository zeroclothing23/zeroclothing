import { listShippingRates } from "@/server/queries/admin";
import { saveShippingRate, deleteShippingRate } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatLKR } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const rates = await listShippingRates();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Shipping Rates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Weight-based Speed Post pricing (grams). Orders auto-calculate the matching tier.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Label</th>
              <th className="p-3">Min (g)</th>
              <th className="p-3">Max (g)</th>
              <th className="p-3">Price</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map((r) => (
              <tr key={r.id}>
                <td className="p-3 font-medium">{r.label}</td>
                <td className="p-3">{r.minWeight}</td>
                <td className="p-3">{r.maxWeight ?? "∞"}</td>
                <td className="p-3">{formatLKR(r.price)}</td>
                <td className="p-3">{r.isActive ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <form action={deleteShippingRate.bind(null, r.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Delete
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new rate */}
      <form action={saveShippingRate} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Add / Update Rate</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Label</Label>
            <Input name="label" placeholder="0–500g" required />
          </div>
          <div className="space-y-1.5">
            <Label>Price (LKR)</Label>
            <Input name="price" type="number" min="0" required />
          </div>
          <div className="space-y-1.5">
            <Label>Min weight (g)</Label>
            <Input name="minWeight" type="number" min="0" required />
          </div>
          <div className="space-y-1.5">
            <Label>Max weight (g, blank = ∞)</Label>
            <Input name="maxWeight" type="number" min="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Position</Label>
            <Input name="position" type="number" defaultValue={0} />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked className="accent-[#c9a86a]" /> Active
          </label>
        </div>
        <Button type="submit">Save Rate</Button>
      </form>
    </div>
  );
}
