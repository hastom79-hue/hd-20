# CODING LOG — 2026-09-15 — Maturity Map Deduplication

## 변경 파일
- `hd20-maturity-map-showcase.js`
- `final-layout-polish.js`
- `index.html`

## 코드 변경
`hd20-maturity-map-showcase.js`에서 `score`, `maintained`, `confirmed`, `candidates`, 운영 Case처럼 보이는 `cases` 데이터를 제거했다. 참고 portfolio는 `team`, `tier`, `focus`만 가진다.

Canonical `hd20-maturity-map-tab.js`가 실제 원천 기반 후보/공식확정/현재 유지/전환율/공식확정 Case를 단독 담당한다. showcase는 운영지표를 복제하지 않고 개선 관점 참고만 제공한다.

## 캐시 체인
- child: `hd20-maturity-map-showcase.js?v=20260915-2`
- parent loader: `final-layout-polish.js?v=20260915-maturity-dedupe-11`

## 불변조건
KPI 공식, Activity/Audit/Action 데이터, Supabase 동기화 및 write 로직 변경 없음. server-side forced empty write 없음.