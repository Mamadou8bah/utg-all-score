# Production and mobile review

Reviewed on 1 October 2026: public app, admin portal, and agent portal.

The application fixes are implemented. Deployment configuration still needs attention; this review does not certify a live deployment.

## Changes

- Updated Next.js to the patched 15.5 series and overrode vulnerable PostCSS dependencies. All three dependency audits report zero vulnerabilities.
- Required a strong production signing secret, restricted accepted JWT roles and algorithms, validated authentication inputs, and preserved existing admin accounts during setup.
- Prevented production seeding from deleting populated sports or content data.
- Kept authenticated APIs and portal pages out of service worker caches. Offline responses have the correct content type, failed requests preserve successful cache entries, and cache storage failures preserve usable network responses.
- Cached the JavaScript and styles required by offline screens, and limited cache cleanup to each app's own caches.
- Added public data refresh, reconnect handling, retry feedback, and recoverable page errors.
- Improved touch targets, focus visibility, reduced motion, display cutout spacing, mobile input sizing, and accessible detail dialogs.
- Corrected PostgreSQL deployment examples, Prisma installation in Docker, container startup, and standalone output paths.

## Verified

- Production builds and TypeScript checks passed for all three apps.
- Public database connectivity and all ten public data endpoints passed read-only smoke checks.
- Invalid login payloads and unauthenticated admin access were rejected.
- Session checks passed for valid, malformed, expired, invalid-role, and unexpected-algorithm tokens.
- All three service workers passed offline, privacy, cache isolation, and storage failure regression checks.
- Real Chromium browser offline navigation passed for all three apps.
- Browser tests cover route layouts at 320, 360, 390, 768, and 1280 pixels, public navigation and dialog dismissal, portal input sizing, sign-out redirects, and offline access without a token. API data and portal sessions are mocked in these tests; they do not verify real account permissions or persistence.

Rapidly replacing documents in one browser tab produced intermittent React hydration errors in the original test. Fresh-document checks did not reproduce them. The test now isolates document loads and checks normal app navigation separately.

## Required before deployment

`npm run check:config` currently reports five missing or unsuitable values:

| App | Variable |
| --- | --- |
| Public API | `DIRECT_URL` |
| Public API | `AUTH_SECRET` (unique random secret, at least 32 characters) |
| Admin | `NEXT_PUBLIC_API_URL` |
| Agent | `NEXT_PUBLIC_API_URL` |
| Agent | `NEXT_PUBLIC_PUBLIC_SITE_URL` |

Set actual HTTPS domains in the portal build environment and rebuild those apps. Set the direct PostgreSQL connection and signing secret through the deployment environment. Creating a new production admin additionally requires `ADMIN_INITIAL_PASSWORD`; setup preserves existing accounts. Remove `SETUP_SECRET` after setup.

Validate real admin and agent sign-in, role restrictions, saved edits, file uploads, and push delivery in staging. Test installation, keyboard behavior, and screen cutouts on actual iOS and Android devices. Docker execution was not verified because Docker is unavailable in this environment. Configure database backups and login abuse protection in the hosting platform.

## Repeat the checks

```sh
npm run build
npm run typecheck
npm run test:pwa
npm run check:offline
npm run test:auth --prefix frontend
npm run check:config
npm audit --omit=dev --prefix frontend
npm audit --omit=dev --prefix admin-app
npm audit --omit=dev --prefix agent-app
```

`scripts/test-mobile.cjs` requires Playwright and Microsoft Edge. Start the three built apps on ports 3100, 3101, and 3102, then run `npm run test:mobile`. `PLAYWRIGHT_MODULE` can point to a separately installed Playwright package; `PUBLIC_TEST_PORT` and `TEST_PORT_BASE` support alternate ports. The test uses mocked API responses and performs no database writes.

See [the deployment guide](DEPLOYMENT.md) for environment configuration.
