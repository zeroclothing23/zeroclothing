"use server";

import { prisma } from "@/server/db";
import { auth } from "@/auth";
import { customDesignSchema } from "@/lib/validations/checkout";
import { sendEmail, adminEmail } from "@/server/services/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { BRAND } from "@/lib/constants";

type Result = { ok: boolean; message: string };

export async function submitCustomDesign(input: unknown): Promise<Result> {
  const rl = rateLimit(`custom:${await clientIp()}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) return { ok: false, message: "Too many requests. Please try again shortly." };

  const parsed = customDesignSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const session = await auth();
  const d = parsed.data;

  const request = await prisma.customRequest.create({
    data: {
      userId: session?.user?.id ?? null,
      fullName: d.fullName,
      email: d.email,
      phone: d.phone,
      shirtType: d.shirtType,
      color: d.color,
      size: d.size,
      description: d.description,
      fileUrls: d.fileUrls,
    },
  });

  const files = d.fileUrls.length
    ? `<p style="font-size:13px;color:#999">Attachments: ${d.fileUrls
        .map((u) => `<a href="${u}" style="color:#c9a86a">file</a>`)
        .join(", ")}</p>`
    : "";

  // Notify admin
  await sendEmail({
    to: adminEmail,
    subject: `New custom design request — ${d.fullName}`,
    html: `<div style="font-family:Arial;padding:24px;background:#0a0a0a;color:#f5f5f5">
      <h2>New Custom Design Request</h2>
      <p><b>${d.fullName}</b> · ${d.email} · ${d.phone}</p>
      <p>Shirt: ${d.shirtType} · Color: ${d.color} · Size: ${d.size}</p>
      <p>${d.description}</p>
      ${files}
      <p style="color:#777">Request ID: ${request.id}</p>
    </div>`,
  });

  // Confirm to customer
  await sendEmail({
    to: d.email,
    subject: `We received your custom design — ${BRAND.name}`,
    html: `<div style="font-family:Arial;padding:24px;background:#0a0a0a;color:#f5f5f5">
      <h2>Thanks, ${d.fullName.split(" ")[0]}!</h2>
      <p>We've received your custom design request and our team will reach out shortly with a quote.</p>
      <p>Need to add details? WhatsApp us at +${BRAND.whatsapp}.</p>
    </div>`,
  });

  return { ok: true, message: "Request submitted! We'll be in touch soon." };
}
