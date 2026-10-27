# DEVELOPMENT LOG — Current IA Smoke Canonical Fix

## 발견 결함
`current-ia-smoke.yml`이 과거 5-area IA와 Dashboard의 구형 `종합현황 / 성과·운영분석` subtab을 계속 검증하고 있었다. 현재 canonical UI는 6-area + Dashboard 내부 3-group이므로 테스트 계약 자체가 현재 화면과 불일치했다.

## 수정
- Top IA를 dashboard / activity / advancement / maturitymap / audit / action 6개로 고정
- Dashboard group을 summary / execution / standard 3개로 검증
- 각 group의 exclusive visibility 검증
- Dashboard 복귀 시 summary reset 검증
- Desktop 1440x1000 / Mobile 390x844 horizontal overflow 검증
- obsolete 5-area/10-subtab fixture 계약 제거

## 안전성
UI/CI 검증 계약만 변경. 운영 KPI, Audit, Action, localStorage, Supabase write 로직은 변경하지 않았다. forced empty write 없음.
