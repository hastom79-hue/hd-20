# CODING LOG — Dashboard Grouping Validation

## dashboard-section-tabs.js
4-group prototype를 3-group information architecture로 정리했다.

- summary: `#hd20DashboardPriority` + `.cards`
- execution: `.mainGrid` + `#hd20OperationalBridge`
- standard: `.bottomGrid`

## State rules
- default active = `summary`
- Dashboard main-tab click => `reset()` => summary
- browser pageshow while Dashboard active => summary
- `apply()`는 모든 dashboard target을 먼저 hide 후 선택 group만 show
- 관련 `.hd20DashboardSectionLabel`도 동일하게 hide/show

## Cache
`final-layout-polish.js` loader를 `dashboard-section-tabs.js?v=20260915-2`로 갱신.

## Invariants
canonical six-area navigation 유지, KPI source/write 로직 미변경, Supabase 미변경, forced empty write 없음.
