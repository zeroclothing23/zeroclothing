"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shirt, ShoppingBag, Sparkles, User } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: Shirt },
  { label: "Cart", href: "/cart", icon: ShoppingBag, badge: true },
  { label: "Custom", href: "/custom-design", icon: Sparkles },
  { label: "Account", href: "/account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const mounted = useMounted();
  const count = useCart((s) => s.totalItems());

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {ITEMS.map(({ label, href, icon: Icon, badge }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {badge && mounted && count > 0 && (
                  <span className="absolute right-[22%] top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
