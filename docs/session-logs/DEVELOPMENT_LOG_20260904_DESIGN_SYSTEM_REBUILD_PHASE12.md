# HD-20 Design System Rebuild — Phase 12
Date: 2026-09-04

## 목적
Phase 11에서 복구한 Dashboard group contract를 실제 canonical stylesheet로 흡수한 뒤에만 보조 stylesheet를 제거한다.

## 선행 검증
Phase 11 HEAD `744edcc316456a5abc77e44366b6d3d364a9209a` 기준 GitHub Actions에서 failure run 0건을 확인하고 다음 작업을 진행했다.

## 반영
- `dashboard-priority-groups.css`의 Dashboard group/guide/KPI density/mainGrid/sideStack/bottomGrid/responsive 규칙을 `hd20-five-area.css`로 실제 병합.
- 기존 전역 `.hd20HealthKpi:nth-child(...)` border 규칙은 Dashboard flat grid에만 적용되도록 `.hd20DashboardPriorityGrid > .hd20HealthKpi...`로 범위를 좁혀 group grid와의 충돌 가능성을 줄임.
- `index.html`에서 `dashboard-priority-groups.css` link 제거.
- `hd20-five-area.css` cache key를 `20260904-dashboard-groups-1`로 갱신.
- 병합 완료 후 `dashboard-priority-groups.css` 물리 삭제.

## 업무 로직 영향
없음. KPI 산식, 고도화 3조건, 공식판정, Audit Risk 랜덤 추출, Audit 후 6개월 지속관리, 개선조치 Deadline 정책 및 canonical stores는 변경하지 않았다.

## 현재 stylesheet chain
1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `workflow-area-density.css`
5. `maturity-condition-analysis.css`

## 다음 단계
최신 배포 회귀검증을 확인한 뒤 `workflow-area-density.css`를 공통 density와 area-specific workflow semantics로 분해한다. 공통 Card/Form/Table/Flow 규칙은 `hd20-five-area.css`와 중복을 제거하며 흡수하고, Audit/Action/Advancement 고유 의미규칙은 실제 화면 검증 후 canonical area contract로 이동한다. 파일 삭제는 실제 병합 및 회귀검증 이후에만 수행한다.
