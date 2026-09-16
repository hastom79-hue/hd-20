# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Canonical main IA remains `dashboard / activity / advancement / audit / action`.
- Dashboard maturity remains a dashboard subtab; no standalone `maturitymap` navigation or URL state is restored.
- No authentication restriction was removed and no server-side forced empty write was introduced.

## Browser workflow stabilization
- Main browser, current-IA, subtab-contract-grid and resource diagnostic use `waitUntil:'commit'` with explicit HD20 readiness and CI-only external-script stubbing.
- Dashboard canonical smoke requires five dashboard groups including `maturity`, validates maturity stays under dashboard, and preserves KPI/grouping/overflow/return-to-summary checks.
- Nav-scroll no longer depends on `domcontentloaded`; desktop/mobile five-area scroll assertions remain intact.

## Immediate navigation initialization
- Run on HEAD `d7f2ccddc72a2ed0fc792a8f14a3fccde7ac5c9a` showed `window.HD20_NAV` becoming available while `.beginnerNav button[data-key="dashboard"]` never appeared within the test window.
- Root cause: `beginner-navigation.js` defined the controller during parser execution but deferred `init()` to `DOMContentLoaded`, even though `index.html` already contains `.top`, `.beginnerNav`, dashboard cards and grids before the script chain.
- `beginner-navigation.js` now keeps `initialized=false`, makes `init()` idempotent, initializes immediately when the static nav exists, exposes `ready()` for diagnostics, and registers a one-time `DOMContentLoaded` fallback only when immediate initialization cannot run.
- Controller marker advances to `canonical-five-area-v10-early-boot`. Navigation labels/order, deep-link behavior and dashboard reset semantics are unchanged.
- Production auth/store/KPI/Supabase write logic is untouched. No server-side forced empty writes were introduced.

## 2026-09-17 DOM existence probe hardening
- Exact Chromium job `104795840536` / run `35096738551` reached a visible `.beginnerNav` carrying `canonical-five-area-v10-early-boot`, yet Playwright's `waitForSelector('.beginnerNav',{state:'attached'})` timed out. This proves the production early-init change executed and isolates the remaining failure to the selector readiness primitive.
- `.github/workflows/browser-smoke.yml` replaces boot-time attached-selector probes with `waitForFunction` DOM existence checks for `.beginnerNav`, generated dashboard nav, `#hd20DashboardPriority`, `#hd20OperationalBridge`, and the dashboard maturity button.
- Functional coverage remains strict: exact five-area nav, body visible/no auth-pending, 5 top KPI cards, 6 health metrics, no legacy landing, no legacy 1/3/6-month Audit labels, advancement semantic separation/official actor/no fake owner/no auto-confirm wording, and dashboard-native maturity visibility.
- CI external script stubbing remains test-only. No production code or canonical write path changed; no server-side forced empty writes were introduced.

## 2026-09-17 cross-workflow readiness alignment
- Replaced boot-time `waitForSelector(...,{state:'attached'})` calls with `waitForFunction` DOM probes in nav-scroll, current-IA, subtab-contract-grid, dashboard-canonical, design-layout and resource-initiator diagnostic.
- Existing five-area, five dashboard-group, eight operational-subtab, desktop/mobile scroll, KPI, overflow, modal and maturity assertions remain in place.
- Subtab universal-grid modal readiness now checks the `on` class directly. Design-layout external scripts receive the same empty successful CI stub used elsewhere; local resources continue normally.
- These are workflow/test harness changes only. Production code, auth, Supabase, KPI and canonical write behavior are unchanged; no server-side forced empty writes were introduced.
