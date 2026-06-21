import { ProductCard } from "@/components/product/product-card";
import type { ProductCard as ProductCardType } from "@/server/queries/catalog";

export function ProductGrid({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        No products found.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
