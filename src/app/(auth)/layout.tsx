import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo size="lg" />
          <Link href="/" className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
            ← Back to store
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
