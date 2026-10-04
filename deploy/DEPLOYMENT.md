# UTG AllScore — Deployment Guide

Deploy the three apps as **separate services**. They share one database through the public API (`frontend/`).

| Service | Folder | Default port | Role |
|---------|--------|--------------|------|
| **Public API + PWA** | `frontend/` | 3000 | Database, REST API, public site |
| **Admin portal** | `admin-app/` | 3001 | UTGSU admin console |
| **Agent portal** | `agent-app/` | 3002 | School agent matchday console |

Recommended production domains (example):

| App | URL |
|-----|-----|
| Public | `https://allscore.utgsu.edu.gm` |
| Admin | `https://admin.allscore.utgsu.edu.gm` |
| Agent | `https://agent.allscore.utgsu.edu.gm` |

---

## Deploy order

1. **Public API** (`frontend`) — uses PostgreSQL and applies migrations
2. **Admin app** — points to the live API URL
3. **Agent app** — points to the live API URL

After all three are live, set CORS on the API (`ADMIN_APP_URL`, `AGENT_APP_URL`) to the final admin/agent URLs.

---

## Environment variables

### 1. Public API (`frontend/.env`)

```env
DATABASE_URL="postgresql://user:password@host:5432/allscore?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/allscore?sslmode=require"
ADMIN_INITIAL_PASSWORD="unique-initial-password-at-least-12-characters"
SETUP_SECRET="unique-random-setup-secret"
AUTH_SECRET="long-random-secret-min-32-chars"
NEXT_PUBLIC_APP_URL="https://allscore.utgsu.edu.gm"
ADMIN_APP_URL="https://admin.allscore.utgsu.edu.gm"
AGENT_APP_URL="https://agent.allscore.utgsu.edu.gm"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Create the initial admin with `POST /api/setup/admin` and header `x-setup-secret`. Optional demo data is available through `POST /api/setup/seed` on an empty sports database. Remove `SETUP_SECRET` after setup.

### 2. Admin app (`admin-app` — build-time)

```env
NEXT_PUBLIC_API_URL=https://allscore.utgsu.edu.gm
NEXT_PUBLIC_PUBLIC_SITE_URL=https://allscore.utgsu.edu.gm
```

### 3. Agent app (`agent-app` — build-time)

Same as admin.

> **Important:** `NEXT_PUBLIC_*` values are embedded at **build time**. After changing URLs you must **rebuild** admin and agent.

---

## Option A — Docker (VPS / separate servers)

Each app has its own compose file under `deploy/`.

### Public API

```bash
cd deploy/frontend
cp .env.example .env
# Edit .env with production secrets and URLs

docker compose up -d --build
```

Connect to a PostgreSQL service and configure scheduled database backups.

### Admin (separate host or same VPS)

```bash
cd deploy/admin-app
cp .env.example .env
# Set NEXT_PUBLIC_API_URL to your live API domain

docker compose up -d --build
```

### Agent

```bash
cd deploy/agent-app
cp .env.example .env
docker compose up -d --build
```

### Manual Docker build (without compose)

```bash
# API
docker build -t utg-allscore-api ./frontend
docker run -d -p 3000:3000 --env-file frontend/.env utg-allscore-api

# Admin
docker build -t utg-allscore-admin \
  --build-arg NEXT_PUBLIC_API_URL=https://allscore.utgsu.edu.gm \
  --build-arg NEXT_PUBLIC_PUBLIC_SITE_URL=https://allscore.utgsu.edu.gm \
  ./admin-app
docker run -d -p 3001:3001 utg-allscore-admin

# Agent
docker build -t utg-allscore-agent \
  --build-arg NEXT_PUBLIC_API_URL=https://allscore.utgsu.edu.gm \
  --build-arg NEXT_PUBLIC_PUBLIC_SITE_URL=https://allscore.utgsu.edu.gm \
  ./agent-app
docker run -d -p 3002:3002 utg-allscore-agent
```

Put **nginx** or **Caddy** in front of each container for HTTPS.

---

## Option B — Render (managed, 3 services)

1. Push repo to GitHub
2. Render → **New Blueprint** → connect repo → uses root `render.yaml`
3. Set environment variables in the Render dashboard for each service:
   - **utg-allscore-api**: all vars from `frontend/.env.example`
   - **utg-allscore-admin** / **utg-allscore-agent**: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PUBLIC_SITE_URL`
4. Attach custom domains to each service
5. Update `ADMIN_APP_URL` / `AGENT_APP_URL` on the API service with final admin/agent URLs
6. Redeploy admin + agent after URL changes

Provide PostgreSQL DATABASE_URL and DIRECT_URL values for the API service.

Health check: `GET /api/health`

---

## Option C — Railway (3 services, one repo)

Create **three services** from the same GitHub repo:

| Service | Root directory | Start command |
|---------|----------------|---------------|
| API | `frontend` | Docker (uses `frontend/Dockerfile`) |
| Admin | `admin-app` | Docker (uses `admin-app/Dockerfile`) |
| Agent | `agent-app` | Docker (uses `agent-app/Dockerfile`) |

For each service:

1. Set root directory in Railway settings
2. Add env vars (same as above)
3. For the API: provision PostgreSQL and set DATABASE_URL and DIRECT_URL
4. Generate a public domain or attach custom domain per service

---

## Option D — Vercel

All three apps can deploy to Vercel with a managed PostgreSQL database. See [VERCEL.md](VERCEL.md) for the API deployment.

Admin and agent can deploy to Vercel:

| Project | Root directory | Build command | Env |
|---------|----------------|---------------|-----|
| Admin | `admin-app` | `npm run build` | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_PUBLIC_SITE_URL` |
| Agent | `agent-app` | `npm run build` | same |

---

## Post-deploy checklist

- [ ] API health check returns `{ "data": { "status": "ok" } }` at `/api/health`
- [ ] Public site loads at your domain
- [ ] Admin login works (`admin@utgsu.edu.gm` / change password after first login if seeded)
- [ ] Agent login works for a school agent account
- [ ] Logo/image upload works (Cloudinary configured)
- [ ] CORS: admin and agent can call API (no browser CORS errors)
- [ ] `SETUP_SECRET` removed after initial setup
- [ ] PostgreSQL backups configured

---

## Local all-in-one (testing production builds)

From repo root:

```bash
cp frontend/.env.example frontend/.env
docker compose up --build
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Admin/agent show "Failed to fetch" | Check `NEXT_PUBLIC_API_URL` matches live API; rebuild app |
| CORS errors in browser | Set `ADMIN_APP_URL` / `AGENT_APP_URL` on API to exact portal origins (no trailing slash) |
| Database empty after restart | Check DATABASE_URL points to the persistent PostgreSQL service |
| Migrations failed | Check API logs; run `prisma migrate deploy` inside container |
| Need to re-seed | Use the setup endpoint only on an empty database; production seeding refuses populated data |

---

## Security notes

- Change `AUTH_SECRET` to a strong random value
- Set a unique ADMIN_INITIAL_PASSWORD before creating the admin
- Use HTTPS on all three domains
- Do not commit `.env` files
