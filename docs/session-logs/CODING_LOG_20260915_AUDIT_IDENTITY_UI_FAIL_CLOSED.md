# Coding Log — 2026-09-15 Audit Identity UI Fail-Closed

## audit-id-integrity-guard.js
- canonical Audit key: `id || drawId || auditDrawId`
- Action source key: `auditDrawId || sourceCaseId`
- `exact()` / `auditForAction()` require exactly one Audit match.
- `guardExactCaseModal()` blocks an open Exact Case Detail when `원천 Audit ID` is ambiguous.
- `guardTraceRows()` disables actions on Exact Trace rows whose Audit ID is duplicated and labels them `Audit ID 중복`.
- Reconciliation runs after Action/Audit/DB-sync events and relevant modal/navigation mutations.

## Loader
`final-layout-polish.js`: `audit-id-integrity-guard.js?v=20260915-3`.

## Safety
No automatic Audit ID rewrite/deletion. No Supabase write-path change. No server-side forced empty write.