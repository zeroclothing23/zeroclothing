# Deployment Guide — ZERØ Clothing

Deploy to **Vercel** with a **Neon** Postgres database.

## 1. Database (Neon)

1. Create a project at [neon.tech](https://neon.tech).
2. Copy two connection strings:
   - **Pooled** (has `-pooler` in the host) → `DATABASE_URL`
   - **Direct** (no pooler) → `DIRECT_URL`
3. Append `?sslmode=require` to both. Add `&pgbouncer=true` to the pooled URL.

Run migrations + seed locally against Neon (or via a one-off):
```bash
npm run db:migrate
npm run db:seed
```

## 2. Push to GitHub

```bash
git add .
git commit -m "ZERØ Clothing — Phase 1"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 3. Vercel

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (auto-detected). Build command and output are default.
3. Add **Environment Variables** (Production + Preview) — see the table in the README:
   - `DATABASE_URL`, `DIRECT_URL`
   - `AUTH_SECRET` (`openssl rand -base64 32`), `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_APP_URL` = your Vercel/custom domain (e.g. `https://zeroclothing.lk`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER=94742357709`
   - PayHere, Cloudinary, Resend, Google keys when ready.
4. Deploy.

> `prisma generate` runs automatically via the `postinstall` script on Vercel.

## 4. Post-deploy configuration

### PayHere
- In the PayHere dashboard → **Domains & Credentials**, add your production domain.
- The IPN/notify URL is `https://<your-domain>/api/payhere/notify` (configured automatically from
  `NEXT_PUBLIC_APP_URL`). PayHere needs a public HTTPS URL — this only works on the deployed site,
  not localhost.
- Start in `PAYHERE_MODE=sandbox`, test with sandbox cards, then switch to `live`.

### Google OAuth
- In Google Cloud Console → Credentials → OAuth client, add the redirect URI:
  `https://<your-domain>/api/auth/callback/google`

### Cloudinary
- Create an **unsigned upload preset** and set `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

### Resend
- Verify your sending domain and set `EMAIL_FROM` to an address on it.

## 5. Smoke test (production)

1. Visit the homepage — products load, images render.
2. Register an account → verify email link → sign in.
3. Add to cart → checkout → pay with a PayHere **sandbox** card.
4. Confirm the order appears under `/orders` and in `/admin/orders` with status `PAID`.
5. Update the order status in admin → customer receives the status email.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| `P1001 can't reach database` | Check `DATABASE_URL`/`DIRECT_URL` and `sslmode=require`. |
| Payments never confirm | Verify PayHere domain + `PAYHERE_MERCHANT_SECRET`; check `/api/payhere/notify` logs. |
| Images 404 | Add the host to `images.remotePatterns` in `next.config.ts`. |
| Emails not sending | Set `RESEND_API_KEY` + verified `EMAIL_FROM` (dev logs to console). |
