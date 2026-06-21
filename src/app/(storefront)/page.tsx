import { Hero } from "@/components/home/hero";
import {
  Marquee,
  CollectionBanner,
  WhyChooseUs,
  Reviews,
  CustomCTA,
  InstagramFeed,
} from "@/components/home/sections";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  getNewArrivals,
  getFeaturedProducts,
  getBestSellers,
} from "@/server/queries/catalog";
import { getSiteSettings } from "@/server/services/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [newArrivals, featured, bestSellers, settings] = await Promise.all([
    getNewArrivals(8),
    getFeaturedProducts(8),
    getBestSellers(4),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero />
      <Marquee />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Just dropped" title="New Arrivals" href="/shop?sort=newest" />
        <ProductGrid products={newArrivals} />
      </section>

      {/* Collection banners */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-2">
        <CollectionBanner
          title="Acid Wash"
          subtitle="Hand-finished"
          href="/shop?category=acid-wash"
          image="https://placehold.co/1200x800/111111/c9a86a/png?text=ACID+WASH"
        />
        <CollectionBanner
          title="Cotton Printed"
          subtitle="Everyday premium"
          href="/shop?category=cotton-printed"
          image="https://placehold.co/1200x800/0a0a0a/f5f5f5/png?text=COTTON"
          align="right"
        />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Curated" title="Featured" href="/shop" />
        <ProductGrid products={featured} />
      </section>

      <CustomCTA />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="Most wanted" title="Best Sellers" href="/shop" />
        <ProductGrid products={bestSellers} />
      </section>

      <WhyChooseUs />
      <Reviews />
      <InstagramFeed handle={settings.instagram} />
    </>
  );
}
