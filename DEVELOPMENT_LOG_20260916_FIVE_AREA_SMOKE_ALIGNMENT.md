# DEVELOPMENT LOG — 2026-09-16 — Five-area smoke alignment

## 목적
HD-20 전면 회고에서 확정한 5개 메인 업무영역과 Dashboard 내 고도화 맵 통합 구조를 자동 검증 계약에 반영한다.

## 반영
- subtab contract grid smoke의 메인 IA 기대값을 6개에서 5개로 변경.
- 메인: dashboard / activity / advancement / audit / action.
- Dashboard 세부 영역: summary / execution / maturity / standard / field.
- 기존 독립 maturitymap 메인 탭 검증을 제거하고 Dashboard maturity panel 활성 검증으로 교체.
- 4개 운영영역의 8개 subtab INPUT/판단/다음/상세 데이터 그리드 계약은 유지.
- 모바일 상세 그리드 overflow 계약 유지.

## 안전성
- Production 데이터 write 로직 변경 없음.
- Supabase write 변경 없음.
- 서버 측 강제 empty write 없음.
- 업무 데이터 판정식 변경 없음.

## 잔여
- browser-smoke.yml의 기존 expectedMain six-area 계약도 별도 정렬 필요.
- hd20-six-nav-layout.js 등 legacy six-area 명칭/가정 전수 제거 필요.
- 고도화 맵 standalone 화면 잔재를 Dashboard panel 전용으로 단계적 축소 필요.
