#!/bin/sh
set -e

# Neon/Vercel: migrations need a direct URL. Fall back to DATABASE_URL if unset.
if [ -z "$DIRECT_URL" ]; then
  export DIRECT_URL="$DATABASE_URL"
fi

npx prisma generate

# Recover from duplicate CompetitionAgent migration if a prior deploy failed mid-way.
npx prisma migrate resolve --rolled-back "20260705160000_competition_agents" 2>/dev/null || true

npx prisma migrate deploy
npx tsx prisma/seed-admin.ts
npx next build
