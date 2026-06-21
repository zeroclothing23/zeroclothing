import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopFilterBar } from "@/components/shop/shop-filter-bar";
import { ProductGrid } from "@/components/product/product-grid";
import { listProducts, getCategories } from "@/server/queries/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop premium streetwear tees — cotton printed, acid wash, oversized and custom designs.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const sort = (["newest", "price-asc", "price-desc"].includes(sp.sort ?? "")
    ? sp.sort
    : "newest") as "newest" | "price-asc" | "price-desc";

  const [products, categories] = await Promise.all([
    listProducts({ category: sp.category, sort, search: sp.search }),
    getCategories(),
  ]);

  const activeCategory = categories.find((c) => c.slug === sp.category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <p className="eyebrow mb-2">{activeCategory ? "Collection" : "All Products"}</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {activeCategory ? activeCategory.name : "The Collection"}
        </h1>
        {sp.search && (
          <p className="mt-2 text-sm text-muted-foreground">
            Results for “{sp.search}”
          </p>
        )}
      </header>

      <Suspense fallback={null}>
        <ShopFilterBar categories={categories} />
      </Suspense>

      <p className="mb-4 text-xs text-muted-foreground">{products.length} item(s)</p>
      <ProductGrid products={products} />
    </div>
  );
}
