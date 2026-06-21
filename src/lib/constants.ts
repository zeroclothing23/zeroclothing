// Brand + domain constants for ZERØ Clothing

export const BRAND = {
  name: "ZERØ Clothing",
  shortName: "ZERØ",
  tagline: "Premium Streetwear. Engineered in Sri Lanka.",
  description:
    "ZERØ Clothing — premium streetwear apparel. Cotton printed, acid wash, oversized and custom design tees. Island-wide delivery across Sri Lanka.",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "94742357709",
  email: "hello@zeroclothing.lk",
} as const;

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type SizeValue = (typeof SIZES)[number];

// Sri Lanka provinces → districts (used by the checkout address form)
export const SL_PROVINCES: Record<string, string[]> = {
  Western: ["Colombo", "Gampaha", "Kalutara"],
  Central: ["Kandy", "Matale", "Nuwara Eliya"],
  Southern: ["Galle", "Matara", "Hambantota"],
  Northern: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
  Eastern: ["Trincomalee", "Batticaloa", "Ampara"],
  "North Western": ["Kurunegala", "Puttalam"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  Uva: ["Badulla", "Monaragala"],
  Sabaragamuwa: ["Ratnapura", "Kegalle"],
};

export const PROVINCES = Object.keys(SL_PROVINCES);

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "PRINTING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
] as const;

export const SHIPPING_BASE_FEE = 300; // LKR — fallback if no rate tier matches

export const SETTING_KEYS = {
  instagram: "social_instagram",
  tiktok: "social_tiktok",
  facebook: "social_facebook",
  youtube: "social_youtube",
  whatsapp: "support_whatsapp",
  freeShippingThreshold: "free_shipping_threshold",
} as const;
