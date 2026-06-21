import { PrismaClient, Size } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const img = (label: string) =>
  `https://placehold.co/800x1000/0a0a0a/c9a86a/png?text=${encodeURIComponent(label)}`;

const SIZES: Size[] = ["XS", "S", "M", "L", "XL", "XXL"];

async function main() {
  console.log("🌱 Seeding ZERØ Clothing…");

  // --- Admin user ---
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@zeroclothing.lk";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash },
    create: {
      email: adminEmail,
      name: "ZERØ Admin",
      role: "ADMIN",
      passwordHash,
      emailVerified: new Date(),
    },
  });
  console.log(`  ✓ admin: ${adminEmail}`);

  // --- Shipping rates (weight tiers, LKR) ---
  const rates = [
    { label: "0–500g", minWeight: 0, maxWeight: 500, price: 300, position: 1 },
    { label: "500g–1kg", minWeight: 501, maxWeight: 1000, price: 400, position: 2 },
    { label: "1kg–2kg", minWeight: 1001, maxWeight: 2000, price: 550, position: 3 },
    { label: "2kg+", minWeight: 2001, maxWeight: null, price: 750, position: 4 },
  ];
  await prisma.shippingRate.deleteMany();
  for (const r of rates) await prisma.shippingRate.create({ data: r });
  console.log(`  ✓ ${rates.length} shipping rates`);

  // --- Settings ---
  const settings: Record<string, string> = {
    social_instagram: "https://instagram.com/zeroclothing.lk",
    social_tiktok: "https://tiktok.com/@zeroclothing.lk",
    social_facebook: "https://facebook.com/zeroclothing.lk",
    social_youtube: "https://youtube.com/@zeroclothing",
    support_whatsapp: "94742357709",
    free_shipping_threshold: "15000",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log(`  ✓ ${Object.keys(settings).length} settings`);

  // --- Categories ---
  const categories = [
    { name: "Cotton Printed", slug: "cotton-printed", description: "Premium combed-cotton printed tees.", position: 1 },
    { name: "Acid Wash", slug: "acid-wash", description: "Hand-finished acid wash streetwear.", position: 2 },
    { name: "Oversized", slug: "oversized", description: "Drop-shoulder oversized silhouettes.", position: 3 },
    { name: "Hoodies", slug: "hoodies", description: "Heavyweight fleece hoodies for the cooler evenings.", position: 4 },
    { name: "Custom Design", slug: "custom-design", description: "Made-to-order custom prints.", position: 5 },
  ];
  const categoryMap: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, position: c.position, image: img(c.name) },
      create: { ...c, image: img(c.name) },
    });
    categoryMap[c.slug] = cat.id;
  }
  console.log(`  ✓ ${categories.length} categories`);

  // --- Products ---
  type Seed = {
    name: string;
    slug: string;
    category: string;
    price: number;
    discountPrice?: number;
    material: string;
    weightGrams: number;
    colors: string[];
    tags: string[];
    flags?: Partial<{ isFeatured: boolean; isNewArrival: boolean; isBestSeller: boolean }>;
  };

  const products: Seed[] = [
    {
      name: "ZERØ Origin Cotton Tee",
      slug: "zero-origin-cotton-tee",
      category: "cotton-printed",
      price: 4900,
      discountPrice: 3900,
      material: "240gsm Combed Cotton",
      weightGrams: 240,
      colors: ["Black", "Bone"],
      tags: ["cotton", "printed", "essential"],
      flags: { isFeatured: true, isNewArrival: true, isBestSeller: true },
    },
    {
      name: "Monochrome Statement Tee",
      slug: "monochrome-statement-tee",
      category: "cotton-printed",
      price: 5200,
      material: "240gsm Combed Cotton",
      weightGrams: 250,
      colors: ["Black", "White"],
      tags: ["cotton", "printed"],
      flags: { isNewArrival: true },
    },
    {
      name: "Faded Reverb Acid Wash",
      slug: "faded-reverb-acid-wash",
      category: "acid-wash",
      price: 6500,
      discountPrice: 5500,
      material: "260gsm Acid Washed Cotton",
      weightGrams: 280,
      colors: ["Washed Black", "Stone Grey"],
      tags: ["acid-wash", "premium"],
      flags: { isFeatured: true, isBestSeller: true },
    },
    {
      name: "Static Acid Wash Tee",
      slug: "static-acid-wash-tee",
      category: "acid-wash",
      price: 6900,
      material: "260gsm Acid Washed Cotton",
      weightGrams: 285,
      colors: ["Washed Charcoal", "Vintage White"],
      tags: ["acid-wash"],
      flags: { isNewArrival: true },
    },
    {
      name: "Brutalist Oversized Tee",
      slug: "brutalist-oversized-tee",
      category: "oversized",
      price: 6200,
      material: "280gsm Heavyweight Cotton",
      weightGrams: 320,
      colors: ["Black", "Bone"],
      tags: ["oversized", "heavyweight"],
      flags: { isFeatured: true, isBestSeller: true, isNewArrival: true },
    },
    {
      name: "Drop-Shoulder Heavyweight Tee",
      slug: "drop-shoulder-heavyweight-tee",
      category: "oversized",
      price: 6800,
      discountPrice: 5900,
      material: "300gsm Heavyweight Cotton",
      weightGrams: 340,
      colors: ["Washed Black", "Sand"],
      tags: ["oversized", "heavyweight"],
      flags: { isFeatured: true },
    },
    {
      name: "ZERØ Core Heavyweight Hoodie",
      slug: "zero-core-heavyweight-hoodie",
      category: "hoodies",
      price: 11900,
      discountPrice: 9900,
      material: "450gsm Brushed Fleece",
      weightGrams: 620,
      colors: ["Black", "Bone"],
      tags: ["hoodie", "heavyweight", "fleece"],
      flags: { isFeatured: true, isNewArrival: true, isBestSeller: true },
    },
    {
      name: "Acid Wash Pullover Hoodie",
      slug: "acid-wash-pullover-hoodie",
      category: "hoodies",
      price: 12900,
      material: "450gsm Acid Washed Fleece",
      weightGrams: 640,
      colors: ["Washed Black", "Stone Grey"],
      tags: ["hoodie", "acid-wash", "fleece"],
      flags: { isFeatured: true, isNewArrival: true },
    },
    {
      name: "Oversized Zip-Up Hoodie",
      slug: "oversized-zip-up-hoodie",
      category: "hoodies",
      price: 13500,
      discountPrice: 11500,
      material: "480gsm Heavyweight Fleece",
      weightGrams: 700,
      colors: ["Black", "Sand"],
      tags: ["hoodie", "oversized", "zip"],
      flags: { isBestSeller: true },
    },
  ];

  await prisma.product.deleteMany();
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: `${p.name} — engineered from ${p.material}. Premium streetwear by ZERØ Clothing, finished and shipped island-wide across Sri Lanka. Boxy modern fit with durable plastisol print.`,
        price: p.price,
        discountPrice: p.discountPrice ?? null,
        material: p.material,
        weightGrams: p.weightGrams,
        tags: p.tags,
        categoryId: categoryMap[p.category],
        isFeatured: p.flags?.isFeatured ?? false,
        isNewArrival: p.flags?.isNewArrival ?? false,
        isBestSeller: p.flags?.isBestSeller ?? false,
        images: {
          create: [
            { url: img(p.name), alt: `${p.name} front`, position: 0 },
            { url: img(`${p.name} Back`), alt: `${p.name} back`, position: 1 },
          ],
        },
        variants: {
          create: p.colors.flatMap((color) =>
            SIZES.map((size) => ({
              sku: `${p.slug.toUpperCase().replace(/-/g, "").slice(0, 8)}-${color.replace(/\s/g, "").slice(0, 3).toUpperCase()}-${size}`,
              size,
              color,
              stock: 25,
              lowStockAlert: 5,
            })),
          ),
        },
      },
    });
    console.log(`  ✓ product: ${created.name}`);
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
