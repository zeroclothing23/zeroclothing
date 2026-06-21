"use server";

import { prisma } from "@/server/db";
import { newsletterSchema } from "@/lib/validations/checkout";

export async function subscribeNewsletter(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const parsed = newsletterSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email." };
  }
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { isActive: true },
      create: { email: parsed.data.email },
    });
    return { ok: true, message: "You're in. Watch your inbox for drops." };
  } catch {
    return { ok: false, message: "Something went wrong. Try again." };
  }
}
