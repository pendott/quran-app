# Quran Class SaaS

Online Quran class booking and payments for Malaysian families — admin, teacher, and parent/student dashboards.

## Local development

```bash
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET (min 32 chars)

npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo logins are created by the seed (see `prisma/seed.ts`).

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@demo.local   | demo12345  |
| Parent | parent@demo.local  | demo12345  |
| Teacher| teacher@demo.local | demo12345 |

## Pilot go-live (Vercel + Postgres)

### 1. Deploy

1. Create a **Vercel** project from this repo and a **Postgres** database (Vercel Postgres, Neon, or Supabase).
2. Set environment variables in Vercel (Production):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | `https://your-app.vercel.app` |
| `PAYMENT_PROVIDER` | `billplz` for pilot; `mock` for demo-only |
| `BILLPLZ_API_KEY` | From Billplz dashboard |
| `BILLPLZ_COLLECTION_ID` | Collection for class payments |
| `BILLPLZ_X_SIGNATURE` | Callback signing key (Billplz → Settings) |
| `CRON_SECRET` | Random secret for `/api/cron/reminders` |
| `RESEND_API_KEY` | Optional; without it reminders are marked sent (stub) |

3. Deploy, then run schema sync once against production:

```bash
DATABASE_URL="..." npx prisma db push
DATABASE_URL="..." npm run db:seed   # optional pilot demo data
```

### 2. Billplz

1. Create a **sandbox** collection and API key.
2. Set callback URL to: `https://your-app.vercel.app/api/webhooks/payment/notify`
3. Set `PAYMENT_PROVIDER=billplz` and all `BILLPLZ_*` vars.
4. Do **not** enable trust-only callback mode in production; `BILLPLZ_X_SIGNATURE` is required.

Parents pay for **packages** on `/students/payments` and **per-session bookings** on `/students/bookings` (when no package credit). Successful payments redirect with `?paid=1`.

### 3. Cron reminders

`vercel.json` schedules `GET /api/cron/reminders` every 15 minutes. Vercel sends `Authorization: Bearer <CRON_SECRET>` when `CRON_SECRET` is set.

Manual test:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app.vercel.app/api/cron/reminders
```

### 4. Onboarding families (no public signup)

1. Sign in as **admin** → **Students**.
2. **Create parent + student** (email + temporary password), or **Generate invite link** (7-day token at `/invite/[token]`).
3. Parent books at `/students/bookings` or buys packages at `/students/payments`.

### 5. Admin operations

- **Bookings** (`/admin/bookings`): filter by status, cancel reservations.
- **Payments** (`/admin/payments`): filter pending, mark bank transfers paid (runs same finalize logic as webhook).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npm run db:push` | Sync Prisma schema to DB |
| `npm run db:seed` | Demo data |

## Payments architecture

- **Mock** (`PAYMENT_PROVIDER=mock`): multi-step checkout at `/checkout/mock/[paymentId]`.
- **Billplz** (`PAYMENT_PROVIDER=billplz`): redirect to FPX; webhook at `/api/webhooks/payment/notify` verifies `x-signature` and calls `completePendingPayment` (package purchase or session booking).
