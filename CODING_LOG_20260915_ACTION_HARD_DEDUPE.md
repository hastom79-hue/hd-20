# CODING LOG — 2026-09-15 — Action Subtab Hard Dedupe

## 파일
- `action-subtab-dedupe-guard.js`
- `final-layout-polish.js`
- `index.html`

## 계약
`action.manage`
- native Action source summary/grid/master/recent/cases/register 표시
- `#hd20ActionVerifyStatus` 숨김

`action.verify`
- `#hd20ActionVerifyStatus` 표시
- native Action source summary/grid/master/recent/cases/register 숨김

`hd20-action-verify-canonical-guard.js`의 production-only 집계/효과검증/재발 계산은 변경하지 않는다.

## 캐시 체인
- child: `action-subtab-dedupe-guard.js?v=20260915-2`
- parent: `final-layout-polish.js?v=20260915-action-hard-dedupe-18`

업무 데이터 mutation 없음.
