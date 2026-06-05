<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

**jomngaji.my** (`quran-class-saas`) is a single Next.js 16 monolith (App Router) with Prisma + PostgreSQL. See `README.md` for full setup; this section covers non-obvious Cloud Agent caveats.

### Services

| Service | How to start | Notes |
|---------|--------------|-------|
| PostgreSQL 16 | `sudo dockerd &` then `sudo docker compose up -d postgres` | Docker is not pre-started in the VM. Wait for the healthcheck before `db:push`. |
| Next.js dev | `npm run dev` (port 3000) | Copy `.env.example` → `.env` if missing. |
| DB schema + seed | `npm run db:push` then `npm run db:seed` | Seed is required for login; re-run to reset demo data. |

Optional: full Docker stack via `./scripts/docker-reset.sh` (builds web image + seeds). For local npm dev, only the `postgres` service from Compose is needed.

### Standard commands

| Task | Command |
|------|---------|
| Lint | `npm run lint` |
| Typecheck | `npm run typecheck` |
| Unit tests | `npm test` |
| Production build | `npm run build` |

### Demo login

After seeding, sign in at `/login`:

- Email: `admin@demo.local`
- Password: `DevPass123!`

Other roles: `teacher@demo.local`, `parent@demo.local`, `student@demo.local` (same password).

### Gotchas

- **`AUTH_URL`** must match the exact browser URL (including hostname/IP). Defaults in `.env.example` work for `http://localhost:3000`.
- **Docker `web` container** uses `@postgres:5432` in `DATABASE_URL`; local `npm run dev` uses `@localhost:5432` from `.env`.
- **Billplz, Resend, Zoom** are optional; `PAYMENT_PROVIDER=mock` is the local default.
- Read Next.js 16 docs in `node_modules/next/dist/docs/` before changing framework code (APIs differ from Next.js 14/15).
