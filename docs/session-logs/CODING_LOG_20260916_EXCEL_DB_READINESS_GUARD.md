# Coding Log — 2026-09-16 Excel DB Readiness Guard

## Files
- `activity-import-db-readiness-guard.js`
- `index.html`

## Contract
- Capture-phase click guard targets only `[data-ax-confirm]` inside `#hd20ActivityExcelImport`.
- Production confirmation requires `window.HD20_DB_SYNC.ready() === true`.
- When DB is not ready, confirmation is stopped before the importer write handler executes.
- `HD20_AUTH_BYPASS` is treated as local validation mode and does not require remote DB readiness.
- `hd20-gmes-5s-imported` marks the import as queued for DB sync.
- `hd20-db-status` updates the import result to syncing / DB confirmed / DB error.
- Existing storage patch + debounced push in `supabase-sync.js` remains the single synchronization path.
- No server-side forced empty write was introduced.

## Cache
`activity-import-db-readiness-guard.js?v=20260916-1`