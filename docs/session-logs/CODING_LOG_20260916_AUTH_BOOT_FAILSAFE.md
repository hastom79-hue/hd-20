# CODING LOG — 2026-09-16 — Auth boot fail-safe

## index.html
- removed initial `class="hd20-auth-pending"` from `<html>`.
- bumped `supabase-auth.css` to `v=20260916-boot-failsafe-1`.
- bumped `supabase-auth.js` to `v=20260916-boot-failsafe-1`.

## supabase-auth.js
- auth gate remains mandatory for non-localhost access.
- removed script-level forced pending class addition.
- added `showBootError(error)`.
- wrapped `boot()` with try/catch.
- `startSupabase()` now exposes missing Supabase client as visible initialization error instead of leaving a hidden page.
- mail-gate transition catches async start errors.
- login request catches network exceptions and restores button state.

## Non-regression
No Canonical/Supabase write semantics changed. No forced empty writes. No operational KPI/Audit/Action judgment changes.
