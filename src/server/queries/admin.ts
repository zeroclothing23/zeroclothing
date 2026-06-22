import { prisma } from "@/server/db";

export async function getDashboardStats() {
  const [orderCount, paidAgg, customerCount, productCount, pendingCount, lowStock, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ["PAID", "PROCESSING", "PRINTING", "PACKED", "SHIPPED", "DELIVERED"] } },
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.product.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        include: { product: { select: { name: true } } },
        orderBy: { stock: "asc" },
        take: 8,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          orderNumber: true,
          fullName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  return {
    orderCount,
    revenue: Number(paidAgg._sum.total ?? 0),
    customerCount,
    productCount,
    pendingCount,
    lowStock: lowStock.map((v) => ({
      id: v.id,
      product: v.product.name,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
    })),
    recentOrders: recentOrders.map((o) => ({
      ...o,
      total: Number(o.total),
    })),
  };
}

export async function listOrders(status?: string) {
  const orders = await prisma.order.findMany({
    where: status && status !== "ALL" ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      fullName: true,
      email: true,
      total: true,
      status: true,
      createdAt: true,
      district: true,
    },
  });
  return orders.map((o) => ({ ...o, total: Number(o.total) }));
}

export async function getAdminOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, payment: true, shipment: true },
  });
  if (!order) return null;
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shippingFee: Number(order.shippingFee),
    total: Number(order.total),
    items: order.items.map((i) => ({ ...i, unitPrice: Number(i.unitPrice) })),
    payment: order.payment ? { ...order.payment, amount: Number(order.payment.amount) } : null,
  };
}

export async function listAdminProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      images: { take: 1, orderBy: { position: "asc" } },
      variants: { select: { stock: true } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    category: p.category.name,
    image: p.images[0]?.url ?? null,
    isActive: p.isActive,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
  }));
}

export async function listShippingRates() {
  const rates = await prisma.shippingRate.findMany({ orderBy: { position: "asc" } });
  return rates.map((r) => ({ ...r, price: Number(r.price) }));
}

export async function listCustomRequests() {
  return prisma.customRequest.findMany({ orderBy: { createdAt: "desc" } });
}

const PAID_STATUSES = ["PAID", "PROCESSING", "PRINTING", "PACKED", "SHIPPED", "DELIVERED"] as const;

/** Revenue + order count per day for the last `days` days (oldest → newest). */
export async function getRevenueByDay(days = 14) {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: since }, status: { in: PAID_STATUSES as never } },
    select: { total: true, createdAt: true },
  });

  // Bucket by yyyy-mm-dd
  const buckets = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (b) {
      b.revenue += Number(o.total);
      b.orders += 1;
    }
  }

  return [...buckets.entries()].map(([date, v]) => ({ date, ...v }));
}

export async function getProductForEdit(id: string) {
  const p = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    weightGrams: p.weightGrams,
    material: p.material,
    tags: p.tags,
    categoryId: p.categoryId,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    images: p.images.map((i) => i.url),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
      lowStockAlert: v.lowStockAlert,
    })),
  };
}

export async function listCustomers() {
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    verified: !!u.emailVerified,
    createdAt: u.createdAt,
    orderCount: u._count.orders,
  }));
}
