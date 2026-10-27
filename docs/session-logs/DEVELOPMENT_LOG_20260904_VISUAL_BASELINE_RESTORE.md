# HD-20 Visual Baseline Restore
Date: 2026-09-04

## 사유
Phase 12~17의 stylesheet consolidation 이후 실제 사용자 관점에서 디자인과 화면 구성이 전반적으로 무너졌다는 피드백이 발생했다. 코드 구조 단순화보다 실제 화면 품질을 우선하기 위해 추가 통합을 즉시 중단했다.

## 복원 기준
마지막으로 독립 stylesheet 계층이 유지되면서 안정적으로 사용되던 Phase 11 presentation baseline (`744edcc316456a5abc77e44366b6d3d364a9209a`)을 기준으로 표현 계층을 복원했다.

## 복원 항목
- `hd20-overhaul.css` → Phase 11 stable foundation 복원
- `hd20-five-area.css` → Phase 11 five-area layout 복원
- `dashboard-priority-groups.css` 재생성
- `workflow-area-density.css` 재생성
- `index.html` stylesheet chain을 6-layer stable stack으로 복원
- Design Layout Smoke의 stylesheet contract를 복원된 stack에 맞게 수정

## 유지한 최신 기능
표현 계층만 롤백했다. 아래 업무기준과 최신 기능은 유지한다.
- 5개 IA
- 운영 KPI 6종
- 고도화 3조건 및 공식판정 분리
- 라인명 free-text 추론 금지
- Risk 가중 랜덤 Audit
- Audit 실시일부터 달력 기준 +6개월 지속관리 및 종료평가
- 개선조치 등록일 기준 7~14일 Deadline 정책
- canonical stores 및 현재 JS 업무로직

## 현재 원칙
시각 검증 없이 CSS 병합/삭제를 재개하지 않는다. 다음 작업은 코드 정리보다 화면별 구성과 정보계층을 먼저 점검하며, 실제 보이는 결과를 기준으로 수정한다.
