# CODING LOG — 2026-09-15 — Audit Subtab Deduplication

## 파일
- `audit-subtab-dedupe-guard.js`
- `final-layout-polish.js`
- `index.html`

## 계약
`hd20-subtab-changed`에서 `area === 'audit'`일 때 현재 sub에 맞춰 직접 자식 모듈을 분류한다.

- `audit`: `.auditDraw`, `.auditClosedLoop`, Audit 실시/체크리스트 계열 표시
- `retention`: `.audit6m`, `#hd20AuditCloseEvaluation`, 6개월/종료평가 계열 표시
- Lifecycle `.awAuditLane`은 retention에서만 표시
- 동적 렌더 후 `hd20-audit-draw`, `hd20-audit-updated`, `hd20-action-updated`에서 재동기화

## 비회귀
- `HD20_SUBNAV` contract 변경 없음
- Audit/Action exact ID trace 변경 없음
- Audit write/evaluation 로직 변경 없음
- Supabase write 변경 없음
- forced empty write 없음

## 캐시 체인
`audit-subtab-dedupe-guard.js?v=20260915-1` → `final-layout-polish.js?v=20260915-audit-subtab-dedupe-15`
