# 코딩일지 — 2026-10-17
- 변경 파일: `hd20-subtabs.js`.
- `apply(area,sub)`의 `area==='dashboard'` 분기에서 `HD20_DASHBOARD_TABS.refresh()` 우선 사용, API 부재 시 `applyDashboard(sub)` fallback.
- 목적: 신형 5개 탭과 구형 2개 서브탭 간 `.hd20SubHidden` 클래스 충돌 제거.
- 데이터, KPI 산식, 차트 CSS 변경 없음. 구문 검사 성공.
- 남은 검증: 2·3번 보드 실표시, 1번 구성, Actions 실패 5종. 기존 검사 기준 자체가 구형 DOM에 의존할 가능성 별도 평가.
