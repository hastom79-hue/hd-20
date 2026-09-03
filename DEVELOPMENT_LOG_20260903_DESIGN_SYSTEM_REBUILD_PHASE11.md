# HD-20 Design System Rebuild — Phase 11
Date: 2026-09-03

## 목적
Phase 10 stylesheet chain 정리 이후 Dashboard group 전용 시각 contract가 canonical CSS에 실제 포함되기 전에 파일 로딩만 제거된 상태를 점검하고, 화면 회귀를 방지한다.

## 반영
- `dashboard-priority-groups.css`의 기존 Dashboard group/density 규칙을 저장소에 복구.
- `index.html`에서 해당 stylesheet를 다시 로드하도록 복구.
- cache key: `dashboard-priority-groups.css?v=20260903-contract-restore-1`.
- Dashboard priority group의 3-domain 배치, KPI density, main/side/bottom grid responsive contract를 원복.

## 판단
Phase 10 문서에는 Dashboard 규칙이 `hd20-five-area.css`로 흡수되었다고 기록되었으나 실제 파일 내용에는 `hd20DashboardPriorityGroups`/`hd20HealthGroup` 규칙이 존재하지 않았다. 파일 삭제를 그대로 유지하면 Dashboard 시각정보 계층이 약화될 수 있으므로, 물리 통합 전에 기능·표현 보존을 우선했다.

## 업무 로직 영향
없음. KPI 산식, 고도화 3조건, 공식판정, Audit Risk 랜덤 추출, Audit 후 6개월 지속관리, 개선조치 Deadline 및 canonical store는 변경하지 않았다.

## 다음 단계
`dashboard-priority-groups.css`를 단순 삭제하지 않고 실제 규칙을 `hd20-five-area.css`에 병합한 뒤 회귀검증을 통과한 경우에만 파일을 제거한다. 이후 `workflow-area-density.css`도 같은 방식으로 단계적 흡수한다.
