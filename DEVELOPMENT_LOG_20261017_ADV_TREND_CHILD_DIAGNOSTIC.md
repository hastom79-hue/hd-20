# 개발일지 — 2026-10-17 추이 차트 0px 높이 원인 추적
- PR #34 브라우저 결과 `.bottomGrid`: display grid, width 1378px, height 0px, app 정상 높이.
- 실제 내부 카드의 hidden, computed display, visibility, height, inline style을 추가 기록해 0px 원인을 식별.
- 제품 코드 변경 없이 진단 범위 확장. 검증 판정 기준 불변.
