# CODING LOG — Dashboard Subtab Regression

## Workflow
`.github/workflows/dashboard-canonical-smoke.yml`

## Static assertions
- `dashboard-section-tabs.js` canonical loader 존재
- summary / execution / standard 3-group contract 존재
- default active summary 및 reset() contract 존재
- stale tab query initial restore 금지 유지

## Browser assertions
- 1440x1000, 375x812
- summary initial visibility contract
- execution/standard exclusive visibility
- Activity → Dashboard return reset
- Maturity → reload Dashboard/summary reset
- stale deep-link cleanup
- horizontal overflow guard

## Invariants
canonical six-area navigation 유지. 데이터 write 및 Supabase 동기화 로직 미변경. server-side forced empty write 없음.
