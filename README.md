# ZERØ Clothing — Premium Streetwear E-Commerce

A production-grade, mobile-first e-commerce platform for **ZERØ Clothing**, a premium streetwear
brand serving Sri Lanka. Built with Next.js 15, TypeScript, Prisma + PostgreSQL, NextAuth, PayHere
payments, Cloudinary and Resend.

> **Design language:** dark luxury streetwear — `#0A0A0A` base, gold `#C9A86A` accent,
> Bodoni Moda (display) + Jost (body).

---

## ✨ Features (Phase 1)

- **Storefront** — animated hero, new arrivals, featured, best sellers, collection banners, reviews,
  Instagram grid, newsletter.
- **Catalog** — categories, products with size×color variants, gallery, discount pricing, stock.
- **Shop** — category filter chips + sorting.
- **Product page** — gallery, variant selection, sticky mobile add-to-cart, JSON-LD schema.
- **Cart** — persisted guest + user cart (drawer + full page), quantity controls.
- **Checkout** — Sri Lanka address form (province → district), Zod validation, weight-based shipping,
  coupons, **PayHere** card payment, unique order numbers (`ZERO-2026-000001`).
- **Auth** — email/password (bcrypt) + Google OAuth, email verification, password reset.
- **Account** — profile, order history; wishlist scaffold.
- **Custom design** — request form with optional Cloudinary uploads + email notifications.
- **Admin** — dashboard, orders + status workflow, products (create/list), shipping rates, coupons,
  low-stock alerts.
- **Emails** — order confirmation, status updates, auth flows (via Resend; logs in dev without a key).
- **SEO** — dynamic metadata, OpenGraph, JSON-LD, sitemap, robots.
- **Mobile-first** — bottom navigation, floating WhatsApp button, responsive at 375/768/1024/1440.

---

## 🧱 Tech Stack

| Layer | Tech |
|------|------|
| Framework | Next.js 15 (App Router) · TypeScript |
| Styling | Tailwind CSS v4 · shadcn-style UI · Framer Motion |
| Forms | React Hook Form · Zod |
| DB / ORM | PostgreSQL (Neon) · Prisma |
| Auth | NextAuth v5 (Auth.js) |
| Payments | PayHere (Sri Lanka) |
| Storage | Cloudinary |
| Email | Resend |
| Deploy | Vercel |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 20+ and npm
- A PostgreSQL database — [Neon](https://neon.tech) recommended (free tier)

### 2. Install
```bash
npm install
```

### 3. Configure environment
Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```
At minimum you need `DATABASE_URL`, `DIRECT_URL`, and `AUTH_SECRET`
(`openssl rand -base64 32`). See **Environment variables** below.

### 4. Database
```bash
npm run db:migrate      # create tables (uses DIRECT_URL)
npm run db:seed         # seed categories, products, shipping, settings, admin
```

### 5. Run
```bash
npm run dev             # http://localhost:3000
```

Admin login: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` → visit `/admin`.

---

## 🔑 Environment variables

| Var | Required | Notes |
|-----|----------|-------|
| `DATABASE_URL` | ✅ | Pooled Neon connection (app runtime) |
| `DIRECT_URL` | ✅ | Direct Neon connection (Prisma migrate) |
| `AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | ✅ | e.g. `https://zeroclothing.lk` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✅ | SL intl format, e.g. `94742357709` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Google sign-in |
| `PAYHERE_MERCHANT_ID` / `PAYHERE_MERCHANT_SECRET` | for payments | from PayHere dashboard |
| `PAYHERE_MODE` | optional | `sandbox` (default) or `live` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | for uploads | |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | for uploads | unsigned preset |
| `RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_EMAIL` | for email | logs to console without a key |

> The app runs end-to-end in dev with only the database + `AUTH_SECRET`. Payments fall back to a
> WhatsApp-assisted flow until PayHere keys are set; email logs to the console until Resend is set.

---

## 💳 PayHere

1. Create a merchant account at [payhere.lk](https://www.payhere.lk) (sandbox at
   [sandbox.payhere.lk](https://sandbox.payhere.lk)).
2. Add your domain and copy the **Merchant ID** and **Merchant Secret** into `.env`.
3. PayHere posts payment results to `POST /api/payhere/notify`, where the md5 signature is verified
   and the order is marked paid + stock decremented + confirmation email sent.

**Local testing:** PayHere can't reach `localhost`, so to exercise the post-payment flow locally use
the dev-only endpoint:
```bash
curl -X POST "http://localhost:3000/api/dev/mark-paid?order=ZERO-2026-000001"
```
(Disabled automatically in production.)

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |

---

## 🗂️ Project structure

```
src/
  app/
    (storefront)/   home, shop, product, cart, checkout, account, content pages
    (auth)/         login, register, verify, reset
    admin/          dashboard, orders, products, shipping, coupons
    api/            auth, payhere/notify, dev/mark-paid
  components/        ui (shadcn-style), layout, home, product, admin, auth, custom
  server/
    actions/        server actions (checkout, auth, admin, custom-design, newsletter)
    services/       shipping, orderNumber, payhere email, notifications, settings
    queries/        catalog, admin, account
  lib/              auth config, payhere, cloudinary, validations, store, utils
prisma/             schema.prisma, seed.ts
```

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the Vercel deployment guide.

---

## 🛣️ Roadmap

- **Phase 2** — wishlist actions, saved addresses, Cloudinary product uploads in admin.
- **Phase 3** — full email template suite, customers/inventory admin, analytics & sales reports.
- **Phase 4** — performance pass (Lighthouse 90+/95+), security hardening, live Instagram feed.
