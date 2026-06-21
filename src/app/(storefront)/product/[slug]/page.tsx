import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product/product-detail";
import { getProductBySlug } from "@/server/queries/catalog";
import { getWishlistedProductIds } from "@/server/actions/wishlist";
import { auth } from "@/auth";
import { BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const price = product.discountPrice ?? product.price;
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.name} · ${BRAND.name}`,
      description: product.description.slice(0, 160),
      images: [product.image],
      type: "website",
    },
    other: {
      "product:price:amount": String(price),
      "product:price:currency": "LKR",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [session, wishlistedIds] = await Promise.all([auth(), getWishlistedProductIds()]);
  const isAuthed = !!session?.user;
  const wishlisted = wishlistedIds.includes(product.id);

  const price = product.discountPrice ?? product.price;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: BRAND.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "LKR",
      price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} isAuthed={isAuthed} wishlisted={wishlisted} />
    </>
  );
}
