# CODING LOG — 2026-09-15 — Audit Area Dedupe

## Files
- `hd20-five-area-integration.js`
- `final-layout-polish.js`
- `index.html`

## Code contract
`normalizeAuditArea(audit)`가 `#awAudit`의 중복 `.hd20AreaHeader`를 제거하고 실제 `.awHero`를 Canonical `⑤ 진단·유지`로 정규화한다.

표현 계약:
`Risk 기반 대상 추출 → 실제 Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 종료평가`

Cache chain:
`index.html final-layout-polish.js?v=20260915-audit-dedupe-12`
→ `final-layout-polish.js hd20-five-area-integration.js?v=20260915-audit-dedupe-2`

## Non-regression
- Audit lifecycle 계산/저장 코드 미변경.
- Action/recurrence/effect verification 미변경.
- KPI source 미변경.
- Supabase sync 미변경.
- forced empty write 없음.
- `HD20_FIVE_AREA.areas`는 canonical 6-area (`dashboard/activity/advancement/maturitymap/audit/action`)와 일치하도록 정리.
