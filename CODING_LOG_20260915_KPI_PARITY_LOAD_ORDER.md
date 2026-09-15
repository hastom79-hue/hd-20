# Coding Log — KPI parity load-order — 2026-09-15

Changed `hd20-ops-production-filter-guard.js`.

Contract:
1. production-only `metrics()` remains the base OPS aggregator.
2. When that base replaces `HD20_OPS_V2.metrics`, stale `__evidenceParityPatched` is cleared.
3. `HD20_KPI_PARITY_GUARD.patchApi()` immediately wraps the production base again.
4. `schedule()` refreshes the visible KPI bar from Evidence row counts.
5. No localStorage/Supabase mutation is introduced.

Cache child token bumped in `final-layout-polish.js` from `20260915-1` to `20260915-2`.