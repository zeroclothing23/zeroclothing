import { headers } from "next/headers";

/**
 * Lightweight in-memory sliding-window rate limiter.
 *
 * Note: state lives per server instance. On a single Node server this is solid;
 * on serverless (Vercel) it limits per-lambda, which still blunts bursts. For
 * strict distributed limiting, swap the store for Upstash Redis later.
 */
type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= opts.limit) {
    return { ok: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { ok: true, remaining: opts.limit - bucket.count, retryAfterMs: 0 };
}

/** Best-effort client IP for keying limits (works behind Vercel/proxies). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/** Periodic cleanup to bound memory (best-effort). */
function sweep() {
  const now = Date.now();
  for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
}
// Run sweep opportunistically.
if (typeof globalThis !== "undefined") {
  const g = globalThis as { __zeroRlSweep?: boolean };
  if (!g.__zeroRlSweep) {
    g.__zeroRlSweep = true;
    setInterval(sweep, 60_000).unref?.();
  }
}
