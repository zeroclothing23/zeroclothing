import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { prisma } from "@/server/db";
import { ProductCard } from "@/components/product/product-card";
import { WishlistButton } from "@/components/product/wishlist-button";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const session = await requireUser("/wishlist");

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          category: { select: { name: true } },
          images: { take: 2, orderBy: { position: "asc" } },
          variants: { select: { stock: true } },
        },
      },
    },
  });

  const products = items.map((w) => ({
    id: w.product.id,
    name: w.product.name,
    slug: w.product.slug,
    price: Number(w.product.price),
    discountPrice: w.product.discountPrice ? Number(w.product.discountPrice) : null,
    image: w.product.images[0]?.url ?? "https://placehold.co/800x1000/0a0a0a/c9a86a/png?text=ZERO",
    secondaryImage: w.product.images[1]?.url ?? null,
    categoryName: w.product.category.name,
    isNewArrival: w.product.isNewArrival,
    isBestSeller: w.product.isBestSeller,
    inStock: w.product.variants.some((v) => v.stock > 0),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">Wishlist</h1>
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card py-20 text-center">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">Your wishlist is empty.</p>
          <Button asChild><Link href="/shop">Discover Products</Link></Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute right-2 top-2 z-10">
                <WishlistButton productId={p.id} isAuthed initialWishlisted variant="icon" />
              </div>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
