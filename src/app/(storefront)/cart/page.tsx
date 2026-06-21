"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { formatLKR } from "@/lib/utils";

export default function CartPage() {
  const mounted = useMounted();
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCart((s) => s.subtotal());

  if (!mounted) {
    return <div className="mx-auto max-w-5xl px-4 py-16" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 py-24 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">Your bag is empty</h1>
        <p className="text-muted-foreground">Find your next favourite piece.</p>
        <Button asChild size="lg">
          <Link href="/shop">Shop the Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight">Your Bag</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-4 py-5">
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
              </div>
              <div className="flex flex-1 flex-col">
                <Link href={`/product/${item.slug}`} className="font-medium hover:text-primary">
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {item.size} · {item.color}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-md border border-border">
                    <button
                      aria-label="Decrease"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label="Increase"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-medium">{formatLKR(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
              <button
                aria-label="Remove"
                onClick={() => removeItem(item.variantId)}
                className="self-start text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">Order Summary</h2>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatLKR(subtotal)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-muted-foreground">Calculated at checkout</span>
          </div>
          <Separator className="my-4" />
          <Button asChild size="lg" className="w-full">
            <Link href="/checkout">
              Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Link
            href="/shop"
            className="mt-3 block text-center text-xs uppercase tracking-wider text-muted-foreground hover:text-primary"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
