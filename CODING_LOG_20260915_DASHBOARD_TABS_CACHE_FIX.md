# CODING LOG — Dashboard Tabs Cache Fix

## Defect
Child loader was current but parent loader URL in `index.html` retained an older cache key.

## Change
- before: `final-layout-polish.js?v=20260915-maturity-showcase-7`
- after: `final-layout-polish.js?v=20260915-dashboard-tabs-8`

`final-layout-polish.js` currently loads `dashboard-section-tabs.js?v=20260915-2`.

## Invariants
No navigation key changes. No production data write changes. No Supabase changes. No forced empty write.
