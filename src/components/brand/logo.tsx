import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * ZERØ wordmark. The slashed "Ø" is rendered as an SVG so it reads as a
 * deliberate brand mark rather than a font glyph. Gold stroke on dark.
 */
export function Logo({
  className,
  href = "/",
  size = "md",
}: {
  className?: string;
  href?: string;
  size?: "sm" | "md" | "lg";
}) {
  const text =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";

  return (
    <Link
      href={href}
      aria-label="ZERØ Clothing — home"
      className={cn(
        "font-display font-semibold tracking-[0.18em] text-foreground transition-colors hover:text-primary",
        text,
        className,
      )}
    >
      ZER<span className="text-primary">Ø</span>
    </Link>
  );
}
