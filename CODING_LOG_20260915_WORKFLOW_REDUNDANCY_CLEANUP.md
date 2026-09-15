# CODING LOG — 2026-09-15 — Workflow Redundancy Cleanup

## 변경 파일
- `activity-subtab-dedupe-guard.js`
- `advancement-subtab-dedupe-guard.js`
- `final-layout-polish.js`
- `index.html`

## 제거
1. `activity-subtab-dedupe-guard.js`가 매번 생성하던 `[data-hd20-activity-analysis-note]`를 더 이상 생성하지 않으며 기존 DOM에 남아 있으면 제거한다.
2. `advancement.standard`에서 `#pcInsight`의 고정 대체 문구를 생성하지 않고 해당 insight 자체를 숨긴다. `judge` 복귀 시 원래 insight는 다시 표시한다.

## 캐시 체인
- `activity-subtab-dedupe-guard.js?v=20260915-2`
- `advancement-subtab-dedupe-guard.js?v=20260915-2`
- `final-layout-polish.js?v=20260915-workflow-cleanup-19`

## 비회귀
테이블 원천, KPI 판정, official confirmation, Audit/Action ID, write path 변경 없음.
