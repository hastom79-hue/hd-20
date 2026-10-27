# Coding Log — Maturity Grid Source Case Return

Date: 2026-09-15

## Files
- `hd20-maturity-grid-exact-focus-guard.js`
- `final-layout-polish.js`

## Implementation
`focus()` now marks the sole Activity ID + team Grid match with `data-maturity-source-exact="1"`.

A capture click handler reacts only to that marked row. `decorateRowDetail(row)` re-runs exact matching and requires `hits.length === 1 && hits[0] === row` before adding the source-return control.

`returnToSource()` closes the generic row detail and delegates to `HD20_MATURITY_MAP_OPERATIONAL_GUARD.returnToMap()`. The existing operational guard then restores the exact maturity Case by Activity ID + team and clears session return context only after successful exact focus.

The guard remains fail-closed for zero/multiple matches. No fuzzy matching, first-row fallback, or server-side forced empty write was added.

Cache bumped to `hd20-maturity-grid-exact-focus-guard.js?v=20260915-2`.