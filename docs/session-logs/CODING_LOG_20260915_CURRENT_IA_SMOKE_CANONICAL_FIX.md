# CODING LOG — Current IA Smoke Canonical Fix

## Changed
`.github/workflows/current-ia-smoke.yml`

## Contract
- canonical top keys: `dashboard, activity, advancement, maturitymap, audit, action`
- dashboard groups: `summary, execution, standard`
- summary: priority/cards/showcase visible; main/bridge/bottom hidden
- execution: main/bridge visible; summary/standard hidden
- standard: bottom visible; summary/execution hidden
- Dashboard return resets summary
- desktop/mobile overflow <= 4px

## Correction during edit
초기 workflow 교체 직후 Node context에 남은 browser-only `window/document` noop 참조를 즉시 제거하고 재커밋했다.

## Invariants
Production data mutation 없음. Supabase 변경 없음. forced empty write 없음.
