# 개발일지 — 2026-10-17 고도화 추이 탭 숨김 충돌
- Browser smoke `Advancement ownership mismatch` trend: `.bottomGrid`가 숨겨져 표시 소유자 0건.
- 원인: 대시보드 전용 body 클래스 `hd20DashboardSummaryActive` 등이 다른 최상위 영역으로 이동한 후에도 남아 대시보드 CSS의 `.bottomGrid{display:none!important}`가 고도화 추이 화면에 적용될 수 있음.
- 조치: `hd20-subtabs.js`의 다른 최상위 영역 apply 시 대시보드 전용 모드 클래스 제거. 대시보드 영역에서는 기존 단일 컨트롤러 유지.
- JS 구문검사 통과. 배포 후 브라우저 검사로 실제 효과 확인 필요.
