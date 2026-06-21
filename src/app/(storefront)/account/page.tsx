import type { Metadata } from "next";
import Link from "next/link";
import { Package, Heart, MapPin, BadgeCheck, AlertCircle } from "lucide-react";
import { requireUser } from "@/lib/auth-guard";
import { getUserProfile } from "@/server/queries/account";
import { SignOutButton } from "@/components/account/sign-out-button";
import { AddressManager } from "@/components/account/address-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await requireUser("/account");
  const profile = await getUserProfile(session.user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">My Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
            <p>{profile?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
            <p>{profile?.phone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Email status</p>
            <p className="flex items-center gap-1">
              {profile?.emailVerified ? (
                <><BadgeCheck className="h-4 w-4 text-primary" /> Verified</>
              ) : (
                <><AlertCircle className="h-4 w-4 text-yellow-400" /> Unverified</>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <AccountTile href="/orders" icon={Package} title="Orders" desc="Track your purchases" />
        <AccountTile href="/wishlist" icon={Heart} title="Wishlist" desc="Saved pieces" />
        <AccountTile href="/account" icon={MapPin} title="Addresses" desc={`${profile?.addresses.length ?? 0} saved`} />
      </div>

      <AddressManager
        addresses={(profile?.addresses ?? []).map((a) => ({
          id: a.id,
          label: a.label,
          fullName: a.fullName,
          phone: a.phone,
          province: a.province,
          district: a.district,
          addressLine: a.addressLine,
          postalCode: a.postalCode,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}

function AccountTile({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary">
      <Icon className="h-6 w-6 text-primary" />
      <h2 className="mt-3 font-medium">{title}</h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
