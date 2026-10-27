# Coding Log — 2026-09-15 Audit Trace Fail-Closed

## `audit-id-integrity-guard.js`
추가 contract:
- `sourceId(action)` = `auditDrawId || sourceCaseId`
- `exact(id, rows)` = canonical Audit ID exact match count === 1 only
- `auditForAction(action, audits)` = unique exact row or null
- `patchTraceApi()` = Trace public API의 Audit 역참조를 fail-closed contract로 교체

## Loader
`final-layout-polish.js`:
- `audit-id-integrity-guard.js?v=20260915-1`
- → `audit-id-integrity-guard.js?v=20260915-2`

## 안전성
중복 ID를 첫 행으로 임의 선택하지 않는다. 데이터 재번호화/삭제 없음. 서버 write 및 Supabase sync 로직 변경 없음.