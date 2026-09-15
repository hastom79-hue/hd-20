# HD-20 Coding Log — 2026-09-16 Zero-Team Comparison Fix

## 변경
- `activity-import-analysis-mail-preview.js`: current month Map + previous month Map의 key union으로 팀 비교행 생성.
- `drops`: `prev > 0 && delta < 0` 조건으로 당월 0건 팀까지 탐지.
- 미사용 `zeroPrev` 계산 제거.
- UI의 `활동팀` 표현을 `비교팀`으로 정정하여 당월 0건/전월 활동팀도 포함됨을 명확히 함.
- `index.html`: cache `v=20260916-2`.

## 검증 경계조건
전월 A팀 3건, 당월 A팀 0건이면 A팀은 비교표 `0 / 3 / -3`, 감소팀 1건으로 집계되어야 한다.