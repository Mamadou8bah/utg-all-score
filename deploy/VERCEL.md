# Deploy all three UTG AllScore apps on Vercel

You need **three Vercel projects** from the same GitHub repo. SQLite does not work on Vercel — the API uses **Vercel Postgres**.

| Vercel project | Root directory | URL example |
|----------------|----------------|-------------|
| `utg-allscore` | `frontend` | `https://allscore.vercel.app` |
| `utg-allscore-admin` | `admin-app` | `https://admin-allscore.vercel.app` |
| `utg-allscore-agent` | `agent-app` | `https://agent-allscore.vercel.app` |

---

## Step 1 — Push to GitHub

```bash
git push origin main
```

---

## Step 2 — Deploy the public API (`frontend`)

1. [vercel.com/new](https://vercel.com/new) → Import your repo
2. **Project name:** `utg-allscore` (or your choice)
3. **Root Directory:** `frontend` ← important
4. Framework: Next.js (auto-detected)
5. Click **Deploy** (first deploy may fail until env vars are set — that's OK)

### Add Vercel Postgres

1. Open the `utg-allscore` project → **Storage** → **Create Database** → **Postgres**
2. Connect it to the project — Vercel injects these variables automatically:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Map database env vars

In **Project Settings → Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `@POSTGRES_PRISMA_URL` (reference the storage variable) |
| `DIRECT_URL` | `@POSTGRES_URL_NON_POOLING` |
| `AUTH_SECRET` | long random string (32+ chars) |
| `CLOUDINARY_CLOUD_NAME` | your Cloudinary cloud |
| `CLOUDINARY_API_KEY` | your key |
| `CLOUDINARY_API_SECRET` | your secret |
| `SETUP_SECRET` | random secret for one-time seeding |

Leave `NEXT_PUBLIC_APP_URL`, `ADMIN_APP_URL`, `AGENT_APP_URL` empty for now — set them after all three projects are deployed.

### Redeploy

**Deployments → Redeploy** (migrations run during build via `prisma migrate deploy`).

### Seed the database (once)

```bash
curl -X POST https://YOUR-API-DOMAIN.vercel.app/api/setup/seed \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

Or from your machine:

```bash
cd frontend
DATABASE_URL="your-postgres-url" DIRECT_URL="your-direct-url" npm run db:seed
```

**Default admin:** `admin@utgsu.edu.gm` / `UTGSUAdmin2026!` — change after first login.

---

## Step 3 — Deploy admin app

1. **New Project** → same repo
2. **Root Directory:** `admin-app`
3. **Environment Variables** (Production):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API-DOMAIN.vercel.app` |
| `NEXT_PUBLIC_PUBLIC_SITE_URL` | `https://YOUR-API-DOMAIN.vercel.app` |

4. Deploy

> `NEXT_PUBLIC_*` are baked in at build time. Redeploy after changing them.

---

## Step 4 — Deploy agent app

1. **New Project** → same repo
2. **Root Directory:** `agent-app`
3. Same env vars as admin:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API-DOMAIN.vercel.app` |
| `NEXT_PUBLIC_PUBLIC_SITE_URL` | `https://YOUR-API-DOMAIN.vercel.app` |

4. Deploy

---

## Step 5 — Wire CORS on the API

Go back to the **frontend** project → Environment Variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-API-DOMAIN.vercel.app` |
| `ADMIN_APP_URL` | `https://YOUR-ADMIN-DOMAIN.vercel.app` |
| `AGENT_APP_URL` | `https://YOUR-AGENT-DOMAIN.vercel.app` |

**Redeploy the API project** so CORS allows the admin and agent origins.

---

## Step 6 — Custom domains (optional)

| App | Suggested domain |
|-----|------------------|
| Public | `allscore.utgsu.edu.gm` |
| Admin | `admin.allscore.utgsu.edu.gm` |
| Agent | `agent.allscore.utgsu.edu.gm` |

After adding domains:

1. Update all env vars with the final URLs
2. **Redeploy all three projects** (admin + agent must rebuild for `NEXT_PUBLIC_*`)

---

## Verify

- [ ] `GET https://YOUR-API/api/health` → `{ "data": { "status": "ok" } }`
- [ ] Public site loads
- [ ] Admin login at `/login` works
- [ ] Agent login works
- [ ] No CORS errors in browser console on admin/agent

---

## Local dev with Postgres

Use [Vercel Postgres](https://vercel.com/storage/postgres) dev DB, [Neon](https://neon.tech), or Docker:

```bash
docker run -d --name utg-pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```

```bash
cd frontend
npm run db:migrate
npm run db:seed
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on `migrate deploy` | Check `DIRECT_URL` is set to non-pooling URL |
| Admin can't reach API | Rebuild admin with correct `NEXT_PUBLIC_API_URL` |
| CORS error | `ADMIN_APP_URL` / `AGENT_APP_URL` must match exact portal URL (no trailing slash) |
| Empty database | Run seed endpoint or `npm run db:seed` |
| Prisma connection errors | Use `POSTGRES_PRISMA_URL` for `DATABASE_URL`, not raw `POSTGRES_URL` |

---

## CLI deploy (alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# API
cd frontend && vercel --prod

# Admin
cd admin-app && vercel --prod

# Agent
cd agent-app && vercel --prod
```

Link each to a separate Vercel project when prompted.
