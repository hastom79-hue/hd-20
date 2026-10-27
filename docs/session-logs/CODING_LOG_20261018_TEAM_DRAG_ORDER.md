# HD-20 코딩일지 — 팀별 차트 드래그 정렬

- hd20-improve-board.js
- teamChartLocalOrder 변수 추가, masterSorted 정렬 후 임시 순서가 있으면 tv에 적용.
- chart DOM에 data-team-chart 래퍼 및 기본순서 복원 버튼 추가.
- .hit 막대·가로축 라벨에 pointerdown/move/up/cancel 처리.
- 이동 거리 7px 이하 클릭은 팀 상세 조회, 초과 시 SVG 좌표를 대상 슬롯으로 환산해 순서 변경.
- 마스터 순서 저장키에 쓰지 않으며, 다른 탭/원천 데이터에 영향 주지 않음.
- JS 구문 검사 통과. Chromium 실제 동작 검증 대기.
