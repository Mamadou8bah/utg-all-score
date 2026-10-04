# UTG AllScore

Official UTGSU football hub — live scores, fixtures, results, and campus sports news.

## Architecture

Three Next.js apps share one PostgreSQL database via the public API:

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

Services: public API `:3000`, admin `:3001`, agent `:3002`. Use the PostgreSQL connection configured in DATABASE_URL.

The latest production and mobile review, verified checks, and remaining deployment requirements are documented in [deploy/READINESS.md](deploy/READINESS.md).

## Production deployment

### Netlify

The root `netlify.toml` configures the public app with base directory `frontend`,
build command `npm run build`, and publish directory `.next`. Netlify automatically
uses its Next.js adapter for the API routes and server rendering.

Add the values from `frontend/.env.example` to Netlify's environment variables
for both builds and functions. Local `.env` files are not committed or uploaded.
Use production PostgreSQL URLs and set `AUTH_SECRET`, portal URLs, and upload
credentials as described below. Provision the database schema separately before
using the app; the build does not run migrations or seed the database.

Push the configuration to the connected branch and trigger a new deploy. The log
should run `prisma generate && next build` and package the Next.js server functions.
Publishing `frontend` directly without a build only uploads the source files.

Deploy the admin and agent portals as separate Netlify projects connected to this
repository. Set each project's **Base directory** in Netlify before deploying so
Netlify discovers that app's `netlify.toml` instead of the public site's root config:

| Project | Base directory | Configuration | Build command | Publish directory |
|---------|----------------|---------------|---------------|-------------------|
| Public | `frontend` | `netlify.toml` (repository root) | `npm run build` | `.next` |
| Admin | `admin-app` | `admin-app/netlify.toml` | `npm run build` | `.next` |
| Agent | `agent-app` | `agent-app/netlify.toml` | `npm run build` | `.next` |

For both portals, configure `NEXT_PUBLIC_API_URL` with the deployed public site's
HTTPS origin (without `/api`) and `NEXT_PUBLIC_PUBLIC_SITE_URL` with that same
origin. Set these before building and redeploy after changing them. On the public
project, set `ADMIN_APP_URL` and `AGENT_APP_URL` to the respective portal origins
and redeploy so authentication requests are allowed by CORS.

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
- Link/unlink teams to competitions (school comps limited to that school's teams)
- Assign agents to school or general competitions (grants access to all fixtures)
- Schedule fixtures from competition rosters; assign per-match agents
- Full edit/delete on teams, players, competitions, and agents

## Agent capabilities

- See matches from competition assignment and/or per-fixture assignment
- Update live scores, events, venue, lineups (players picked from team squads)
- Publish and delete news articles and announcements
- Upload cover images via Cloudinary
