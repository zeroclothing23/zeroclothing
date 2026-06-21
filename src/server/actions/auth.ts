"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { sendEmail } from "@/server/services/email";
import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { BRAND } from "@/lib/constants";

type ActionResult = { ok: boolean; message: string };

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function token() {
  return crypto.randomBytes(32).toString("hex");
}

function emailShell(title: string, body: string, cta?: { label: string; href: string }) {
  return `
  <div style="background:#0a0a0a;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5">
    <div style="max-width:520px;margin:0 auto;background:#111;border:1px solid #242424;border-radius:12px;padding:32px">
      <h1 style="font-size:22px;letter-spacing:2px;margin:0 0 8px">ZER<span style="color:#c9a86a">Ø</span></h1>
      <h2 style="font-size:18px;margin:16px 0 8px">${title}</h2>
      <div style="font-size:14px;line-height:1.6;color:#cfcfcf">${body}</div>
      ${
        cta
          ? `<a href="${cta.href}" style="display:inline-block;margin-top:20px;background:#c9a86a;color:#0a0a0a;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:bold">${cta.label}</a>`
          : ""
      }
      <p style="margin-top:24px;font-size:12px;color:#777">${BRAND.name} · Premium Streetwear · Sri Lanka</p>
    </div>
  </div>`;
}

export async function registerUser(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid details." };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  // Email verification token
  const verifyToken = token();
  await prisma.verificationRequest.create({
    data: {
      email,
      token: verifyToken,
      type: "EMAIL_VERIFY",
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verifyUrl = `${appUrl()}/verify?token=${verifyToken}`;
  await sendEmail({
    to: email,
    subject: `Welcome to ${BRAND.name} — verify your email`,
    html: emailShell(
      `Welcome, ${name}`,
      "Your account is ready. Verify your email to secure your account and start shopping.",
      { label: "Verify Email", href: verifyUrl },
    ),
  });

  return { ok: true, message: "Account created. Check your email to verify." };
}

export async function verifyEmail(rawToken: string): Promise<ActionResult> {
  const req = await prisma.verificationRequest.findUnique({ where: { token: rawToken } });
  if (!req || req.type !== "EMAIL_VERIFY" || req.expires < new Date()) {
    return { ok: false, message: "This verification link is invalid or expired." };
  }
  await prisma.user.update({
    where: { email: req.email },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationRequest.delete({ where: { token: rawToken } });
  return { ok: true, message: "Email verified. You can now sign in." };
}

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { ok: false, message: "Enter a valid email." };

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid leaking which emails exist.
  if (user) {
    const resetToken = token();
    await prisma.verificationRequest.create({
      data: {
        email,
        token: resetToken,
        type: "PASSWORD_RESET",
        expires: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
    const resetUrl = `${appUrl()}/reset-password?token=${resetToken}`;
    await sendEmail({
      to: email,
      subject: `${BRAND.name} — reset your password`,
      html: emailShell(
        "Reset your password",
        "We received a request to reset your password. This link expires in 1 hour. If you didn't request this, ignore this email.",
        { label: "Reset Password", href: resetUrl },
      ),
    });
  }

  return { ok: true, message: "If that email exists, a reset link is on its way." };
}

export async function resetPassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const req = await prisma.verificationRequest.findUnique({
    where: { token: parsed.data.token },
  });
  if (!req || req.type !== "PASSWORD_RESET" || req.expires < new Date()) {
    return { ok: false, message: "This reset link is invalid or expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({ where: { email: req.email }, data: { passwordHash } });
  await prisma.verificationRequest.delete({ where: { token: parsed.data.token } });

  return { ok: true, message: "Password updated. You can now sign in." };
}
