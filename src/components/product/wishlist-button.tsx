"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "@/server/actions/wishlist";

export function WishlistButton({
  productId,
  initialWishlisted = false,
  isAuthed,
  variant = "button",
}: {
  productId: string;
  initialWishlisted?: boolean;
  isAuthed: boolean;
  variant?: "button" | "icon";
}) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      toast.error("Sign in to save items to your wishlist.");
      router.push(`/login?callbackUrl=/wishlist`);
      return;
    }
    const next = !wishlisted;
    setWishlisted(next); // optimistic
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (!res.ok) {
        setWishlisted(!next);
        if (res.reason === "unauthenticated") router.push("/login?callbackUrl=/wishlist");
        else toast.error("Something went wrong.");
        return;
      }
      toast.success(res.added ? "Added to wishlist" : "Removed from wishlist");
    });
  }

  if (variant === "icon") {
    return (
      <button
        onClick={onClick}
        disabled={pending}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        aria-pressed={wishlisted}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-colors hover:bg-background cursor-pointer"
      >
        <Heart className={cn("h-4 w-4", wishlisted ? "fill-primary text-primary" : "text-foreground")} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      aria-pressed={wishlisted}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border transition-colors hover:border-primary cursor-pointer"
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart className={cn("h-5 w-5", wishlisted ? "fill-primary text-primary" : "text-foreground")} />
    </button>
  );
}
