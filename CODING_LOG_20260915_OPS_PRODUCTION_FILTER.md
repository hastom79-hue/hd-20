# CODING LOG — 2026-09-15 — OPS Production Filter

## 파일
- `hd20-ops-production-filter-guard.js`
- `final-layout-polish.js`

## 계약
`HD20_OPS_V2.metrics(area, sub)`가 사용하는 Activity/Audit/Action 배열은 모두 `HD20KPIData.isNonProdRow(row) !== true`인 행만 포함한다.

필터 대상은 기존 canonical 판정과 동일하게 demo/test/E2E/legacy test seed를 포함한다. KPI Evidence의 production-only 정책과 운영 KPI bar의 정책을 일치시킨다.

## Loader
`final-layout-polish.js`에 `hd20-ops-production-filter-guard.js?v=20260915-1` 추가.

## 비회귀
KPI 명칭/순서/단위, Audit↔Action exact ID, 판정 기준, 데이터 write는 변경하지 않는다.
