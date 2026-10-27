# CODING LOG — 2026-09-15 — Action Subtab Deduplication

## 파일
- `action-subtab-dedupe-guard.js`
- `final-layout-polish.js`
- `index.html`

## 계약
`hd20-subtab-changed`에서 `area === 'action'`일 때 `manage`와 `verify` 역할을 분리한다.

- manage: `.amSummary`, `.amGrid`, `.amMaster`, 개선요청/개선조치/기한/기준정보 계열
- verify: `#hd20ActionVerifyStatus`, 효과검증/효과·재발/재발확인 계열
- 동적 렌더 후 `hd20-action-updated`, `hd20-audit-updated`, `hd20-refresh-requested`에서 재동기화

## 비회귀
- canonical metrics의 `action.manage` / `action.verify` 계산식 변경 없음
- `HD20_SUBNAV` contract 변경 없음
- Audit→Action exact ID trace 변경 없음
- Action 데이터 write 로직 변경 없음
- forced empty write 없음

## 캐시 체인
`action-subtab-dedupe-guard.js?v=20260915-1` → `final-layout-polish.js?v=20260915-action-subtab-dedupe-16`
