# 코딩일지 — 2026-10-17
- 파일 `dashboard-section-tabs.js`.
- `pageshow` 이벤트의 unconditional `reset()`을 URL `section` 기반 `apply(section)` 또는 `refresh()`로 교체.
- 목표: 모바일 지연 초기화·페이지 복귀 중 선택된 improve/request가 summary로 덮이는 위험 감소.
- 다른 실패 5종 별도 추적. JS syntax PASS.
