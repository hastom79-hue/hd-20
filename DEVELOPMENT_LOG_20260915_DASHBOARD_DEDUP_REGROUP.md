# DEVELOPMENT LOG — Dashboard Dedup / Regroup

대시보드 탭별 중복 내용을 재검토하여 정보 역할 기준으로 재그룹핑했다.

- 종합현황: 운영 건전성 KPI + 5S 성과 KPI만 유지
- 실행·유지: 팀별 실행, Audit 6개월 관리, Action Summary 유지
- 기준·추이: 5S 고도화 3대 판정기준 + 월별 추이 유지
- 현장참고: 운영실적이 아닌 초기 샘플 6건과 공개 현장사진을 독립 탭으로 분리
- 폐쇄루프 상세 운영상태에서 Audit 관리중/종료대기, Action 미완료/기한경과/재발, 고도화 3조건/2조건 등 다른 영역과 겹치던 지표 제거
- Operational Bridge에는 실행 영역에서 별도로 볼 가치가 있는 최종 종료평가 `유지/미흡`만 남김
- bridge 데이터도 non-production row 제외 규칙 적용

업무 데이터, KPI 산식, Audit/Action 저장 및 Supabase/localStorage write 경로는 변경하지 않았다. forced empty write 없음.
