# DEVELOPMENT LOG — Dashboard Density Compact

대시보드 3그룹 분리 후에도 각 그룹 내부가 길어지는 문제를 줄이기 위해 표현 밀도를 조정했다.

- 종합현황: 운영 건전성 KPI 카드 최소높이/패딩 및 기본 KPI 패딩 축소
- 실행·유지: 메인 차트 높이 390→330px 수준으로 축소, 카드 헤더/본문 패딩 축소
- 실행·유지: Operational Bridge 9개 상태를 PC 5열, 중간 3열, 모바일 2열로 재배치
- 대시보드 세부 탭 자체의 높이/간격도 소폭 축소
- 선택 그룹에 따라 body mode class를 적용하여 다른 업무화면에는 밀도 변경이 전파되지 않도록 격리

업무 데이터, KPI 산식, Audit/Action 저장, Supabase/localStorage write 로직은 변경하지 않았다. server-side forced empty write 없음.
