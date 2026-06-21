import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo size="lg" />
      <p className="font-display text-7xl font-semibold text-primary">404</p>
      <h1 className="font-display text-2xl font-semibold">Page Not Found</h1>
      <p className="max-w-sm text-muted-foreground">
        The page you&apos;re looking for has dropped out of the collection.
      </p>
      <Button asChild size="lg">
        <Link href="/">Back to Home</Link>
      </Button>
    </div>
  );
}
