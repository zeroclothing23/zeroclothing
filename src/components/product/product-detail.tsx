"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store/cart";
import { cn, formatLKR, discountPercent } from "@/lib/utils";
import type { ProductDetail as ProductDetailType } from "@/server/queries/catalog";

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const addItem = useCart((s) => s.addItem);

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState(1);

  const price = product.discountPrice ?? product.price;
  const off = discountPercent(product.price, product.discountPrice);

  // Variant matching the current color/size selection
  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.color === color && v.size === size),
    [product.variants, color, size],
  );

  // Which sizes are available for the chosen color
  const sizesForColor = useMemo(() => {
    const map = new Map<string, number>();
    product.variants
      .filter((v) => v.color === color)
      .forEach((v) => map.set(v.size, v.stock));
    return map;
  }, [product.variants, color]);

  function handleAdd() {
    if (!size) {
      toast.error("Please select a size.");
      return;
    }
    if (!selectedVariant || selectedVariant.stock < 1) {
      toast.error("That option is out of stock.");
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: price,
      weightGrams: product.weightGrams,
      quantity: qty,
      maxStock: selectedVariant.stock,
    });
    toast.success(`Added to bag · ${product.name} (${size})`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
            <Image
              src={product.images[activeImage]?.url ?? product.image}
              alt={product.images[activeImage]?.alt ?? product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {off && <Badge className="absolute left-3 top-3">-{off}%</Badge>}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-20 w-16 overflow-hidden rounded-md border-2 transition-colors cursor-pointer",
                    activeImage === i ? "border-primary" : "border-transparent opacity-70",
                  )}
                >
                  <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:py-4">
          <p className="eyebrow mb-2">{product.categoryName}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold">{formatLKR(price)}</span>
            {off && (
              <span className="text-base text-muted-foreground line-through">
                {formatLKR(product.price)}
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mt-7">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Color: <span className="text-foreground">{color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setColor(c);
                      setSize("");
                    }}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm transition-colors cursor-pointer",
                      color === c
                        ? "border-primary text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/40",
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const stock = sizesForColor.get(s) ?? 0;
                const disabled = stock < 1;
                return (
                  <button
                    key={s}
                    disabled={disabled}
                    onClick={() => setSize(s)}
                    className={cn(
                      "flex h-11 min-w-11 items-center justify-center rounded-md border px-3 text-sm transition-colors",
                      disabled
                        ? "cursor-not-allowed border-border/50 text-muted-foreground/40 line-through"
                        : "cursor-pointer",
                      size === s && !disabled
                        ? "border-primary bg-primary text-primary-foreground"
                        : !disabled && "border-border hover:border-foreground/40",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity + Add */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center rounded-md border border-border">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="hidden flex-1 sm:flex" onClick={handleAdd}>
              <ShoppingBag className="h-4 w-4" /> Add to Bag
            </Button>
          </div>

          {/* Meta */}
          <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            {product.material && (
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" /> {product.material}
              </li>
            )}
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Island-wide delivery across Sri Lanka
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" /> Secure card payment via PayHere
            </li>
          </ul>
        </div>
      </div>

      {/* Sticky mobile add-to-cart */}
      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-border bg-background/95 p-3 backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-muted-foreground">{size ? `Size ${size}` : "Select size"}</p>
            <p className="font-semibold">{formatLKR(price * qty)}</p>
          </div>
          <Button className="flex-1" size="lg" onClick={handleAdd}>
            <ShoppingBag className="h-4 w-4" /> Add to Bag
          </Button>
        </div>
      </div>
    </div>
  );
}
