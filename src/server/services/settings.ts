import { prisma } from "@/server/db";
import { BRAND } from "@/lib/constants";

export type SiteSettings = {
  instagram: string;
  tiktok: string;
  facebook: string;
  youtube: string;
  whatsapp: string;
  freeShippingThreshold: number;
};

const DEFAULTS: SiteSettings = {
  instagram: "",
  tiktok: "",
  facebook: "",
  youtube: "",
  whatsapp: BRAND.whatsapp,
  freeShippingThreshold: 0,
};

/** Load all site settings as a typed object, falling back to defaults. */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      instagram: map.social_instagram ?? DEFAULTS.instagram,
      tiktok: map.social_tiktok ?? DEFAULTS.tiktok,
      facebook: map.social_facebook ?? DEFAULTS.facebook,
      youtube: map.social_youtube ?? DEFAULTS.youtube,
      whatsapp: map.support_whatsapp ?? DEFAULTS.whatsapp,
      freeShippingThreshold: Number(map.free_shipping_threshold ?? DEFAULTS.freeShippingThreshold),
    };
  } catch {
    // DB not reachable (e.g. during build) → defaults keep the app rendering.
    return DEFAULTS;
  }
}
