import { Resend } from "resend";
import { BRAND } from "@/lib/constants";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? `${BRAND.name} <onboarding@resend.dev>`;

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Thin wrapper around Resend. In dev (no RESEND_API_KEY) it logs instead of
 * sending so the app remains fully functional without email credentials.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs) {
  if (!resend) {
    console.info(`[email:dev] → ${Array.isArray(to) ? to.join(", ") : to} :: ${subject}`);
    return { id: "dev-noop", skipped: true as const };
  }
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject,
    html,
    replyTo,
  });
  if (error) {
    console.error("[email] send failed:", error);
    throw new Error(error.message);
  }
  return { id: data?.id, skipped: false as const };
}

export const adminEmail = process.env.ADMIN_EMAIL ?? "admin@zeroclothing.lk";
