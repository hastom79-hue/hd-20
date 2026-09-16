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

## 2026-09-16 follow-up — remaining Chromium workflows
- Exact HEAD `b9c874384b43b526b12bdba5332631165d247277` showed nav-scroll and subtab-grid failing before functional assertions because both still used `networkidle`; both were converted to CI-only external isolation plus application readiness.
- Exact HEAD `01fe648cebe7e0f57713e8c8b8082dde49f821ba` then showed Pages deploy and package success, while design-layout smoke failed at its own stale `networkidle` entry point before any layout assertion.
- Inspection also found that design-layout smoke still encoded the retired six-area contract (`maturitymap` as a main tab, nav count 6).
- `design-layout-smoke.yml` is now aligned to the canonical five-area IA, uses CI-only external request isolation, checks nav count 5, and validates maturity map through the Dashboard `maturity` section instead of a standalone main tab.
- Desktop, 125%-equivalent, tablet, mobile, KPI, overflow, modal, advancement, Audit and Action layout checks remain in place.
- No production authentication, canonical store, KPI, Supabase write, or application runtime behavior was changed.

## Validation boundary
GitHub Pages deployment success alone is not browser E2E proof. Chromium workflow results must be checked separately. CI request isolation is test-only and does not bypass production authentication.
