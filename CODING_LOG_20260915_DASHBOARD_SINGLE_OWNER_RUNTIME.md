# Coding Log — Dashboard single-owner runtime — 2026-09-15

Changed `dashboard-subnav-single-owner-guard.js`.

Runtime contract:
1. `dashboardActive()` gates all ownership enforcement.
2. `canonicalRefresh()` reads `HD20_DASHBOARD_TABS.active()` and reapplies only that canonical 4-tab state.
3. Legacy generic subnav/purpose DOM is removed while Dashboard is active.
4. `hd20-subtab-changed` cannot leave legacy `applyDashboard()` visibility state as final state.
5. No localStorage/Supabase write introduced.

Cache child bumped in `final-layout-polish.js` from `dashboard-subnav-single-owner-guard.js?v=20260915-2` to `v=20260915-3`.

Parent `index.html` cache token is intentionally left unchanged in this commit and remains a follow-up cache-chain item.