"use client";

import { useEffect, useState } from "react";

/** Guards against hydration mismatch for client-only state (e.g. persisted cart). */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
