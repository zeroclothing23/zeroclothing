import { prisma } from "@/server/db";

export async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true, name: true, quantity: true } } },
  });
  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    createdAt: o.createdAt,
    itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
    items: o.items,
  }));
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      createdAt: true,
      addresses: { orderBy: { isDefault: "desc" } },
    },
  });
}
