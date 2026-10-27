# CODING LOG — 2026-09-16 — Five-area smoke alignment

## Changed files
- `.github/workflows/subtab-contract-grid-smoke.yml`
- `.github/workflows/browser-smoke.yml`

## Contract changes
- `expectedMain` => `['dashboard','activity','advancement','audit','action']`
- Dashboard selector standardized to `[data-dashboard-section]`.
- Dashboard expected keys => `['summary','execution','maturity','standard','field']`.
- subtab smoke: clicking `maturity` must make `HD20_DASHBOARD_TABS.active()==='maturity'`.
- browser smoke: removed direct `.beginnerNav button[data-key="maturitymap"]` round-trip.
- browser smoke: after returning to dashboard, click `[data-dashboard-section="maturity"]` and verify:
  - `HD20_DASHBOARD_TABS.active()==='maturity'`
  - `HD20_NAV.active()==='dashboard'`
  - `#hd20MaturityMapTab` is not hidden by Dashboard section filtering
  - no standalone `maturitymap` main-nav button exists
  - URL is not rewritten to `tab=maturitymap`
- Updated smoke architecture to five-area main IA + dashboard-owned maturity portfolio.

## Preserved contracts
- 8 operational subtabs.
- Purpose panel contract.
- Detail data grid.
- Mobile grid overflow.
- Advancement semantic assertions.
- Audit → Action exact ID/deadline linkage.
- Audit batch execution, close evaluation, Dashboard close-state verification.
- HDPS dashboard contract.
- No Production/Supabase write path changes.
