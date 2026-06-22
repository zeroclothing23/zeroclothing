import { getSiteSettings } from "@/server/services/settings";
import { saveSettings } from "@/server/actions/admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const s = await getSiteSettings();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold">Site Settings</h1>

      <form action={saveSettings} className="max-w-xl space-y-5 rounded-xl border border-border bg-card p-6">
        <h2 className="font-medium">Social Links</h2>
        <div className="space-y-1.5">
          <Label>Instagram URL</Label>
          <Input name="social_instagram" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
        </div>
        <div className="space-y-1.5">
          <Label>TikTok URL</Label>
          <Input name="social_tiktok" defaultValue={s.tiktok} placeholder="https://tiktok.com/@…" />
        </div>
        <div className="space-y-1.5">
          <Label>Facebook URL</Label>
          <Input name="social_facebook" defaultValue={s.facebook} placeholder="https://facebook.com/…" />
        </div>
        <div className="space-y-1.5">
          <Label>YouTube URL</Label>
          <Input name="social_youtube" defaultValue={s.youtube} placeholder="https://youtube.com/@…" />
        </div>

        <h2 className="pt-2 font-medium">Support &amp; Shipping</h2>
        <div className="space-y-1.5">
          <Label>WhatsApp Number (intl, e.g. 94742357709)</Label>
          <Input name="support_whatsapp" defaultValue={s.whatsapp} />
        </div>
        <div className="space-y-1.5">
          <Label>Free Shipping Threshold (LKR, 0 = off)</Label>
          <Input name="free_shipping_threshold" type="number" min="0" defaultValue={s.freeShippingThreshold} />
        </div>

        <Button type="submit">Save Settings</Button>
      </form>
    </div>
  );
}
