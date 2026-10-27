# Coding Log — 2026-09-16 Excel KPI / Evidence

## Files
- `activity-import-analysis-mail-preview.js`
- `index.html`

## Code changes
- `summary()` now obtains canonical headcount via `window.HD20KPIData.headcount(all)`.
- Computes `perPerson` and previous-month per-person values only with a valid headcount.
- Builds `evidence` from current-month confirmed `excel-import` rows; each item retains canonical ID/date/team/type/problem.
- Analysis UI now exposes headcount, per-person KPI and expandable evidence table.
- Mail preview includes headcount/per-person KPI and up to 20 evidence IDs.
- Missing target remains explicitly unclassified; no synthetic achievement/miss status.
- Existing union-of-current-and-previous team comparison is preserved, including teams that fell to zero.

## Cache
- `activity-import-analysis-mail-preview.js?v=20260916-kpi-evidence-3`

## Write/send behavior
- This analysis module performs no Canonical Store write.
- This module performs no automatic mail send; it only opens a user-confirmed `mailto:` draft.