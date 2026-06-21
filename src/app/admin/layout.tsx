import { Logo } from "@/components/brand/logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-border bg-card md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <div className="flex items-center justify-between border-b border-border p-4">
          <Logo size="sm" />
          <span className="text-[10px] uppercase tracking-widest text-primary">Admin</span>
        </div>
        <AdminNav />
        <div className="hidden p-4 text-xs text-muted-foreground md:block">
          {session.user.email}
        </div>
      </aside>
      <main className="p-4 sm:p-8">{children}</main>
    </div>
  );
}
