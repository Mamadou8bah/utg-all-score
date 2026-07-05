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

1. **Public API** (`frontend`) — includes SQLite database and migrations
2. **Admin app** — points to the live API URL
3. **Agent app** — points to the live API URL

After all three are live, set CORS on the API (`ADMIN_APP_URL`, `AGENT_APP_URL`) to the final admin/agent URLs.

---

## Environment variables

### 1. Public API (`frontend/.env`)

```env
DATABASE_URL="file:/app/prisma/prod.db"
AUTH_SECRET="long-random-secret-min-32-chars"
NEXT_PUBLIC_APP_URL="https://allscore.utgsu.edu.gm"
ADMIN_APP_URL="https://admin.allscore.utgsu.edu.gm"
AGENT_APP_URL="https://agent.allscore.utgsu.edu.gm"
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RUN_SEED="true"
```

Set `RUN_SEED=true` only on the **first** deploy, then set it back to `false`.

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

SQLite is stored in a Docker volume (`sqlite_data`). Back it up regularly.

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
docker run -d -p 3000:3000 --env-file frontend/.env \
  -v utg_sqlite:/app/prisma utg-allscore-api

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

The API service includes a **1 GB persistent disk** for SQLite at `/app/prisma`.

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
3. For the API: add a **volume** mounted at `/app/prisma`
4. Generate a public domain or attach custom domain per service

---

## Option D — Vercel (admin + agent only) + API elsewhere

The **public API must not go on Vercel** if you keep SQLite (no persistent filesystem). Host the API on Render, Railway, or a VPS.

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
- [ ] `RUN_SEED` set to `false` after first deploy
- [ ] SQLite volume backed up

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
| Database empty after restart | Ensure persistent volume is mounted at `/app/prisma` |
| Migrations failed | Check API logs; run `prisma migrate deploy` inside container |
| Need to re-seed | `docker exec <api-container> npx prisma db seed` |

---

## Security notes

- Change `AUTH_SECRET` to a strong random value
- Change default admin password after first login
- Use HTTPS on all three domains
- Do not commit `.env` files
