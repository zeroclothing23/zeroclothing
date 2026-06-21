import type { MetadataRoute } from "next";
import { getAllProductSlugs, getCategories } from "@/server/queries/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const staticRoutes = [
    "",
    "/shop",
    "/custom-design",
    "/about",
    "/contact",
    "/faq",
    "/shipping-policy",
    "/refund-policy",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const [slugs, categories] = await Promise.all([getAllProductSlugs(), getCategories()]);
    dynamicRoutes = [
      ...slugs.map((slug) => ({
        url: `${base}/product/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...categories.map((c) => ({
        url: `${base}/shop?category=${c.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    // DB unavailable during build → ship static routes only.
  }

  return [...staticRoutes, ...dynamicRoutes];
}
