# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Canonical main IA remains `dashboard / activity / advancement / audit / action`.
- Dashboard maturity remains a dashboard subtab; no standalone `maturitymap` navigation or URL state is restored.
- No authentication restriction was removed and no server-side forced empty write was introduced.

## Browser workflow stabilization
- Main browser, current-IA, subtab-contract-grid and resource diagnostic use `waitUntil:'commit'` with explicit HD20 readiness and CI-only external-script stubbing.
- Dashboard canonical smoke now requires five dashboard groups including `maturity`, validates maturity stays under dashboard, and preserves KPI/grouping/overflow/return-to-summary checks.
- Nav-scroll no longer depends on `domcontentloaded`; desktop/mobile five-area scroll assertions remain intact.

## Immediate navigation initialization
- Run on HEAD `d7f2ccddc72a2ed0fc792a8f14a3fccde7ac5c9a` showed `window.HD20_NAV` becoming available while `.beginnerNav button[data-key="dashboard"]` never appeared within the test window.
- Root cause: `beginner-navigation.js` defined the controller during parser execution but deferred `init()` to `DOMContentLoaded`, even though `index.html` already contains `.top`, `.beginnerNav`, dashboard cards and grids before the script chain.
- `beginner-navigation.js` now keeps `initialized=false`, makes `init()` idempotent, initializes immediately when the static nav exists, exposes `ready()` for diagnostics, and registers a one-time `DOMContentLoaded` fallback only when immediate initialization cannot run.
- Controller marker advances to `canonical-five-area-v10-early-boot`. Navigation labels/order, deep-link behavior and dashboard reset semantics are unchanged.
- Production auth/store/KPI/Supabase write logic is untouched. No server-side forced empty writes were introduced.
