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
