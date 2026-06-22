"use server";

import { revalidatePath } from "next/cache";
import { Prisma, Size } from "@prisma/client";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/lib/auth-guard";
import { sendOrderStatusUpdate } from "@/server/services/notifications";
import { slugify } from "@/lib/utils";
import { SIZES } from "@/lib/constants";

type Result = { ok: boolean; message: string };

const ALLOWED_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "PRINTING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export async function updateOrderStatus(orderId: string, status: string): Promise<Result> {
  await requireAdmin();
  if (!ALLOWED_STATUSES.includes(status as never)) {
    return { ok: false, message: "Invalid status." };
  }

  await prisma.order.update({ where: { id: orderId }, data: { status: status as never } });

  // Maintain a shipment record + timestamps for shipped/delivered
  if (status === "SHIPPED" || status === "DELIVERED") {
    await prisma.shipment.upsert({
      where: { orderId },
      create: {
        orderId,
        ...(status === "SHIPPED" ? { shippedAt: new Date() } : { deliveredAt: new Date() }),
      },
      update: status === "SHIPPED" ? { shippedAt: new Date() } : { deliveredAt: new Date() },
    });
  }

  sendOrderStatusUpdate(orderId, status).catch((e) => console.error("[admin] status email", e));
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return { ok: true, message: `Order marked ${status}.` };
}

export async function updateShipmentTracking(
  orderId: string,
  trackingNumber: string,
): Promise<Result> {
  await requireAdmin();
  await prisma.shipment.upsert({
    where: { orderId },
    create: { orderId, trackingNumber },
    update: { trackingNumber },
  });
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: "Tracking number saved." };
}

// Plain <form action> handlers must resolve to void.
export async function saveShippingRate(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    label: String(formData.get("label") ?? ""),
    minWeight: Number(formData.get("minWeight") ?? 0),
    maxWeight: formData.get("maxWeight") ? Number(formData.get("maxWeight")) : null,
    price: new Prisma.Decimal(Number(formData.get("price") ?? 0)),
    position: Number(formData.get("position") ?? 0),
    isActive: formData.get("isActive") === "on",
  };
  if (id) {
    await prisma.shippingRate.update({ where: { id }, data });
  } else {
    await prisma.shippingRate.create({ data });
  }
  revalidatePath("/admin/shipping");
}

export async function deleteShippingRate(id: string): Promise<void> {
  await requireAdmin();
  await prisma.shippingRate.delete({ where: { id } });
  revalidatePath("/admin/shipping");
}

/**
 * Create or update a product. On create, generates variants from the selected
 * sizes × colors. Images are provided as newline-separated URLs.
 */
export async function saveProduct(formData: FormData): Promise<Result> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "");
  if (!name || !categoryId) return { ok: false, message: "Name and category are required." };

  const price = Number(formData.get("price") ?? 0);
  const discountRaw = formData.get("discountPrice");
  const discountPrice = discountRaw && Number(discountRaw) > 0 ? new Prisma.Decimal(Number(discountRaw)) : null;
  const weightGrams = Number(formData.get("weightGrams") ?? 250);
  const material = String(formData.get("material") ?? "") || null;
  const description = String(formData.get("description") ?? "");
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const flags = {
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isNewArrival: formData.get("isNewArrival") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
  };

  const imageUrls = String(formData.get("images") ?? "")
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean);

  const base = {
    name,
    description,
    price: new Prisma.Decimal(price),
    discountPrice,
    weightGrams,
    material,
    tags,
    categoryId,
    ...flags,
  };

  if (id) {
    await prisma.product.update({ where: { id }, data: base });
    if (imageUrls.length) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: imageUrls.map((url, i) => ({ productId: id, url, position: i })),
      });
    }
    revalidatePath("/admin/products");
    return { ok: true, message: "Product updated." };
  }

  // Create with generated variants
  const colors = String(formData.get("colors") ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const sizes = (formData.getAll("sizes") as string[]).filter((s) =>
    SIZES.includes(s as never),
  ) as Size[];

  if (colors.length === 0 || sizes.length === 0) {
    return { ok: false, message: "Add at least one color and size." };
  }

  const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 6)}`;
  await prisma.product.create({
    data: {
      ...base,
      slug,
      images: {
        create: imageUrls.length
          ? imageUrls.map((url, i) => ({ url, position: i }))
          : [{ url: `https://placehold.co/800x1000/0a0a0a/c9a86a/png?text=${encodeURIComponent(name)}`, position: 0 }],
      },
      variants: {
        create: colors.flatMap((color) =>
          sizes.map((size) => ({
            sku: `${slugify(name).toUpperCase().replace(/-/g, "").slice(0, 8)}-${color.replace(/\s/g, "").slice(0, 3).toUpperCase()}-${size}`,
            size,
            color,
            stock: 20,
            lowStockAlert: 5,
          })),
        ),
      },
    },
  });
  revalidatePath("/admin/products");
  return { ok: true, message: "Product created." };
}

export async function setProductActive(id: string, isActive: boolean): Promise<Result> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/products");
  return { ok: true, message: isActive ? "Product published." : "Product hidden." };
}

export async function updateVariantStock(variantId: string, stock: number): Promise<Result> {
  await requireAdmin();
  await prisma.productVariant.update({ where: { id: variantId }, data: { stock: Math.max(0, stock) } });
  return { ok: true, message: "Stock updated." };
}

const CUSTOM_STATUSES = [
  "NEW",
  "REVIEWING",
  "QUOTED",
  "ACCEPTED",
  "REJECTED",
  "COMPLETED",
] as const;

export async function updateCustomRequestStatus(id: string, status: string): Promise<Result> {
  await requireAdmin();
  if (!CUSTOM_STATUSES.includes(status as never)) {
    return { ok: false, message: "Invalid status." };
  }
  await prisma.customRequest.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/admin/custom-requests");
  return { ok: true, message: `Request marked ${status}.` };
}

export async function saveSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const entries: Record<string, string> = {
    social_instagram: String(formData.get("social_instagram") ?? ""),
    social_tiktok: String(formData.get("social_tiktok") ?? ""),
    social_facebook: String(formData.get("social_facebook") ?? ""),
    social_youtube: String(formData.get("social_youtube") ?? ""),
    support_whatsapp: String(formData.get("support_whatsapp") ?? ""),
    free_shipping_threshold: String(formData.get("free_shipping_threshold") ?? "0"),
  };
  await prisma.$transaction(
    Object.entries(entries).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
    ),
  );
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function saveCoupon(formData: FormData): Promise<void> {
  await requireAdmin();
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return;
  const type = String(formData.get("type") ?? "PERCENT") as "PERCENT" | "FIXED";
  const value = Number(formData.get("value") ?? 0);

  await prisma.coupon.upsert({
    where: { code },
    create: {
      code,
      type,
      value: new Prisma.Decimal(value),
      minSubtotal: formData.get("minSubtotal") ? new Prisma.Decimal(Number(formData.get("minSubtotal"))) : null,
      maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
      isActive: true,
    },
    update: {
      type,
      value: new Prisma.Decimal(value),
      minSubtotal: formData.get("minSubtotal") ? new Prisma.Decimal(Number(formData.get("minSubtotal"))) : null,
      maxUses: formData.get("maxUses") ? Number(formData.get("maxUses")) : null,
    },
  });
  revalidatePath("/admin/coupons");
}
