# 코딩일지 — 2026-10-17
- 파일 `dashboard-section-tabs.js`.
- `if(b)setTimeout(reset,0)` → `if(b&&window.HD20_NAV?.active?.()!=='dashboard')setTimeout(reset,0)`.
- 목적: 동일 최상위 대시보드 메뉴 클릭 시 선택한 2·3번 하위 탭을 비동기 reset이 덮어쓰지 않도록 보호.
- 데이터/차트 변경 없음. JS syntax PASS.
