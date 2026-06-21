import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware using the trimmed auth config (no Prisma/bcrypt).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect account + admin areas; skip static assets and api/auth.
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
  ],
};
