# Readiness review — 1 October 2026

The public app uses a white header, the UTG AllScore logo, blue navigation text, and a red active underline. The blue match filter bar remains below the header.

## Completed checks

- Production builds of the public, admin, and agent apps using the isolated `.next-readiness` output directory.
- TypeScript checks across all three apps.
- Production dependency audits: zero reported vulnerabilities in each app after dependency updates.
- Session tests covering valid tokens, expired and malformed tokens, invalid roles, and unexpected signing algorithms.
- Offline regression tests covering all three service workers, private API and RSC cache bypass, cache isolation, navigation fallback, and protection against caching failed score responses.
- Real database reads and all eleven public API endpoints, including the health endpoint.
- Authenticated read checks for admin and agent APIs; anonymous requests were rejected and agents could not access admin APIs.
- Browser checks of public routes on mobile, the desktop header, Matches image, actual match dialogs, Escape dismissal, portal login redirects, and authenticated admin navigation.
- Error-state and retry UI checks with successful sample responses. Real requests also succeeded, but the hosted database returned intermittent `P1001` connection failures during the review.

## Corrections made

- Added loading, error, and retry states so unavailable data does not appear to be an empty database.
- Added visible-page refreshes for live scores and fixtures, plus refreshes after reconnection.
- Corrected stale match/team detail calculations and kept open match details aligned with refreshed match data.
- Replaced placeholder news article text with published article content and calculated reading time.
- Replaced invented possession and shot statistics with recorded scores and card events.
- Connected article and competition sharing controls.
- Improved portal connection-error feedback and hid protected screens until the local authentication check completes.
- Restricted session verification to the expected role values and signing algorithm.
- Extended default Neon connection and pool timeouts while preserving explicitly configured values. This mitigates cold-start timeouts; it does not guarantee database availability. See [Prisma's Neon guidance](https://docs.prisma.io/docs/orm/v6/overview/databases/neon).

## Before production

1. Configure `DIRECT_URL` for migrations. It was missing from the local environment used for this review.
2. Change the seeded administrator password. The documented development password still authenticated during testing. Existing account passwords were preserved.
3. Verify database availability on the deployment host; local tests observed intermittent connection failures.
4. Verify a real Cloudinary upload and push delivery on an installed device. Configuration was present, but those external actions were not exercised.

Administrative writes, deletions, and publishing were not exercised against the existing live data. Read checks and browser checks are not a substitute for a full staging acceptance test.

## Repeatable checks

```powershell
npm run typecheck
npm run test:auth --prefix frontend
npm run test:pwa
npm run check:offline
npm run build
```

Stop running preview servers before a normal Windows build so Prisma can regenerate its native query engine without a file lock. Set `UTG_BUILD_DIR=.next-readiness` to isolate build output from another checkout or preview using `.next`.
