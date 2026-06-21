import { auth } from "@/auth";
import { SiteHeader, type HeaderUser } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getSiteSettings } from "@/server/services/settings";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()]);

  const user: HeaderUser = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }
    : null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <SiteFooter settings={settings} />
      <MobileNav />
      <WhatsAppButton number={settings.whatsapp} />
    </div>
  );
}
