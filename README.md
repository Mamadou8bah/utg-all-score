# UTG AllScore
**The Official Hub for University Sports Updates**

UTG AllScore is now a single Next.js Progressive Web App. The project no longer uses a separate backend service; page routes, API routes, manifest generation, offline support, and browser-side notification flows all live in the Next.js app.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Progressive Web App setup
- Route Handlers for app-owned APIs

## Project Structure

```txt
utg-all-score/
  frontend/
    app/
    components/
    lib/
    public/
    Dockerfile
  docs/
  .env.example
  docker-compose.yml
  package.json
```

## Local Development

1. Install frontend dependencies

```bash
cd frontend
npm install
```

2. Run the app

```bash
cd frontend
npm run dev
```

Or from the repository root:

```bash
npm run dev
```

3. Open:

- App: `http://localhost:3000`

## Docker

```bash
docker compose up --build
```

The app will be available at `http://localhost:3000`.

## Notes

- PWA manifest lives in `frontend/app/manifest.ts`
- Service worker lives in `frontend/public/sw.js`
- Route handlers for cached content live under `frontend/app/api`
- Push subscription endpoint is currently a placeholder route and should be connected to a real push provider when you are ready
