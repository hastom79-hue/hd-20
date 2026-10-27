# DEVELOPMENT LOG — Dashboard Subtab Regression Validation

## 목적
대시보드 3그룹 분리 후 사용자 눈으로 오류를 찾기 전에 자동 검증이 그룹핑/복귀/새로고침 오류를 잡도록 회귀 계약을 보강한다.

## 자동 검증 추가
PC 1440x1000 / Mobile 375x812에서 다음을 검사한다.
- 최초 메인 탭 = dashboard
- 최초 대시보드 세부 탭 = summary(종합현황)
- 세부 탭 수 = 3
- summary에서 `.mainGrid`, `.bottomGrid` 숨김
- execution에서 `.mainGrid` 표시, summary/standard 숨김
- standard에서 `.bottomGrid` 표시, execution 숨김
- Activity 이동 후 Dashboard 복귀 시 summary reset
- Maturity Map 진입 후 reload 시 Dashboard + summary reset
- stale `?tab=maturitymap&sub=legacy` 직접 진입 시 Dashboard + summary reset 및 query 청소
- PC/Mobile horizontal overflow 2px 이하

## 데이터 안전
UI 회귀검증만 변경. KPI/Action/Audit/Supabase/localStorage write 로직 변경 없음. forced empty write 없음.
