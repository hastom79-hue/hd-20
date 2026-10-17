## 코딩일지 — 2026-10-18
- hd20-improve-board.js: 개별 요소 pointermove/up 처리 대신 window 이벤트 사용, 이동거리 6px 판정, SVG viewBox 좌표 변환, pointercancel 정리, dragstart 차단.
- index.html: hd20-improve-board.js 버전 20261018-team-drag-2로 변경.
- 클릭 시 기존 팀 드릴다운 유지, 드래그 시 팀 순서만 메모리 변경.
- 검증: new Function JS 구문 PASS. Chromium 상호작용 및 캐시 갱신 실배포 미검증.
