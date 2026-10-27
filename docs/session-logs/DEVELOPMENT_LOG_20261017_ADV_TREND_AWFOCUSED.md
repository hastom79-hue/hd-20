# 개발일지 — 2026-10-17 고도화 추이 탭 표시 오류
- 브라우저 검증 `Advancement ownership mismatch` trend (visible owner 0).
- 실제 CSS `hd20-five-area.css`: `.app.awFocused>.bottomGrid{display:none!important}`.
- `applyAdvancement`가 trend 선택 시에도 `.app.awFocused`를 설정하여 `.bottomGrid`를 숨김. 차트 자체의 `display:grid!important`보다 상위 CSS 중요도/규칙 충돌.
- trend에서는 `awFocused` 제거, 그 외 고도화 하위 탭에서는 유지. 데이터/차트 변경 없음.
- JavaScript 구문 검사 PASS. CI 결과 확인 필요.
