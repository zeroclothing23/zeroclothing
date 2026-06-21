import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";

// --- Serializable shapes (Decimal → number) for client components ---

export type ProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  image: string;
  secondaryImage: string | null;
  categoryName: string;
  isNewArrival: boolean;
  isBestSeller: boolean;
  inStock: boolean;
};

export type ProductDetail = ProductCard & {
  description: string;
  material: string | null;
  weightGrams: number;
  images: { url: string; alt: string | null }[];
  variants: {
    id: string;
    sku: string;
    size: string;
    color: string;
    stock: number;
  }[];
  colors: string[];
  sizes: string[];
};

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  discountPrice: true,
  isNewArrival: true,
  isBestSeller: true,
  category: { select: { name: true } },
  images: { orderBy: { position: "asc" }, take: 2, select: { url: true } },
  variants: { select: { stock: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

function toCard(p: CardRow): ProductCard {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
    image: p.images[0]?.url ?? "https://placehold.co/800x1000/0a0a0a/c9a86a/png?text=ZERO",
    secondaryImage: p.images[1]?.url ?? null,
    categoryName: p.category.name,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    inStock: p.variants.some((v) => v.stock > 0),
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: cardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

export async function getNewArrivals(limit = 8): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isNewArrival: true },
    select: cardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

export async function getBestSellers(limit = 8): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, isBestSeller: true },
    select: cardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

export async function getProductsByCategorySlug(
  slug: string,
  limit = 8,
): Promise<ProductCard[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true, category: { slug } },
    select: cardSelect,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

export type ShopFilters = {
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  search?: string;
};

export async function listProducts(filters: ShopFilters): Promise<ProductCard[]> {
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "price-asc"
      ? { price: "asc" }
      : filters.sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const rows = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(filters.category ? { category: { slug: filters.category } } : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search, mode: "insensitive" } },
              { tags: { has: filters.search.toLowerCase() } },
            ],
          }
        : {}),
    },
    select: cardSelect,
    orderBy,
  });
  return rows.map(toCard);
}

export async function getCategories() {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true, image: true, description: true },
  });
  return rows;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true } },
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
  if (!p || !p.isActive) return null;

  const colors = [...new Set(p.variants.map((v) => v.color))];
  const sizes = [...new Set(p.variants.map((v) => v.size))];

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
    description: p.description,
    material: p.material,
    weightGrams: p.weightGrams,
    image: p.images[0]?.url ?? "https://placehold.co/800x1000/0a0a0a/c9a86a/png?text=ZERO",
    secondaryImage: p.images[1]?.url ?? null,
    categoryName: p.category.name,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    inStock: p.variants.some((v) => v.stock > 0),
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),
    colors,
    sizes,
  };
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
