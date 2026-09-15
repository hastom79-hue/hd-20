# Coding Log — Action ID Lineage Handoff

Date: 2026-09-15

## Files
- `action-audit-linkage.js`
- `final-layout-polish.js`

## Implementation
`patchCreated(beforeIds, sourceSnapshot, manualDue, createdId, replacedId)` now supports the exact ID replacement event emitted by `action-id-integrity-guard.js`.

Selection remains strict:
1. Prefer an exact newly unseen `createdId`.
2. For an integrity replacement only, allow the exact new ID when `replacedId` was present in the pre-registration snapshot.
3. Otherwise return false; never guess by team, workplace, order, or first row.

The `hd20-action-updated` listener forwards both `detail.id` and `detail.replacedId`.

Cache version for Action Audit linkage bumped to `v=20260915-2`.

Invariant: no server-side forced empty writes; existing production-only and Audit lifecycle policies unchanged.