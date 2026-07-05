# UTG AllScore

Official UTGSU football hub — live scores, fixtures, results, and campus sports news.

## Architecture

Three Next.js apps share one SQLite database via the public API:

| App | Port | Role |
|-----|------|------|
| `frontend/` | 3000 | Public PWA + API + Prisma database |
| `admin-app/` | 3001 | Admin — schools, agents, teams, competitions, fixtures |
| `agent-app/` | 3002 | School agents — scores, events, lineups, news |

## Quick start

```bash
# Install dependencies
cd frontend && npm install
cd ../admin-app && npm install
cd ../agent-app && npm install

# Configure environment
cp frontend/.env.example frontend/.env
# Add Cloudinary credentials for logo/image uploads

# Database
cd ../frontend
npm run db:migrate
npm run db:seed

# Run all apps (from repo root)
cd ..
npm run dev:all
```

**URLs**
- Public site: http://localhost:3000
- Admin: http://localhost:3001/login
- Agent: http://localhost:3002/login

**Seeded admin:** `admin@utgsu.edu.gm` / `UTGSUAdmin2026!`

## Scripts (repo root)

| Script | Description |
|--------|-------------|
| `npm run dev:all` | Run public + admin + agent |
| `npm run dev:public` | Public site only |
| `npm run dev:admin` | Admin app only |
| `npm run dev:agent` | Agent app only |
| `npm run build` | Production build all apps |
| `npm run db:seed` | Seed UTGSU football data |
| `npm run db:reset` | Reset and re-seed database |

## Docker

Local all-in-one stack:

```bash
cp frontend/.env.example frontend/.env
docker compose up --build
```

Services: public API `:3000`, admin `:3001`, agent `:3002`. SQLite persisted in Docker volume.

## Production deployment

### Vercel (recommended)

All three apps deploy as **separate Vercel projects** with **Vercel Postgres** for the database.

See **[deploy/VERCEL.md](deploy/VERCEL.md)** for the full step-by-step guide.

Quick summary:
1. Create 3 Vercel projects (root dirs: `frontend`, `admin-app`, `agent-app`)
2. Add **Vercel Postgres** to the `frontend` project
3. Set env vars and redeploy
4. Seed once via `POST /api/setup/seed`

### Docker / VPS

See **[deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md)** for Docker, Render, and Railway.

## Environment variables

See `frontend/.env.example` for the full list. Key vars:

- `DATABASE_URL` — Postgres pooled URL (`POSTGRES_PRISMA_URL` on Vercel)
- `DIRECT_URL` — Postgres direct URL for migrations (`POSTGRES_URL_NON_POOLING` on Vercel)
- `AUTH_SECRET` — JWT signing secret
- `ADMIN_APP_URL` / `AGENT_APP_URL` — CORS origins for portal apps
- `CLOUDINARY_*` — Logo and image uploads

Admin and agent apps need `NEXT_PUBLIC_API_URL` pointing to the frontend API.

## Admin capabilities

- Schools, agents, teams (with logos + squads), competitions (with logos)
- Link/unlink teams to competitions
- Schedule and delete fixtures
- Full edit/delete on all resources

## Agent capabilities

- Update live scores, events, venue, lineups
- Publish and delete news articles and announcements
- Upload cover images via Cloudinary
