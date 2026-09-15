# CODING LOG — 2026-09-16 — Five-area smoke alignment

## Changed file
`.github/workflows/subtab-contract-grid-smoke.yml`

## Contract changes
- `expectedMain` => `['dashboard','activity','advancement','audit','action']`
- Dashboard selector standardized to `[data-dashboard-section]`.
- Dashboard expected keys => `['summary','execution','maturity','standard','field']`.
- Added assertion that clicking `maturity` makes `HD20_DASHBOARD_TABS.active()==='maturity'`.
- Removed direct `.beginnerNav button[data-key="maturitymap"]` assertion.
- Updated PASS text to five-area architecture.

## Preserved contracts
- 8 operational subtabs.
- Purpose panel contract.
- Detail data grid.
- Mobile grid overflow.
- No Production/Supabase write path changes.
