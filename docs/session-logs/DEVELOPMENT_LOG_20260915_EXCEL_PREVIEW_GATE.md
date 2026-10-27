# HD-20 Excel Preview Gate 개발일지 — 2026-09-15

## 목적
Excel/CSV 파일 선택 즉시 운영 기준정보가 변경되던 위험을 제거하고 `파일 선택 → 구조/행 검증 → 미리보기 → 사용자 확인 → 확정 반영` 순서를 강제한다.

## 반영
- `team-leader-excel-import.js`
  - xlsx/xls/csv 기존 지원 유지
  - 생산팀/생산팀장/이메일 필수값 검증
  - 이메일 형식 검증
  - 파일 내 생산팀 중복 검출
  - 기존 기준정보 대비 신규/수정/변경없음 집계
  - 최대 100행 미리보기
  - 오류/중복 존재 시 확정반영 버튼 차단
  - 파일 선택/검증 단계에서는 localStorage write 없음
  - 확정반영 전 confirm 추가
- `index.html`
  - `team-leader-excel-import.js?v=20260915-preview-gate-4` 캐시 갱신

## 불변조건
- 검증 전/미리보기 단계에서 운영 데이터 write 금지
- 서버 강제 empty write 추가 금지
- 실제 메일 발송은 별도 사용자 확인 절차 유지

## 다음
월별 운영실적 Excel Import에도 동일 Preview Gate 패턴을 적용하고 KPI/Trend/이상징후 분석 미리보기와 Evidence 연결을 추가한다.
