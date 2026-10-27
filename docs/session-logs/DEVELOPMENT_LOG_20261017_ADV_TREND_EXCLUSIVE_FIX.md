# 개발일지 — 2026-10-17 고도화 추이 탭 단독 표시 복구
- PR #37 검사: 추이 그리드 높이 520px 정상 회복, 그러나 판정기준 탭에서 trend가 함께 표시되어 소유권 검사 실패.
- 원인: trend 선택 시 설정한 inline `display:grid!important`가 다른 탭 전환 후에도 남음.
- 다른 탭 전환 시 inline display/visibility 제거 및 숨김 상태 재적용.
- 운영 데이터 변경 없음. Actions 재검증 필요.
