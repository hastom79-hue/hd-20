# 2026-09-16 Coding Log — Activity Import Canonical KPI

## 변경 파일
- `activity-import-analysis-mail-preview.js`
- `index.html`

## 핵심 로직
`Production Canonical rows → 대상연도 전체 활동 → headcount → 공식 per-person KPI`

별도 참고 분석:
`Production Excel Import rows → 최신월/전월 → 팀별 count/delta`

## 정합성
- `HD20KPIData.yearOf()` 사용.
- `HD20KPIData.headcount()` 사용.
- `HD20KPIData.isNonProdRow()` 필터 유지.
- Import-only 월별 수치를 공식 KPI로 표시하지 않음.
- 메일 Preview 문구도 동일한 산식/범위로 통일.

## 캐시
`activity-import-analysis-mail-preview.js?v=20260916-canonical-kpi-4`

## 안전성
- 신규 localStorage write 없음.
- 기존 Excel confirm write boundary 변경 없음.
- Supabase sync 로직 변경 없음.
- 서버 측 forced empty write 없음.