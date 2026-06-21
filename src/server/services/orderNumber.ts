import { Prisma, PrismaClient } from "@prisma/client";

/**
 * Generate the next sequential order number in the form ZERO-YYYY-000001.
 * Uses the count of existing orders for the current year inside a transaction
 * to keep numbering monotonic. Call within an interactive transaction so the
 * count + insert are atomic and concurrent checkouts cannot collide.
 */
export async function generateOrderNumber(
  tx: Prisma.TransactionClient | PrismaClient,
  year: number,
): Promise<string> {
  const prefix = `ZERO-${year}-`;

  const last = await tx.order.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let next = 1;
  if (last) {
    const seq = parseInt(last.orderNumber.slice(prefix.length), 10);
    if (!Number.isNaN(seq)) next = seq + 1;
  }

  return `${prefix}${String(next).padStart(6, "0")}`;
}
