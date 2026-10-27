# CODING LOG — 2026-09-15 — Activity Subtab Deduplication

## 변경 파일
- `activity-subtab-dedupe-guard.js`
- `final-layout-polish.js`

## 구현 계약
`hd20-subtab-changed`에서 `area === 'activity'`일 때만 동작한다.

- `sub === 'manage'`: `[data-live-activity]` 원천표 표시, 분석 안내 숨김
- `sub === 'analysis'`: 동일 원천표 숨김, 분석 안내 표시
- 기존 KPI DOM은 유지하여 실적분석의 집계 판단 기능은 보존
- `HD20_SUBNAV`, Activity 저장, 후보/확정 판정, Exact ID trace를 수정하지 않음

## 캐시
`final-layout-polish.js` child token: `activity-subtab-dedupe-guard.js?v=20260915-1`

## 불변조건
- 운영 데이터 mutation 없음
- Supabase write 변경 없음
- forced empty write 없음
