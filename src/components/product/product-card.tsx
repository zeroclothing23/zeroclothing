import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ProductCard as ProductCardType } from "@/server/queries/catalog";
import { formatLKR, discountPercent } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductCardType }) {
  const off = discountPercent(product.price, product.discountPrice);
  const price = product.discountPrice ?? product.price;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-opacity duration-500 group-hover:opacity-0"
        />
        {product.secondaryImage && (
          <Image
            src={product.secondaryImage}
            alt={`${product.name} alternate`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {off && <Badge>-{off}%</Badge>}
          {product.isNewArrival && <Badge variant="outline" className="bg-background/70">New</Badge>}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {product.categoryName}
        </p>
        <h3 className="text-sm font-medium leading-tight transition-colors group-hover:text-primary">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatLKR(price)}</span>
          {off && (
            <span className="text-xs text-muted-foreground line-through">
              {formatLKR(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
