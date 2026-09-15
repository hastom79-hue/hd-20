# DEVELOPMENT LOG — 2026-09-15 — Maturity Map Deduplication

## 목적
③ 고도화·표준화와 ④ 고도화 맵 사이의 중복 숫자/Case 표현을 제거하고 각 화면 역할을 명확히 분리한다.

## 발견
Canonical 고도화 맵은 실제 원천데이터로 후보, 공식확정, 현재 유지, 후보→공식확정 전환율과 공식확정 Case를 이미 표시한다. 별도 showcase가 동일한 후보/확정/유지 숫자와 사례 목록, 임의 score까지 다시 표시해 시각적 중복과 운영실적 오인 위험이 있었다.

## 반영
- showcase의 후보/확정/유지 숫자 제거
- 임의 score 및 score bar 제거
- 실제 Case처럼 보이던 사례 목록 제거
- 참고영역은 생산공정별 `개선 Focus`와 우선순위 tier만 표시
- Canonical 실적/Case는 상단 실제 고도화 맵에서만 표시하도록 역할 고정
- 참고정보가 KPI/HD20KPIData/Supabase에 기록되지 않는다는 문구 유지·강화

## 캐시
- `hd20-maturity-map-showcase.js?v=20260915-2`
- `final-layout-polish.js?v=20260915-maturity-dedupe-11`

## 데이터 안전
운영 KPI 계산, Activity/Audit/Action lineage, localStorage/Supabase write 로직 변경 없음. 서버 강제 빈값 쓰기 없음.