# HD-20 Development Log — 2026-09-16 Activity Excel Calendar Guard

## 목적
월별 5S 운영실적 Excel Import Preview Gate의 날짜 검증을 단순 문자열 형식 검증에서 실제 달력 유효성 검증으로 강화한다.

## 반영
- `YYYY-MM-DD`, `YYYY/MM/DD`, `YYYY.MM.DD`, `YYYYMMDD` 입력을 정규화한다.
- 연도 2000~2100, 월 1~12, 일 1~31 1차 범위를 확인한다.
- UTC 달력 재검증으로 `2026-02-29`, `2026-02-31`, `2026-04-31` 등 존재하지 않는 날짜를 거부한다.
- 잘못된 날짜는 `활동일 오류(실제 달력 날짜 확인)`으로 Preview에 표시한다.
- 날짜가 잘못된 행은 중복키 계산 대상에서 제외하여 빈 날짜키 충돌을 방지한다.
- 오류 행이 하나라도 있으면 기존 Preview Gate 정책대로 전체 확정 반영을 차단한다.
- 파일 선택/Preview 단계에서는 Canonical Store를 변경하지 않는다.
- 서버 측 강제 empty write는 추가하지 않았다.

## Cache
`activity-excel-preview-import.js?v=20260916-calendar-2`

## 다음 검증
운영실적 Excel의 분석 Preview를 KPI/Trend/팀별 미달·이상징후 및 메일 Preview까지 연결한다.