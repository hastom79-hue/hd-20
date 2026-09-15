# HD-20 월별 5S 운영실적 Excel Import 코딩로그 — 2026-09-16

## 변경
- 신규 `activity-excel-preview-import.js`
- `index.html` 로드 연결

## 데이터 흐름
`File → read/mapRows → analyze → Preview → confirm → apply → hd20GMES5SAutoImproveRawV1 → hd20-gmes-5s-imported → KPI signal`

## 검증 로직
- 헤더 자동 탐색: 활동일/일자/날짜/등록일, 생산팀/팀/소속팀/부서, 5S구분/구분/활동유형/유형, 문제점 계열, 개선내용 계열
- 날짜는 YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYYMMDD 정규화
- 동일 파일 내 `일자+팀+유형+문제점+개선내용` 중복 차단
- 기존 Canonical Production row와 동일 signature 중복 차단
- `HD20KPIData.isNonProdRow()`가 true인 demo/test/E2E row는 운영 중복 기준에서 제외

## Write boundary
`apply()`는 Preview 정상 + 오류 0 + 사용자 confirm 이후에만 실행한다. Import row에는 `source:'excel-import'`, `importedAt`을 기록한다. 후보/공식판정은 Import가 임의 생성하지 않고 false/미확정에서 시작한다.

## Cache
`activity-excel-preview-import.js?v=20260916-1`
