# 코딩일지 — 2·3번 탭 집중 스모크
- 신규 `.github/workflows/dashboard-boards-visibility-smoke.yml`.
- Playwright Chromium; `HD20_DASHBOARD_TABS.apply()`를 통한 2·3번 탭 전환 후 각 보드의 API 존재, DOM 노드, HTML 길이, computed display, bounding box 확인.
- 1440px 데스크톱과 390px 모바일 뷰포트 모두 검사. 오류 시 BOARD_EVIDENCE 로그 출력.
