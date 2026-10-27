# DEVELOPMENT LOG — 2026-09-16 — Five-area smoke alignment

## 목적
HD-20 전면 회고에서 확정한 5개 메인 업무영역과 Dashboard 내 고도화 맵 통합 구조를 자동 검증 계약에 반영한다.

## 반영
- subtab contract grid smoke의 메인 IA 기대값을 6개에서 5개로 변경.
- 메인: dashboard / activity / advancement / audit / action.
- Dashboard 세부 영역: summary / execution / maturity / standard / field.
- 기존 독립 maturitymap 메인 탭 검증을 제거하고 Dashboard maturity panel 활성 검증으로 교체.
- browser-smoke.yml의 expectedMain도 동일한 5개 메인 영역으로 정렬.
- browser smoke의 메인 왕복에서 독립 maturitymap 클릭을 제거.
- Dashboard의 maturity 세부탭을 직접 클릭하여 active=maturity, main nav active=dashboard, map panel visible을 검증.
- 독립 maturitymap 메인 버튼이 없어야 하며 Dashboard maturity 진입이 URL을 tab=maturitymap으로 되돌리지 않는 계약 추가.
- 4개 운영영역의 8개 subtab INPUT/판단/다음/상세 데이터 그리드 계약은 유지.
- 모바일 상세 그리드 overflow 계약 유지.

## 안전성
- Production 데이터 write 로직 변경 없음.
- Supabase write 변경 없음.
- 서버 측 강제 empty write 없음.
- 업무 데이터 판정식 변경 없음.
- Browser smoke는 E2E fixture/localStorage만 사용하며 Production KPI로 유입시키는 변경 없음.

## 잔여
- hd20-six-nav-layout.js 등 legacy six-area 명칭/가정 전수 제거 필요.
- 고도화 맵 standalone 화면 잔재를 Dashboard panel 전용으로 단계적 축소 필요.
- GitHub Actions가 실제 Playwright step까지 진입하는지 최신 HEAD 기준 재확인 필요.
