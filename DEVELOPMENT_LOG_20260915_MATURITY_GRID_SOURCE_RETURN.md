# Development Log — Maturity Grid Source Case Return

Date: 2026-09-15

## Finding
The maturity map could open the Activity evidence Grid and exact-focus one Activity row by Activity ID + team, but clicking that row only opened the generic Grid row detail. There was no exact source-Case return control inside that row-detail flow.

## Fix
- Exact Grid hit is marked only when Activity ID + team resolves to exactly one row.
- Clicking only that marked row decorates its row detail with `← 원 고도화 Case로 돌아가기`.
- Before return, the guard revalidates that the marked row is still the sole exact Activity ID + team match.
- Return delegates to the maturity operational guard, which restores the exact source Case and clears return context only after successful exact restoration.
- Missing or ambiguous rows fail closed; no first-row or fuzzy fallback is used.
- No server-side forced empty write was introduced.

## Cache
`final-layout-polish.js` now loads `hd20-maturity-grid-exact-focus-guard.js?v=20260915-2`.