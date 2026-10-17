# 코딩일지 — 팀 차트 순서 저장

- hd20-improve-board.js: TEAM_CHART_ORDER_KEY, 초기 localStorage 복원, teamChartOrderDirty, saveTeamOrder 클릭 처리, resetTeamOrder 저장키 삭제.
- 드래그 종료 시 저장 전 변경 상태 표시. 기존 기준정보 정렬 로직 유지.
- index.html: 스크립트 버전 갱신.
- JS 구문 통과. 브라우저 회귀검증 및 운영 배포 미확인.

## 기준정보 동기화 변경
- 저장 버튼: gmes5s_team_display_order에 통합 팀 배열 저장.
- CustomEvent gmes5s-team-display-order-changed 발행.
- 페이지 재진입 시 기준정보 순서 우선 사용; 별도 차트 로컬 순서 복원 제거.
- 기본순서 복원은 저장하지 않은 드래그만 취소.
- JS 구문 통과; 브라우저 통합 테스트 미완료.
