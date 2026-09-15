# 2026-09-16 Coding Log — Activity Pre-Import Impact

## Data Flow
`Excel → parse/map → strict date/required/duplicate validation → hd20-activity-import-preview → memory-only hypothetical merge → KPI impact Preview → explicit confirm → canonical write`

## 이벤트 계약
`hd20-activity-import-preview`
- ready: `{rows: validRows, meta:{state:'ready',file,total,months,teams}}`
- blocked/cancelled/error/applied: rows empty

## KPI Preview
- Production Canonical rows는 `HD20KPIData.isNonProdRow()` 필터 기준.
- 해당 연도 활동 건수 Before/After 계산.
- 기준 인원은 `HD20KPIData.headcount()` 사용.
- 예상 Canonical KPI = 해당 연도 Production Canonical 활동 / 기준 인원.
- 팀별 추가 예정 건수는 판정이 아닌 참고 Evidence로 표시.

## 안전성
- Preview rows는 메모리 변수에만 유지.
- Preview 이벤트 자체는 저장하지 않음.
- 확정 전 localStorage/Supabase write 없음.
- 기존 confirm write boundary 유지.
- forced empty server write 없음.