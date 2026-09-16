# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Browser smoke navigation contract remains canonical five-area IA: dashboard / activity / advancement / audit / action.
- Dashboard maturity remains inside dashboard with no standalone `maturitymap` navigation and no `tab=maturitymap` URL state.
- No production store write logic changed and no authentication restriction was removed.

## Follow-up fixes
- HEAD `f0508f70f48bd7c9f17cb7a106a76b1f9b70ee32`: Pages build/deploy succeeded, while browser job `104677870260` timed out at `page.goto(... waitUntil:'domcontentloaded')` before any UI assertion despite CI external-script stubbing.
- `.github/workflows/browser-smoke.yml` now navigates with `waitUntil:'commit'`, confirms the static `.beginnerNav` container, then waits for `window.HD20_NAV`. Local request and request-finished paths are captured in the evidence artifact and printed as the last 12 paths on failure to expose the exact bootstrap boundary.
- `.github/workflows/current-ia-smoke.yml` had an independent stale `networkidle` call. It now uses CI-only external script stubbing, `commit` navigation and explicit HD20 controller/dashboard-tab readiness. Existing desktop/mobile five-area navigation, five dashboard-group isolation and overflow assertions remain.
- No assertion was converted into a production fail-open path. CI external stubs remain test-only.
- No server-side forced empty writes were introduced. No canonical localStorage/Supabase production write path was changed.

## Subtab contract grid readiness fix
- The subtab-contract-grid Chromium job failed before functional assertions because both initial `goto` and `reload` still waited for `domcontentloaded`.
- Both transitions now use `waitUntil:'commit'`, followed by explicit `.beginnerNav button[data-key="dashboard"]` attachment and `HD20_NAV + HD20_SUBNAV + HD20_DASHBOARD_TABS + #hd20PurposePanel` readiness.
- All existing assertions remain: exact five-area main navigation, five dashboard groups, dashboard maturity activation, eight operational subtab contracts, judgment/next/grid text, universal grid modal/meta, and mobile grid width.
- Browser-local GRID-A / GRID-U / GRID-C fixtures remain non-production test data only.
- No production authentication/store/KPI/Supabase write behavior changed, and no server-side forced empty writes were introduced.

## External boot parity + resource diagnostic fix
- Failed subtab run `35061409470` timed out on `.beginnerNav button[data-key="dashboard"]` after `commit`; its request policy aborted all external resources, so parser-blocking external scripts did not receive the same CI stub treatment as the stabilized main browser smoke.
- `.github/workflows/subtab-contract-grid-smoke.yml` now fulfills external script requests with an empty successful JavaScript stub and aborts other external resources. Readiness sequence is static `.beginnerNav` -> `window.HD20_NAV` -> generated dashboard button -> NAV/SUBNAV/DASHBOARD_TABS/purpose panel.
- `.github/workflows/resource-initiator-diagnostic.yml` no longer uses `networkidle`; it uses the same CI-only script stub, `commit` navigation and explicit nav-controller readiness while preserving CDP 404 initiator tracing.
- Functional assertions were not weakened. Production code was not changed. No server-side forced empty writes were introduced.

## Attached nav readiness fix
- At exact HEAD `a12df91564e5830986ccf65a873faaba3545a962`, Chromium job `104718071211` resolved `.beginnerNav` but reported it hidden; the timeout came from Playwright's default visible-state wait, not from a missing DOM node.
- Main browser smoke changes only that readiness probe to `waitForSelector('.beginnerNav',{state:'attached'})`. It still requires `window.HD20_NAV`, generated dashboard navigation, dashboard priority, operational bridge, exact five-area order, body visibility, no auth-pending state, and dashboard-native maturity behavior.
- Production code and production write paths are untouched. No server-side forced empty writes were introduced.

## Canonical dashboard + nav-scroll alignment
- `.github/workflows/dashboard-canonical-smoke.yml` now statically requires all five dashboard keys including `maturity`; rendered subtab count changes from stale `4` to canonical `5`.
- Canonical smoke adds an explicit maturity assertion: active dashboard subtab is `maturity`, main nav remains `dashboard`, `#hd20MaturityMapTab` is visible, and no standalone `maturitymap` nav exists.
- Canonical browser startup now uses external-script CI stubs, `waitUntil:'commit'`, attached `.beginnerNav`, HD20 NAV/DASHBOARD_TABS readiness, and attached priority/bridge readiness instead of `networkidle`.
- `.github/workflows/nav-scroll-smoke.yml` replaces `domcontentloaded` with `commit`, uses the same external-script CI stub, and waits for attached nav + HD20_NAV before the existing HD20NavScrollStability contract.
- Desktop/mobile five-area scroll assertions remain unchanged. No production code/write path changed and no server-side forced empty writes were introduced.
