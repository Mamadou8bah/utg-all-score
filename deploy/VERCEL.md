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
| `CLOUDINARY_CLOUD_NAME` | your Cloudinary cloud (e.g. `dflsnes44`) |
| `CLOUDINARY_UPLOAD_PRESET` | unsigned preset name (recommended — see below) |
| `CLOUDINARY_API_KEY` | your key (only if not using upload preset) |
| `CLOUDINARY_API_SECRET` | your secret (only if not using upload preset) |
| `SETUP_SECRET` | random secret for one-time seeding |

**Cloudinary logo uploads:** New Cloudinary API keys have **no upload permission** by default. Easiest fix:

1. Cloudinary Console → **Settings → Upload → Upload presets → Add**
2. Name: `utg-allscore-unsigned`, Signing: **Unsigned**, Folder: `utg-allscore/logos`
3. On Vercel API project set `CLOUDINARY_UPLOAD_PRESET=utg-allscore-unsigned` and redeploy

Alternatively, Cloudinary Console → **Settings → API Keys** → assign your key a role with **Upload assets** permission.

Leave `NEXT_PUBLIC_APP_URL`, `ADMIN_APP_URL`, `AGENT_APP_URL` empty for now — set them after all three projects are deployed.

### Redeploy

**Deployments → Redeploy** (migrations run during build via `prisma migrate deploy`).

### Seed the database (once)

**Admin account** is created automatically on every API deploy (via `prisma/seed-admin.ts` during build).

**Default admin:** `admin@utgsu.edu.gm` / `UTGSUAdmin2026!` — change after first login.

To load demo competitions, teams, and matches:

```bash
curl -X POST https://YOUR-API-DOMAIN.vercel.app/api/setup/seed \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

To recreate only the admin user (if login fails):

```bash
curl -X POST https://YOUR-API-DOMAIN.vercel.app/api/setup/admin \
  -H "x-setup-secret: YOUR_SETUP_SECRET"
```

Or from your machine:

```bash
cd frontend
DATABASE_URL="your-postgres-url" DIRECT_URL="your-direct-url" npm run db:seed-admin
DATABASE_URL="your-postgres-url" DIRECT_URL="your-direct-url" npm run db:seed
```

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
| Admin can't reach API | Set `NEXT_PUBLIC_API_URL=https://YOUR-API-DOMAIN.vercel.app` (no trailing slash, `https://` not `hhttps://`), then **redeploy** admin |
| `URL scheme "hhttps" is not supported` | Typo in Vercel env: change `hhttps://...` to `https://...` and redeploy |
| CORS error | `ADMIN_APP_URL` / `AGENT_APP_URL` must match exact portal URL (no trailing slash) |
| Empty database | Run seed endpoint or `npm run db:seed` |
| Prisma connection errors | Use `POSTGRES_PRISMA_URL` for `DATABASE_URL`, not raw `POSTGRES_URL` |
| Logo upload `missing permissions (actions=["create"])` | Cloudinary API key lacks upload role — use unsigned `CLOUDINARY_UPLOAD_PRESET` or assign Upload role to the key |

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
