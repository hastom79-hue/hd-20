# Development Log — 2026-09-16 Five-Area Architecture

- 전체 회고 결과 기능추가 중심 개발에서 Closed Loop/업무역할 중심 개발로 전환.
- 메인 6개 영역에서 고도화 맵을 제거하여 5개 업무영역으로 재정의.
- 고도화 맵을 대시보드 세부 탭으로 통합하는 1차 코드 변경 착수.
- 대시보드 세부구조를 종합현황 / 실행·유지 / 고도화 맵 / 기준·추이 / 현장참고 5개로 재정의.
- 메인 Navigation 설명을 Control Tower / Source / Conversion·Standardization / Verification / Action 역할 중심으로 수정.
- 운영 흐름을 활동 → 고도화·표준화 → 진단·유지 → 개선실행 → 표준/활동 환류 Closed Loop로 수정.
- 기존 maturitymap/map/maturity Deep Link는 대시보드의 maturity 세부 탭으로 호환 이동하도록 설계.
- 데이터 write, Supabase sync, KPI 판정 로직은 이번 구조개편에서 변경하지 않음.

잔여: 기존 6-area smoke 계약, legacy six-nav layout/guard, maturity map 자체의 독립-screen 모드 의존성을 후속 루프에서 제거/정리해야 한다.