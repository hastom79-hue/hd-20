# CODING LOG — Dashboard Showcase Group Fix

## dashboard-section-tabs.js
summary targets:
`['#hd20DashboardPriority','.cards','#hd20FieldShowcaseBootstrap']`

동적 생성되는 showcase가 allTargets/apply 및 unseen MutationObserver 계약에 들어가도록 수정했다. 이로써 execution/standard에서 showcase 잔상이 남지 않는다.

## Cache chain
- `final-layout-polish.js`: dashboard section loader `v=20260915-3`
- `index.html`: final layout loader `v=20260915-dashboard-tabs-9`

## Invariants
canonical 6-area nav 유지. showcase는 visual-only이며 KPI/Supabase 합산 없음. 데이터 write 로직 변경 없음. server-side forced empty write 없음.
