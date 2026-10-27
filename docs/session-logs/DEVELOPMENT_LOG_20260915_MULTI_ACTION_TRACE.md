# DEVELOPMENT LOG — 2026-09-15 Multi Action Trace

## 목적
Audit 1건에 개선조치 Action이 여러 건 연결되는 경우에도 Case 추적 화면에서 Action 누락이 발생하지 않도록 exact Audit ID 기반 1:N 추적 계약을 보강한다.

## 확인된 문제
`audit-action-case-trace.js`의 기존 `linkedAction()`은 `Array.find()`를 사용해 동일 Audit ID에 연결된 첫 Action 1건만 반환했다. Production Trace Guard는 이미 1:N을 처리하지만, 이 보조 추적 모듈을 다시 사용하거나 호출하는 경우 나머지 Action이 누락될 수 있었다.

## 변경
- `linkedActions(draw, actions)` 추가: `auditDrawId || sourceCaseId`와 Audit `id || drawId || auditDrawId`가 정확히 같은 Action 전체를 반환한다.
- `linkedAction()`은 하위 호환용으로 유지하되 `linkedActions()[0]`만 반환한다.
- `rows()`를 `flatMap()` 기반으로 변경하여 Audit 1건에 N개 Action이면 N개 추적 row를 만든다.
- Action이 0건인 Audit은 기존처럼 `action:null` row 1개를 유지한다.
- 공개 API에 `linkedActions`를 추가했다.

## Maturity Return 재검증
`hd20-maturity-map-operational-guard.js`의 복귀 로직은 현재 저장된 `team + Activity ID`를 동시에 사용하며 후보가 정확히 1건일 때만 복귀 포커스를 확정한다. 불일치/중복 시 임의 첫 항목으로 이동하지 않고 return context를 유지한다. 이 최신 guard가 브라우저 캐시에 막히지 않도록 `final-layout-polish.js`의 operational guard 버전을 `v=20260915-2`로 갱신했다.

## 불변조건
- 팀명/작업장 유사도 기반 Audit 추정 연결 금지.
- Demo/E2E 제거 및 Production Trace Guard의 production-only 정책 변경 없음.
- 종료평가 판정 규칙 변경 없음.
- Supabase 동기화 로직 변경 없음.
- 서버측 forced empty write 도입 없음.

## 커밋
- Multi Action Trace: `80a8a1a7b18966534ecc4f2f99a72acaf2b055a4`
- Maturity guard cache refresh: `cd6c5e3a7cda8340cb11d255b497e78a3114aba0`
