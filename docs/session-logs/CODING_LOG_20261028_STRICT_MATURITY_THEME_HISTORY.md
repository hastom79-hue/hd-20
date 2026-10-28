# Coding Log — 2026-10-28
## Scope
HD-20: prevent inflated official maturity case counts and preserve theme-audit history.

## Changes
1. `maturity-team-case-drilldown.js`
   - Aligned the team drilldown filter with the official count filter.
   - Requires confirmed flag, official judge state = `확정`, explicit final-adoption flag (`finalAdopted` or `advancementAdopted`), explicit criteria data, and all three criteria matched.
   - Prevents the detail panel from showing cases excluded from the official map count.

2. `theme-inspection.js`
   - Changed same-line/same-month audit saves from overwrite-in-place to append-only history records.
   - The checklist loads the latest audit for the selected line and month.
   - Monthly KPI uses only the latest record per line, so multiple audit attempts do not inflate the number of audited lines.
   - Existing saved audit records are not migrated, deleted, or overwritten by this code change.

3. `index.html`
   - Bumped cache keys for the updated maturity drilldown and theme-inspection scripts.

4. `DEVELOPMENT_LOG.md`
   - Added the change summary and validation limitations.

## Static checks
- Verified each target snippet existed before replacement.
- Verified the stricter team drilldown predicate is present.
- Verified theme history uses append-only `push`, and latest-record selection is used for the checklist and monthly KPI.
- Verified both cache keys are updated.

## Not yet verified
- Browser end-to-end behavior on GitHub Pages.
- Audit history display against actual user browser localStorage data.
- Full regression across theme inspection, action creation/deduplication, and official maturity case drilldown.
- Do not merge/deploy until these checks pass.

5. Historical month consistency
   - Theme Audit-generated action records now store `auditMonth` from the selected month.
   - Month options, matrix grouping, KPI counts, and duplicate prevention use `auditMonth` first and fall back to legacy `createdAt`/`date` for existing records.
   - Added CI assertions for the selected-month grouping contract.
