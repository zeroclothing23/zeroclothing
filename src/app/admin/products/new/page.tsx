import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/server/queries/catalog";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="space-y-6">
      <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="font-display text-2xl font-semibold">New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
