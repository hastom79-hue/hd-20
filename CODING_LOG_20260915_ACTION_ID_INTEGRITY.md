# CODING LOG — Action ID Integrity (2026-09-15)

## Files
- Added `action-id-integrity-guard.js`
- Updated `final-layout-polish.js` loader with `action-id-integrity-guard.js?v=20260915-1`
- Updated `index.html` final loader cache to `final-layout-polish.js?v=20260915-4`

## Contract
`action-mail-workflow.js` currently emits `hd20-action-updated` with `source: action-mail-register` after unshifting the new Case. The guard observes only this source. If emitted ID count is > 1, row index 0 is treated as the just-created Case, a unique same-day `IMP-YYYYMMDD-NNN` is allocated from max existing suffix + 1, storage is saved, then a second update event is emitted with source `action-id-integrity-guard` and the corrected exact ID.

This ordering is intentional with `action-audit-linkage.js`: its first event path fails closed when the duplicate ID was already present in `beforeIds`; the corrected-ID event can then resolve the newly unseen unique Action and attach the pending Audit lineage exactly.

No server-side forced empty write was introduced.