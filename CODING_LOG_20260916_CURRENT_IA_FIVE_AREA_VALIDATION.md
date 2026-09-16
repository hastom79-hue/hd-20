# CODING LOG — Current IA Five-Area Validation

## Date
2026-09-16

## File
`.github/workflows/current-ia-smoke.yml`

## Canonical contract
- Main: `dashboard, activity, advancement, audit, action`
- Dashboard: `summary, execution, maturity, standard, field`
- Standalone `maturitymap` main-nav contract removed.
- Dashboard maturity selection is tested through `HD20_DASHBOARD_TABS.apply('maturity')`.
- Main round-trip only tests the five canonical top-level areas.

## Non-regression
- desktop/mobile viewport coverage retained.
- dashboard isolation checks retained.
- pageerror/404/horizontal overflow checks retained.
- application storage and Supabase code untouched.
