# DEVELOPMENT LOG — Dashboard Grouping Validation

## 재검토 결과
기존 4개 세부 탭은 `핵심현황`과 `성과흐름`이 판단 관점에서 분리도가 낮아 사용자가 대시보드 전체 흐름을 이해하기에 오히려 탭 수가 많았다.

## 최종 그룹핑
1. `종합현황` — 운영 건전성 KPI + 5S 활동/고도화 성과 KPI
2. `실행·유지` — 팀별 실행 + Audit 6개월 지속관리 + Action + 운영 연결
3. `기준·추이` — 5S 고도화 판정기준 + 고도화 작업장 월별 추이

## 동작 검증 보강
- Dashboard 진입/복귀 시 세부 탭은 항상 `종합현황`으로 reset
- pageshow 재진입에서도 Dashboard면 `종합현황` reset
- 선택하지 않은 그룹의 본문과 section label을 모두 숨김
- 모바일에서는 세부 탭 가로 스크롤 허용
- 공식 6개 메인 탭 구조는 변경하지 않음

## 데이터 안전
표현 계층만 변경. KPI 산식, Supabase/localStorage write, Audit/Action 데이터에는 변경 없음. server-side forced empty write 없음.
