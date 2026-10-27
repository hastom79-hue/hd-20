# Development Log — 2026-09-15 Audit Trace Fail-Closed

잔여위험 1순위인 Exact Trace의 ambiguous Audit 첫 행 선택 위험을 단계적으로 제거했다.

- `audit-id-integrity-guard.js`의 `exact(id, rows)`는 canonical Audit ID가 정확히 1건일 때만 row를 반환한다.
- `auditForAction(action, audits)`를 추가하여 `auditDrawId || sourceCaseId`를 exact Audit ID로 사용하고 0건/2건 이상이면 null로 fail-closed한다.
- Trace public API(`HD20_TRACE_PRODUCTION`, `HD20_TRACE_EXACT`)의 `auditForAction`을 integrity contract로 보정한다.
- loader ordering에 대비해 boot/microtask/0ms/250ms 및 Audit/Action update 이벤트에서 API contract를 재적용한다.

기존 Audit 데이터를 임의 수정/삭제하지 않으며 서버 강제 empty write, Supabase 저장정책, production-only 필터는 변경하지 않았다.

잔여: `hd20-trace-production-guard.js` 내부 lexical `auditForAction()` 자체는 구형 `.find()` 구현이므로, 대형 원본의 안전한 직접 치환 또는 내부 호출까지 차단하는 다음 단계 검증을 계속한다.