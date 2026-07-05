#!/bin/sh
set -e

# Neon/Vercel: migrations need a direct URL. Fall back to DATABASE_URL if unset.
if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi

npx prisma generate
npx prisma migrate deploy
npx tsx prisma/seed-admin.ts
npx next build
