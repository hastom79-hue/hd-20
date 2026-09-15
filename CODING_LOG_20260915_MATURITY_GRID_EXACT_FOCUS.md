# Coding Log — Maturity Activity Grid Exact Focus

Date: 2026-09-15

## Files
- `hd20-maturity-grid-exact-focus-guard.js` (new)
- `final-layout-polish.js`

## Contract
`hd20MaturityMapReturnV1` supplies `{id, team}`. The guard inspects visible advancement-standard grid tables and resolves the `Activity ID` and `생산팀` columns by exact header text. It only focuses when exactly one row has exact ID equality and, when a team column/context exists, exact team equality.

`validate()` exposes `matches`, `exactSafe`, and focus state for runtime inspection.

The existing text search remains a convenience filter only; it is no longer treated as proof of exact row identity.

Invariant: no fuzzy/substring identity selection, no first-row fallback, no server-side forced empty write.