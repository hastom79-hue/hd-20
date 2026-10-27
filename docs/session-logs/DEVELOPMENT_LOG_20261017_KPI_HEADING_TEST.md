# 개발일지 — 2026-10-17 KPI 제목 검사 정정
- PR #32 이후 디자인 검사에서 카드 수는 6개 인식하지만 `missing KPI 공식 판정 완료율` 발생.
- 실제 카드 마크업은 `.hd20HealthTrendCard h4`에 제목을 렌더링하나 검사 코드에는 `.hd20HealthTrendCardBody small` 잔존.
- KPI 명칭 6개 검증은 유지하면서 제목 선택자만 정확히 정정.
- 웹 제품 코드·데이터·차트 변경 없음. CI 검증 필요.
