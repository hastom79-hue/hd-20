# Coding Log — Action lineage trust boundary

Date: 2026-09-15

## Files
- `action-audit-linkage.js`
- `final-layout-polish.js`

## Coding details
`patchCreated()` now accepts `trustedReplacement=false`. For an event-provided exact ID it computes `exactMatches` and `unseenExact`. A normal registration event may patch only when `unseenExact.length === 1`. A replacement handoff may patch an already-visible new ID only when `trustedReplacement === true`, `replacedId` existed in `beforeIds`, and `exactMatches.length === 1`.

The event listener sets `trustedReplacement` only for `source === 'action-id-integrity-guard'`. Other sources cannot use `replacedId` to bypass the unseen-ID contract.

Loader cache was advanced to `action-audit-linkage.js?v=20260915-3` while retaining the correct `action-audit-prefill-guard.js?v=20260912-2` path.
