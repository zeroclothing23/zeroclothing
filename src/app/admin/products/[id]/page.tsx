import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductForEdit } from "@/server/queries/admin";
import { getCategories } from "@/server/queries/catalog";
import { ProductForm } from "@/components/admin/product-form";
import { InventoryEditor } from "@/components/admin/inventory-editor";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductForEdit(id), getCategories()]);
  if (!product) notFound();

  return (
    <div className="space-y-8">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-display text-2xl font-semibold">Edit Product</h1>

      <ProductForm categories={categories} product={product} />

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Inventory</h2>
        <p className="text-sm text-muted-foreground">Update stock per size/color variant.</p>
        <InventoryEditor variants={product.variants} />
      </section>
    </div>
  );
}
