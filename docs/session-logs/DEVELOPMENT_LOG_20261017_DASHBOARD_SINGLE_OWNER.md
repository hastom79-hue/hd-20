# 개발일지 — 2026-10-17 대시보드 표시 제어 충돌 수정
- 원인: `hd20-subtabs.js`의 구형 2단계 대시보드 `applyDashboard`가 `.cards`, `.mainGrid`, `#hd20DashboardPriority`, `#hd20OperationalBridge`에 `hd20SubHidden`을 설정하는 동안 신형 5개 탭 `dashboard-section-tabs.js`가 같은 요소를 독립 제어함.
- 조치: 대시보드 영역에서는 5개 탭 컨트롤러의 `refresh()`에 표시 제어를 위임. 해당 컨트롤러가 아직 로드되지 않은 경우에만 구형 처리 fallback 유지. 다른 영역(activity, advancement, audit, action)은 변경하지 않음.
- 검증: 전체 수정 JS 구문 검사 통과. 실제 화면·Actions 검사 결과는 배포 후 확인 필요.
