# CODING LOG — 2026-09-16 — Runtime smoke five-area repair

## `.github/workflows/runtime-smoke.yml`
- replaced stale six-area nav assertion with five-area nav assertion.
- removed required standalone `data-key="maturitymap"` and added negative assertion.
- expected controller: `canonical-five-area-v9-dashboard-map`.
- verifies legacy aliases `maturitymap/map/maturity` route through `goDashboard(nav,'maturity')`.
- verifies dashboard-section-tabs contains `key:'maturity'`.
- verifies hd20-six-nav-layout.js actually implements five-column CSS.
- added auth bootstrap fail-safe static contract.

## `hd20-five-area-integration.js`
- corrected `window.HD20_FIVE_AREA.areas` from the stale six-entry contract to `['dashboard','activity','advancement','audit','action']`.
- corrected Audit display number from ⑤ to ④.
- corrected Action display number from ⑥ to ⑤.
- maturity map remains a dashboard subtab and is not restored as a standalone main area.
- no canonical store, Supabase write, import, KPI, or production-data mutation path changed.

## Validation evidence
Run 35049442279:
- JavaScript syntax: PASS
- index references: PASS
- stale six-area IA assertion: FAIL.

Run 35050708482:
- JavaScript syntax: PASS
- index references: PASS
- five-area IA step: FAIL because `hd20-five-area-integration.js` still exposed `maturitymap` as a sixth area.

The integration contract has now been corrected and a new push-triggered validation cycle is required for final PASS confirmation.
