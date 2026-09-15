# Development Log — Maturity Activity Grid Exact Focus

Date: 2026-09-15

## Finding
Maturity Map → Activity Detail Grid passed the exact Activity ID as the grid search query, but the generic grid search is substring/text-content based. That can display additional rows when the same text appears elsewhere and did not independently prove that the intended Activity row was uniquely identified.

## Fix
Added `hd20-maturity-grid-exact-focus-guard.js`.

When a Maturity return context exists and the user is in `advancement / standard`, the guard:
- reads the stored exact Activity ID + team,
- locates columns by exact headers `Activity ID` and `생산팀`,
- accepts only one exact matching row,
- highlights and scrolls only that row,
- reports `missing` or `ambiguous` and fails closed for 0 or multiple matches.

No fuzzy matching or first-row fallback is used. No server-side write path was changed and no forced empty write was introduced.

## Cache
Loaded from `final-layout-polish.js` as `hd20-maturity-grid-exact-focus-guard.js?v=20260915-1`.