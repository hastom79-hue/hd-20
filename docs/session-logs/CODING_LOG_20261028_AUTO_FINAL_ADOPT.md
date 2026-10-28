# Coding Log — 2026-10-28 — Auto-select Final Adoption

## Change
- Updated \`hd20-direct-criteria.js\` so the final-adoption checkbox is automatically checked for master users whenever at least one of the three advancement criteria is selected.
- Automatically clears final adoption when all three criteria are unchecked; binds checkbox changes back to the same rule so the checkbox cannot drift from the criterion count.
- Preserved the master-only visibility/permission gate.
- Bumped the script cache key in \`index.html\`.
- Added JavaScript syntax and regression assertions to \`.github/workflows/maturity-theme-regression.yml\`.
- Updated development log and developer guide.
- Dashboard and existing dashboard aggregation are unchanged.

## Rule
- 0/3 selected: not satisfied; final adoption unchecked.
- 1/3, 2/3, or 3/3 selected: satisfied; final adoption automatically checked for master users.
