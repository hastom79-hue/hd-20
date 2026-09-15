# CODING LOG — Dashboard Dedup / Regroup

## dashboard-section-tabs.js
4개 세부 그룹으로 역할 분리:
- summary: `#hd20DashboardPriority`, `.cards`
- execution: `.mainGrid`, `#hd20OperationalBridge`
- standard: `.bottomGrid`
- field: `#hd20FieldShowcaseBootstrap`

현장 샘플이 summary/execution/standard에 누출되지 않도록 독립 visibility contract 적용.

## dashboard-operational-bridge.js
중복 지표 제거 후 `종료평가 · 유지`, `종료평가 · 미흡`만 렌더. demo/test fixture 제외 필터 추가.

## regression
`current-ia-smoke.yml`, `dashboard-canonical-smoke.yml`을 4그룹 계약으로 갱신하고 field isolation 및 bridge duplicate 문자열 부재를 검사.

## cache chain
- `dashboard-operational-bridge.js?v=20260915-dedupe-2`
- `dashboard-section-tabs.js?v=20260915-regroup-6`
- parent `final-layout-polish.js?v=20260915-dashboard-regroup-10`

데이터 mutation 로직 미변경.
