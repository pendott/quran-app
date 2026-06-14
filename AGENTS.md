<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

**Product:** jomngaji.my — a Next.js 16 Quran class booking SaaS (single app, not a monorepo). See `README.md` for full docs.

### Required services

| Service | How to start | Port |
|---------|--------------|------|
| PostgreSQL 16 | `sudo docker compose up -d postgres` | 5432 |
| Next.js dev server | `npm run dev` | 3000 |

PostgreSQL is required for all auth and dashboard flows. The app will not work without it.

### First-time / fresh database

```bash
cp .env.example .env   # if missing
npm run db:push
npm run db:seed
```

Re-run `npm run db:seed` to reset demo data. Demo logins are in `README.md` (password: `DevPass123!`).

### Docker daemon

If `docker compose` fails with "Cannot connect to the Docker daemon", start Docker first:

```bash
sudo dockerd --storage-driver=vfs >/tmp/dockerd.log 2>&1 &
```

Cloud VMs may need `sudo` for Docker commands.

### Standard commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm run lint` | ESLint (2 existing warnings in admin/teacher forms) |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest unit tests (4 files, no E2E in repo) |
| `npm run build` | Production build |

### Auth gotcha

`AUTH_URL` in `.env` must match the exact URL in the browser (e.g. `http://localhost:3000`). Mismatch causes login without dashboard redirect.

### Optional integrations (not needed for local dev)

- **Payments:** defaults to `PAYMENT_PROVIDER=mock`
- **Email:** Resend stubbed without `RESEND_API_KEY`
- **Zoom:** manual/stub meeting URLs without Zoom OAuth creds
