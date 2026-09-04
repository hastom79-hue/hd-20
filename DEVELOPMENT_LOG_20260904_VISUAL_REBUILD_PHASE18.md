# HD-20 Visual Rebuild — Phase 18
Date: 2026-09-04

## 배경
CSS 통합/삭제 중심 작업 이후 실제 화면의 균형과 정보계층이 무너졌다는 사용자 피드백을 반영해, 구조정리보다 실제 화면 품질을 우선하는 방식으로 전환했다.

## 선행 복구
`final-layout-polish.js`의 retired stylesheet guard가 복원된 `dashboard-priority-groups.css`까지 제거하고 있음을 확인했다. 이 때문에 `index.html`에는 link가 존재해도 런타임 DOM에서 해당 stylesheet가 사라져 Dashboard grouping/layout이 깨질 수 있었다.

- `dashboard-priority-groups.css`를 retired 목록에서 제외했다.
- 과거 hotfix/polish/mobile runtime stylesheet 차단은 유지했다.
- 업무 로직 및 canonical stores는 변경하지 않았다.

## ① 통합 대시보드 시각 재정비
`dashboard-priority-groups.css`만 수정해 Dashboard 화면의 실제 정보계층을 재조정했다.

- 운영 건전성 KPI를 3개 업무영역 카드로 동일한 시각 단위로 정렬
- 고도화·판정 / 유지·Audit / 개선조치를 영역별 상단 accent와 옅은 header tone으로 구분
- 업무화면 이동 버튼을 plain text가 아닌 작은 control 형태로 정리
- 6개 KPI는 영역 내부에서 3 / 2 / 1 구조를 유지하되 그룹 자체는 균형있는 3열로 배치
- 1280px에서는 고도화 영역을 한 줄 전체로 사용하고 Audit/Action을 아래 2열로 배치
- 1100px 이하에서는 영역을 세로 1열로 전환
- 기존 보조성과 KPI 5개는 높이와 간격만 정돈하고 역할/산식은 변경하지 않음
- Main chart / side summary / bottom criteria-trend 비율을 다시 조정해 우측 쏠림을 완화

## 유지한 업무 기준
- 운영 건전성 KPI 6종 명칭/산식 유지
- 고도화 3조건과 공식판정 분리 유지
- Audit 실시일부터 달력 기준 +6개월 지속관리 유지
- 개선조치 등록일 기준 7~14일 Deadline 정책 유지
- 라인명 free-text 추론 금지 유지

## 작업 원칙
당분간 stylesheet 병합/삭제를 재개하지 않는다. ①~⑤ 각 화면을 실제 사용자 관점에서 순차 재정비하고, 각 단계마다 Browser/Design/Runtime/Nav 회귀검증을 확인한다.
