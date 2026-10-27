# DEVELOPMENT LOG — Dashboard Standard / Trend Compact

대시보드 `③ 기준·추이`의 공간 활용을 개선했다.

- PC: 판정기준/월별추이를 0.9 : 1.1 비율의 2열로 정리
- 카드 헤더/본문 여백 축소
- 3개 판정기준 항목의 내부 간격 및 설명 line-height 축소
- 추이 영역 최소높이를 PC 250px, 모바일 220px로 제한
- <=1100px에서는 안전하게 1열 전환
- 모바일 카드 여백 추가 축소

업무 데이터와 KPI 산식, Audit/Action, Supabase/localStorage write 경로는 변경하지 않았다. forced empty write 없음.
