# HD-20 Coding Log — 2026-09-16 Activity DB Retry

## Files
- `activity-import-db-readiness-guard.js`
- `index.html`

## Implementation
- Added `retryButton(show)` and `hd20ActivityDbRetry`.
- Retry invokes existing `window.HD20_DB_SYNC.manualSync()` only.
- Guard still blocks `[data-ax-confirm]` when DB is not ready.
- `hd20-db-status` drives queued/syncing/error/ready UI states.
- Error/readiness-blocked states expose retry; ready hides it.
- Cache bust: `activity-import-db-readiness-guard.js?v=20260916-retry-2`.

## Invariants
- No server-side forced empty write.
- No write during Excel parse/validation/preview.
- Existing explicit confirmation boundary retained.
