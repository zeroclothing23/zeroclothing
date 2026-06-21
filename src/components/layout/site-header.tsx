"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, Search, ShoppingBag, User, Heart, Package, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CartDrawer } from "@/components/cart/cart-drawer";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/store/cart";
import { useMounted } from "@/lib/use-mounted";

export type HeaderUser = {
  name?: string | null;
  email?: string | null;
  role?: "USER" | "ADMIN";
} | null;

const NAV_LINKS = [
  { label: "Shop All", href: "/shop" },
  { label: "Cotton", href: "/shop?category=cotton-printed" },
  { label: "Acid Wash", href: "/shop?category=acid-wash" },
  { label: "Oversized", href: "/shop?category=oversized" },
  { label: "Hoodies", href: "/shop?category=hoodies" },
  { label: "Custom Design", href: "/custom-design" },
];

export function SiteHeader({ user }: { user: HeaderUser }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const mounted = useMounted();
  const count = useCart((s) => s.totalItems());

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Mobile menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button aria-label="Open menu" className="p-1 cursor-pointer">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border">
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="border-b border-border/60 py-3 text-sm uppercase tracking-wider text-foreground/90 hover:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <div className="flex flex-1 justify-center md:flex-none md:justify-start">
          <Logo />
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs font-medium uppercase tracking-[0.15em] text-foreground/80 transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/shop" aria-label="Search" className="hidden p-2 hover:text-primary sm:block">
            <Search className="h-5 w-5" />
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Account" className="p-2 hover:text-primary cursor-pointer">
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.name ?? user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account"><User className="h-4 w-4" /> My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders"><Package className="h-4 w-4" /> Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist"><Heart className="h-4 w-4" /> Wishlist</Link>
                </DropdownMenuItem>
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin"><Package className="h-4 w-4" /> Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" aria-label="Sign in" className="p-2 hover:text-primary">
              <User className="h-5 w-5" />
            </Link>
          )}

          <CartDrawer
            trigger={
              <button aria-label="Open cart" className="relative p-2 hover:text-primary cursor-pointer">
                <ShoppingBag className="h-5 w-5" />
                {mounted && count > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}
