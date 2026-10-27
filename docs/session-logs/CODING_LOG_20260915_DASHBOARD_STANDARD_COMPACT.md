# CODING LOG — Dashboard Standard / Trend Compact

## dashboard-section-tabs.js
`hd20DashboardStandardActive` scoped CSS 추가.

- `.bottomGrid`: desktop 0.9fr / 1.1fr
- compact `.cardHead`, `.cardBody`, `.criteria`, `.crit`
- `.trendBox` desktop min-height 250px
- <=1100px single column
- <=760px trend min-height 220px and reduced padding

## Cache
`final-layout-polish.js`에서 `dashboard-section-tabs.js?v=20260915-5`로 갱신.

## Safety
표현 계층만 변경. 데이터 mutation / KPI formula / canonical store / Supabase sync 미변경.
