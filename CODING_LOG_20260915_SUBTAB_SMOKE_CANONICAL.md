# CODING LOG — 2026-09-15 — Subtab Smoke Canonical

## 파일
`.github/workflows/subtab-contract-grid-smoke.yml`

## 변경
구형 `dashboard:['종합현황','성과·운영분석']` 포함 5영역/10서브탭 반복을 제거했다.

현재 계약:
- main: `dashboard, activity, advancement, maturitymap, audit, action`
- dashboard groups: `summary, execution, standard`
- operational subtabs: activity 2 + advancement 2 + audit 2 + action 2 = 8
- maturitymap: 독립 메인영역 이동성 검증
- mobile: 390x844 universal grid width 검증

## 불변조건
- 운영 JS/KPI/Audit/Action/Supabase 로직 변경 없음
- fixture는 localStorage 테스트 데이터뿐
- server-side forced empty write 없음

## workflow commit
`7b061d9cc8af574e69c20e1e20267a686cf93ee5`
