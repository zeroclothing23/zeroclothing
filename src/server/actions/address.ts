"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db";
import { auth } from "@/auth";
import { addressSchema } from "@/lib/validations/address";

type Result = { ok: boolean; message: string };

export async function saveAddress(input: unknown): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in." };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid address." };
  }
  const d = parsed.data;
  const userId = session.user.id;

  // If this is the user's first address, make it default automatically.
  const count = await prisma.address.count({ where: { userId } });
  const makeDefault = d.isDefault || count === 0;

  await prisma.$transaction(async (tx) => {
    if (makeDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    await tx.address.create({
      data: {
        userId,
        label: d.label || null,
        fullName: d.fullName,
        phone: d.phone,
        province: d.province,
        district: d.district,
        addressLine: d.addressLine,
        postalCode: d.postalCode,
        isDefault: makeDefault,
      },
    });
  });

  revalidatePath("/account");
  return { ok: true, message: "Address saved." };
}

export async function deleteAddress(id: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in." };
  await prisma.address.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/account");
  return { ok: true, message: "Address removed." };
}

export async function setDefaultAddress(id: string): Promise<Result> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, message: "Please sign in." };
  const userId = session.user.id;
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id, userId }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account");
  return { ok: true, message: "Default address updated." };
}
