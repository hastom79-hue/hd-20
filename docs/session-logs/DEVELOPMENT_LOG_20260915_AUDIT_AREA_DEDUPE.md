# DEVELOPMENT LOG — 2026-09-15 — 진단·유지 영역 중복 정리

## 목적
⑤ 진단·유지 화면에서 상위 통합 Area Header와 실제 Audit Hero가 `유지·Audit` 의미를 중복 표시하던 구조를 제거하고, 6개 Canonical Navigation의 명칭/번호와 실제 업무 화면을 일치시킨다.

## 변경
- `hd20-five-area-integration.js`
  - Audit 화면에 추가하던 별도 `SUSTAINABILITY / 유지·Audit` Area Header를 제거한다.
  - 기존에 삽입된 Audit Area Header가 있으면 refresh 시 제거한다.
  - 실제 `awAudit` Hero를 Canonical 제목 `⑤ 진단·유지`로 정규화한다.
  - 설명을 `Risk 기반 대상 추출 → 실제 Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 종료평가` 단일 흐름으로 정리한다.
  - `data-canonical-area="diagnosis-retention"`을 부여한다.
  - `HD20_FIVE_AREA.areas`를 현재 6개 Canonical IA에 맞게 maturitymap 포함으로 정정한다.
- `final-layout-polish.js`
  - `hd20-five-area-integration.js?v=20260915-audit-dedupe-2`로 child cache 갱신.
- `index.html`
  - `final-layout-polish.js?v=20260915-audit-dedupe-12`로 parent cache 갱신.

## 보존한 운영 계약
- Risk 가중 랜덤 대상 추출 로직 변경 없음.
- Audit 실제 실시일 D-Day 기준 변경 없음.
- 달력 기준 +6개월 지속관리/종료평가 로직 변경 없음.
- Audit/Action ID, Trace, Supabase/localStorage write 변경 없음.
- server-side forced empty write 추가 없음.

## 검증
- `activity-workflow.js`의 Audit 상태 4단계는 `Audit 실시 대기 / 6개월 관리중 / 종료평가 대기 / 종료평가 완료`로 유지됨.
- `workflow-area-density.css`의 lifecycle semantic contract는 `대상 추출 → 실제 Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 종료평가` 그대로 유지됨.
- 이번 변경은 중복 Header 제거와 Canonical 명칭 정규화에 한정한다.
