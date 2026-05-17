# Quran Class SaaS

Online Quran class booking and payments for Malaysian families — admin, teacher, and parent/student dashboards.

## Local development

```bash
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET (min 32 chars, e.g. openssl rand -base64 32)

npm install
npm run db:push
npm run db:seed
npm run dev
```

## Docker

`docker compose build` / `up` does **not** create demo users. You must **seed** the database once.

### Quick reset (recommended if login fails)

From the project folder:

```bash
chmod +x scripts/docker-reset.sh
./scripts/docker-reset.sh
```

Then open [http://localhost:3000/login](http://localhost:3000/login):

| Field | Value |
|-------|--------|
| Email | `admin@demo.local` |
| Password | `DevPass123!` |

(Copy/paste the password — capital **D** and **P**, `123`, exclamation `!`.)

### Manual steps

```bash
docker compose up -d postgres
docker compose --profile setup run --rm db-setup   # creates users
docker compose up -d --build
```

Optional: `cp .env.example .env` to override `AUTH_SECRET` (Compose sets a dev default if `.env` is missing).

### Troubleshooting login

**1. Confirm demo users exist**

```bash
docker compose exec postgres psql -U quran -d quran_class_saas -c \
  'SELECT email, role, ("passwordHash" IS NOT NULL) AS has_password FROM "User";'
```

You should see four rows (`admin@demo.local`, etc.) with `has_password = t`. If the table is empty, run `docker compose --profile setup run --rm db-setup` again.

**2. Confirm the app uses the Compose database**

```bash
docker compose exec web printenv DATABASE_URL
```

Must contain `@postgres:5432`, **not** `@localhost:5432`. If it shows `localhost`, recreate the web container: `docker compose up -d --force-recreate web`.

**3. Check web logs while signing in**

```bash
docker compose logs web --tail 30
```

**4. Login works but no dashboard (blank or homepage)**

Docker serves HTTP with `NODE_ENV=production`. Set `AUTH_URL` in `.env` to the **exact URL in your browser** (not only `localhost` if you use an IP or hostname):

```bash
# Example: you open http://192.168.1.10:3000
AUTH_URL=http://192.168.1.10:3000
AUTH_SECRET=dev-secret-at-least-32-characters-long

docker compose up -d --build --force-recreate web
```

Then sign in again — you should land on `/admin`, `/teacher`, or `/students` with the sidebar visible.

**5. Nuclear reset** (wipes all DB data)

```bash
./scripts/docker-reset.sh
```

Open [http://localhost:3000](http://localhost:3000). Demo logins are written to the database when you run `npm run db:seed` (see `prisma/seed.ts`). Passwords are stored as bcrypt hashes in `User.passwordHash`, not in plain text.

| Role    | Email               | Password      |
|---------|---------------------|---------------|
| Admin   | admin@demo.local    | DevPass123!   |
| Teacher | teacher@demo.local  | DevPass123!   |
| Parent  | parent@demo.local   | DevPass123!   |
| Student | student@demo.local  | DevPass123!   |

Sign in at `/login` with the email and password above. Re-run `npm run db:seed` to reset demo data (this wipes and recreates seed rows).

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
