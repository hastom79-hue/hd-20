# 개발일지 — 2026-10-17 디자인 검사 KPI 구조 정합화
- 기존 디자인 검사에서 운영 KPI 0개: `.hd20HealthKpi`를 찾지만 실제 1번 탭은 `.hd20HealthTrendCard`로 교체되어 있음.
- KPI 명칭도 구형 `.hd20HealthKpiBody small` 대신 현재 카드의 `h4`에 있음.
- 검사 선택자만 현행 DOM으로 변경, 제품 코드/데이터/디자인 불변.
- 브라우저 재검증 결과는 Actions 확인 필요.
