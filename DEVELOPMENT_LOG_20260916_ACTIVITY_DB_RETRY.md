# HD-20 Development Log — 2026-09-16 Activity DB Retry

## 목적
월별 5S 운영실적 Excel 확정 반영 이후 DB 동기화 오류 또는 readiness 미완료 상태에서 사용자가 현재 화면에서 복구할 수 있도록 한다.

## 변경
- activity-import-db-readiness-guard.js에 `DB 재동기화` 제어 추가.
- DB readiness 미완료로 확정 반영이 차단될 때 재동기화 버튼 노출.
- DB push 오류 시 재동기화 버튼 노출.
- DB ready 복귀 시 버튼 자동 숨김.
- `HD20_DB_SYNC.manualSync()`만 사용하며 서버 강제 빈 값 쓰기 로직은 추가하지 않음.
- index.html cache token을 `20260916-retry-2`로 갱신.

## 안전성
- Excel Preview 단계의 무쓰기 원칙 유지.
- DB 준비 전 확정 반영 차단 유지.
- Canonical Store 반영과 DB 반영 상태를 분리 표시.
- 자동 메일 발송 없음.
