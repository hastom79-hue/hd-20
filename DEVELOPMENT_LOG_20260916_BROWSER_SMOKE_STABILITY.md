# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Critical Playwright navigation first changed from `waitUntil: networkidle` to application-readiness based navigation.
- Run 35055346412 proved that even `domcontentloaded` could time out before any UI contract assertion in the main browser smoke.
- Main browser navigation was decoupled from unrelated external resource completion and now validates concrete HD-20 readiness.
- Maturity visibility requires the panel to exist, not be `hidden`, and have computed display other than `none`.
- Browser contract verifies five main areas only; dashboard maturity remains a dashboard subtab/panel, not a sixth standalone area.
- Boot evidence records document readiness, body visibility and local auth-pending state.

## 2026-09-16 follow-up — remaining Chromium workflows
- Exact HEAD `b9c874384b43b526b12bdba5332631165d247277` showed `HD20 nav scroll smoke` run 35056797325 and `HD20 subtab contract grid smoke` run 35056797377 failing before functional assertions because both still used `waitUntil:'networkidle'`.
- `nav-scroll-smoke.yml` now blocks non-local requests inside CI only, uses `domcontentloaded`, and waits for the canonical dashboard navigation plus `HD20NavScrollStability` before exercising desktop/mobile scroll-reset behavior.
- `subtab-contract-grid-smoke.yml` now applies the same CI-only external request isolation, replaces both initial and reload `networkidle` waits with `domcontentloaded`, and preserves all five-area, five-dashboard-group, eight operational-subtab, universal-grid and mobile-overflow assertions.
- Main-area and dashboard maturity navigation in that smoke uses in-page DOM clicks so the CI-only blocked external auth SDK cannot make an overlay invalidate internal IA testing.
- No production authentication, canonical store, KPI, Supabase write, or application runtime behavior was changed.

## Validation boundary
GitHub Pages deployment success alone is not browser E2E proof. Chromium workflow results must be checked separately. CI request isolation is test-only and does not bypass production authentication.
