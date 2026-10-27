# Development Log — Maturity Exact Return Visibility

Date: 2026-09-15

## Finding
The exact maturity return already matched by Activity ID + team, but the current maturity filter could leave the matched card hidden. A separate priority-filter observer attempted to repair this after the focus class was applied; therefore return context could be cleared before visibility was independently guaranteed.

## Fix
`restoreReturnFocus()` now guarantees visibility synchronously before clearing return context:
- exact candidate count must remain exactly 1;
- exact team section is opened;
- if the card is filter-hidden, both operational and priority filter modes are reset to `all` and reapplied;
- if the exact card is still hidden, return fails closed and the return context is preserved;
- only a visible exact card is focused/scrolled and then the return context is cleared.

No fuzzy Activity matching and no server-side forced empty write were introduced.

Cache: `hd20-maturity-map-operational-guard.js?v=20260915-3`.