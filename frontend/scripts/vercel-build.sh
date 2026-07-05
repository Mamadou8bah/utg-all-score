#!/bin/sh
set -e

# Neon/Vercel: migrations need a direct URL. Fall back to DATABASE_URL if unset.
if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi

npx prisma generate

# Clear a failed duplicate migration from an earlier deploy (safe no-op if absent).
echo "Checking for failed migration recovery..."
npx prisma migrate resolve --rolled-back "20260705160000_competition_agents" || true

echo "Applying database migrations..."
if ! npx prisma migrate deploy; then
  echo "Migration deploy failed — retrying after recovery..."
  npx prisma migrate resolve --rolled-back "20260705160000_competition_agents" || true
  npx prisma migrate deploy
fi

echo "Ensuring default admin account..."
npx tsx prisma/seed-admin.ts

echo "Building Next.js app..."
npx next build
