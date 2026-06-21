"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/store/cart";

/** Clears the persisted cart once, on mount (used on the order success page). */
export function ClearCartOnMount() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);
  return null;
}
