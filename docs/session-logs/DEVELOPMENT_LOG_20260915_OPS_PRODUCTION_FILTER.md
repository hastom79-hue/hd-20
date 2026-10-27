# DEVELOPMENT LOG — 2026-09-15 — OPS Production Filter

## 발견
`dashboard-kpi-source.js`와 KPI Evidence는 demo/test/E2E 행을 제외하지만 `hd20-ops-v2.js`의 운영 KPI 집계 read 경로는 원천 배열을 그대로 사용하고 있었다. 이 상태에서는 E2E fixture 또는 showcase 성격의 비운영 행이 업무영역 KPI에 섞일 위험이 있다.

## 조치
`hd20-ops-production-filter-guard.js`를 추가해 `HD20_OPS_V2.metrics()`를 production-only 집계로 교체했다.
- `HD20KPIData.isNonProdRow()`를 단일 판정 기준으로 재사용
- Activity / Audit / Action 모두 동일 필터 적용
- Activity, Advancement, Audit, Action의 기존 KPI 명칭·순서·단위를 유지
- Exact ID, CRUD, Supabase/localStorage write 경로는 변경하지 않음

## 안전
읽기/집계 전용이다. 데이터 삭제·수정 및 forced empty write 없음.
