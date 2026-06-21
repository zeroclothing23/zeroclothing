import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Require an authenticated user; redirect to login otherwise. Returns the session. */
export async function requireUser(callbackUrl = "/account") {
  const session = await auth();
  if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session;
}

/** Require an ADMIN user; redirect away otherwise. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}
