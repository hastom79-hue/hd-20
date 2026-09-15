# Coding Log — 2026-09-16 Activity Import Trend / Evidence

## Files
- `activity-import-analysis-mail-preview.js`
- `index.html`

## Code
- `monthSeries(imp)` aggregates up to 12 recent import months and computes sequential delta.
- `summary()` unions team-master teams with current/previous Import teams so a team falling to zero remains visible.
- `drops`: previous month > 0 and current delta < 0.
- `gaps`: team exists in actual team master and current month count == 0.
- Evidence uses current-month Production Import rows and canonical IDs.
- Mail preview mirrors trend/reference signals/evidence IDs.

## Semantics
- Trend is Import trend, not a replacement for canonical annual per-person KPI.
- Decrease/gap are reference signals only.
- No arbitrary threshold is introduced.

## Cache
`activity-import-analysis-mail-preview.js?v=20260916-trend-evidence-5`

## Write boundary
No localStorage/Supabase write added by this analysis module.