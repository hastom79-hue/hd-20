# HD-20 월별 5S 운영실적 Excel Import 개발일지 — 2026-09-16

## 목적
실제 월별 5S 운영실적 Excel을 웹에 넣기 위한 안전한 1차 E2E 입력 경로를 구축한다.

## 반영
- `activity-excel-preview-import.js` 신규
- ② 활동관리 상단에 `월별 5S 운영실적 Excel Import` 추가
- xlsx/xls/csv 지원
- 필수 컬럼: 활동일 / 생산팀 / 5S구분 / 문제점 / 개선내용
- 선택 컬럼: 작업장 / 상태
- 날짜 형식, 필수값, 파일 내부 중복, 기존 Production 운영데이터 중복 검증
- 대상월과 생산팀 수를 Preview에서 표시
- 오류/중복이 1건이라도 있으면 전체 확정 반영 차단
- 파일 선택/Preview 단계에서는 Canonical Store write 없음
- 사용자 최종 확인 후에만 `hd20GMES5SAutoImproveRawV1`에 `source=excel-import`로 저장
- 저장 후 `hd20-gmes-5s-imported` 및 `HD20KPIData.signal()` 호출
- `index.html`에 `activity-excel-preview-import.js?v=20260916-1` 로드 추가

## 안전 원칙
기존 demo/test/E2E 데이터는 중복 기준 Production 데이터로 취급하지 않는다. 임의 샘플 운영실적을 생성하지 않는다. 서버 강제 empty write를 추가하지 않는다.

## 다음
확정 반영 전 Preview에 KPI/Trend 영향 분석과 취약팀/이상징후 요약을 추가하고, 그 분석결과를 메일 미리보기로 넘기는 단계로 확장한다.
