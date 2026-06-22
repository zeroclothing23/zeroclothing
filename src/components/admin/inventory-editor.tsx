"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateVariantStock } from "@/server/actions/admin";

type Variant = {
  id: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
  lowStockAlert: number;
};

export function InventoryEditor({ variants }: { variants: Variant[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[520px] text-sm">
        <thead className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="p-3">SKU</th>
            <th className="p-3">Size</th>
            <th className="p-3">Color</th>
            <th className="p-3">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {variants.map((v) => (
            <Row key={v.id} variant={v} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ variant }: { variant: Variant }) {
  const [stock, setStock] = useState(variant.stock);
  const [pending, startTransition] = useTransition();
  const low = stock <= variant.lowStockAlert;

  function save() {
    startTransition(async () => {
      const res = await updateVariantStock(variant.id, stock);
      if (res.ok) toast.success(`${variant.sku} → ${stock}`);
      else toast.error(res.message);
    });
  }

  return (
    <tr className={low ? "bg-primary/5" : ""}>
      <td className="p-3 font-mono text-xs">{variant.sku}</td>
      <td className="p-3">{variant.size}</td>
      <td className="p-3">{variant.color}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(Math.max(0, Number(e.target.value)))}
            className="h-9 w-24"
          />
          <button
            onClick={save}
            disabled={pending || stock === variant.stock}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-primary hover:border-primary disabled:opacity-40 cursor-pointer"
            aria-label="Save stock"
          >
            <Check className="h-4 w-4" />
          </button>
          {low && <span className="text-xs text-primary">low</span>}
        </div>
      </td>
    </tr>
  );
}
