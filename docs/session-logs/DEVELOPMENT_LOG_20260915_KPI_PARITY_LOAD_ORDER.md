# HD-20 KPI parity load-order fix — 2026-09-15

## 발견
`hd20-ops-production-filter-guard.js`가 `HD20_OPS_V2.metrics`를 production-only 함수로 교체한 뒤, 이미 `hd20-kpi-parity-guard.js`가 `__evidenceParityPatched=true`를 설정한 상태이면 Evidence parity wrapper가 다시 적용되지 않을 수 있는 로드 순서 경쟁을 확인했다.

## 조치
Production filter가 metrics를 교체할 때 기존 parity patched flag를 해제하고 `HD20_KPI_PARITY_GUARD.patchApi()` 및 `schedule()`을 재호출하도록 변경했다.

## 보존
- demo/test/E2E 운영 KPI 제외
- KPI ↔ Evidence 행수 parity
- Audit/Action Exact ID
- Supabase write 경로 및 forced-empty-write 금지
- 운영 데이터 mutation 없음

## 검증
Production filter와 Evidence parity가 어떤 로드 순서에서도 순차적으로 재결합되는 정적 계약을 확인했다.