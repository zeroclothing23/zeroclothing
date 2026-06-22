import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/server/queries/admin";
import { formatLKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new"><Plus className="h-4 w-4" /> New Product</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-border bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No products yet.</td></tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/30">
                <td className="p-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-primary">
                    {p.image && (
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-secondary">
                        <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                    )}
                    <span className="font-medium">{p.name}</span>
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">{p.category}</td>
                <td className="p-3">
                  {p.discountPrice ? (
                    <span><span className="text-primary">{formatLKR(p.discountPrice)}</span>{" "}
                      <span className="text-xs text-muted-foreground line-through">{formatLKR(p.price)}</span></span>
                  ) : (
                    formatLKR(p.price)
                  )}
                </td>
                <td className="p-3">
                  <span className={p.totalStock < 10 ? "text-primary" : ""}>{p.totalStock}</span>
                </td>
                <td className="p-3">
                  <span className={`text-xs uppercase tracking-wider ${p.isActive ? "text-green-400" : "text-muted-foreground"}`}>
                    {p.isActive ? "Active" : "Hidden"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
