# Coding Log — Maturity Exact Return Visibility

Date: 2026-09-15

## Files
- `hd20-maturity-map-operational-guard.js`
- `final-layout-polish.js`

## Implementation
`restoreReturnFocus(given)` retains strict `Activity ID + team` candidate matching. After the exact candidate is resolved, it now checks `data-mmt-filter-hidden` before clearing `hd20MaturityMapReturnV1`.

When hidden, it resets `mmtFilter` and `mmtPriorityFilter` to `all`, reapplies the operational filter, and asks the priority-filter guard to set/apply `all`. A second hidden check is fail-closed: the function returns false and leaves return context intact.

Only after visibility is confirmed does it add `mmtReturnFocus`, scroll, and clear return context.

Loader cache bumped from `v=20260915-2` to `v=20260915-3` for the operational guard. Existing Action Audit Prefill path remains `action-audit-prefill-guard.js?v=20260912-2`.