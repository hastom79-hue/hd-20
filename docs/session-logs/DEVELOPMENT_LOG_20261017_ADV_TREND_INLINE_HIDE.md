# 개발일지 — 2026-10-17 추이 영역 중복 표시 재수정
- PR #38 Actions에서 judge 탭 선택 시 trend 영역이 함께 표시되어 browser smoke 실패 지속.
- 기존 클래스 숨김과 inline 제거만으로는 스타일 우선순위에 밀림.
- 비활성 시 inline `display:none!important`, 활성 시 기존 `display:grid!important`를 적용하여 탭 단독 표시 보장.
- 개발 화면 이외 데이터/필터 변경 없음. 후속 browser smoke 재검증 필요.
