#!/usr/bin/env sh
# Reset Postgres volume, sync schema, seed demo users, rebuild and start web.
set -e
cd "$(dirname "$0")/.."

echo "==> Stopping containers and removing database volume..."
docker compose down -v

echo "==> Starting Postgres..."
docker compose up -d postgres

echo "==> Waiting for Postgres to be healthy..."
until docker compose exec -T postgres pg_isready -U quran -d quran_class_saas >/dev/null 2>&1; do
  sleep 1
done

echo "==> Pushing schema and seeding demo users (password: DevPass123!)..."
docker compose --profile setup run --rm db-setup

echo "==> Verifying admin user exists..."
docker compose exec -T postgres psql -U quran -d quran_class_saas -c \
  'SELECT email, role, status, ("passwordHash" IS NOT NULL) AS has_password FROM "User" ORDER BY email;'

echo "==> Building and starting web..."
docker compose up -d --build

echo ""
echo "Done. Open http://localhost:3000/login"
echo "  Email:    admin@demo.local"
echo "  Password: DevPass123!"
echo ""
echo "If login still fails, run: docker compose logs web --tail 50"
