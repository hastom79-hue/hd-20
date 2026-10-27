# Development Log — Action ID Lineage Handoff

Date: 2026-09-15

## Finding
The Action ID integrity guard can replace a newly registered duplicate ID with a new exact ID. The Audit→Action lineage guard originally required the event ID to be in the pre-registration unseen-ID set. After an ID replacement, the replacement ID was not in the pre-registration set, so lineage attachment could fail closed and leave the new Action without its source Audit lineage.

## Fix
- `action-audit-linkage.js` now accepts `replacedId` from `hd20-action-updated`.
- A replacement ID is accepted only when the replaced ID existed in the pre-registration ID snapshot and the new exact ID exists in current rows.
- Normal exact unseen-ID behavior remains unchanged.
- Fallback remains fail-closed.
- No fuzzy team/workplace matching was introduced.
- No server-side forced empty write was introduced.

## Cache
`final-layout-polish.js` now loads `action-audit-linkage.js?v=20260915-2`.

## Validation contract
Action register → duplicate-ID repair (if needed) → exact replacement ID event → exact Audit lineage patch → Action trace.