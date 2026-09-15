# Coding Log — 2026-09-15 Audit ID Integrity

## 신규 파일
`audit-id-integrity-guard.js`

## Contract
- store: `hd20AuditRandomDrawsV1`
- canonical key: `id || drawId || auditDrawId`
- `duplicates()` — 중복 Audit ID 목록
- `unique(id)` — 동일 canonical ID가 정확히 1건인지 확인
- `exact(id)` — 정확히 1건일 때만 row 반환, 그 외 null
- `validate()` — rows / duplicateIds / exactSafe 제공

## Loader
`final-layout-polish.js`에 `audit-id-integrity-guard.js?v=20260915-1` 추가.

## 안전성
기존 데이터를 임의 재번호화하지 않는다. 중복 상태를 숨기지 않고 ambiguous identity를 fail-closed하기 위한 기반 guard다. Supabase 및 서버 write 로직은 변경하지 않았다.