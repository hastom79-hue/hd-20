# DEVELOPMENT LOG — 2026-09-15 — Activity Subtab Deduplication

## 목적
② 활동관리의 `활동관리`와 `실적분석`이 동일한 개별 원천 활동표를 상시 중복 노출하지 않도록 역할을 분리한다.

## 확인
`hd20-subtabs.js`의 기존 `applyActivity()`는 두 서브탭 모두 `.awGrid`와 전체 카드/표를 표시하고 등록폼만 토글했다. 따라서 `실적분석`에서도 `활동관리`의 개별 개선이력 표가 그대로 반복됐다.

## 반영
- 신규 `activity-subtab-dedupe-guard.js`
- `활동관리`: 개별 원천 개선이력 표 유지
- `실적분석`: 개별 원천표 숨김, 기존 집계 KPI 유지
- 실적분석에는 개별 원천은 `활동관리` 또는 `상세 데이터 그리드`에서 확인한다는 안내 표시
- `hd20-subtab-changed` 이벤트 기반으로 기존 navigation/Exact ID 흐름을 변경하지 않음

## 안전
데이터 읽기/쓰기, Activity ID, 후보판정, Supabase sync 로직은 변경하지 않았다. server-side forced empty write 없음.

## 캐시
`final-layout-polish.js`가 `activity-subtab-dedupe-guard.js?v=20260915-1`을 동적 로드하도록 추가했다.
