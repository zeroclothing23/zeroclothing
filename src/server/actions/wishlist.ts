"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { auth } from "@/auth";

type ToggleResult =
  | { ok: true; added: boolean }
  | { ok: false; reason: "unauthenticated" | "error" };

/** Add the product to the user's wishlist if absent, otherwise remove it. */
export async function toggleWishlist(productId: string): Promise<ToggleResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, reason: "unauthenticated" };

  try {
    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/wishlist");
      return { ok: true, added: false };
    }

    await prisma.wishlistItem.create({ data: { userId: session.user.id, productId } });
    revalidatePath("/wishlist");
    return { ok: true, added: true };
  } catch {
    return { ok: false, reason: "error" };
  }
}

/** Remove a single wishlist item (used on the wishlist page). */
export async function removeFromWishlist(productId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.wishlistItem.deleteMany({ where: { userId: session.user.id, productId } });
  revalidatePath("/wishlist");
}

/** Set of product IDs the current user has wishlisted (for marking UI state). */
export async function getWishlistedProductIds(): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });
  return items.map((i) => i.productId);
}
