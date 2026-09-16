# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Critical Playwright navigation first changed from `waitUntil: networkidle` to application-readiness based navigation.
- Browser contract verifies five main areas only; dashboard maturity remains a dashboard subtab/panel, not a sixth standalone area.
- Maturity visibility requires the panel to exist, not be `hidden`, and have computed display other than `none`.

## 2026-09-16 follow-up — remaining Chromium workflows
- Nav-scroll and subtab-grid were converted to CI-only external isolation plus application readiness while retaining their assertions.
- Design-layout smoke was aligned from retired six-area IA to canonical five-area IA; maturity is validated through the Dashboard section.
- Exact HEAD `27838414805fa3cba444d262308b78324ec39634` confirmed Pages build/deploy and package success, but layout job `104676233121` still timed out at `page.goto(... waitUntil:'domcontentloaded')` before any layout assertion.
- Because parser completion can still be held by external/parser-blocking resources even when CI routes abort them, layout smoke now waits only for the local HTTP response `commit`, then uses explicit canonical DOM selectors (`beginnerNav`, `hd20DashboardPriority`) as the application-readiness boundary.
- Desktop, 125%-equivalent, tablet, mobile, KPI, overflow, modal, advancement, Audit, Action and Dashboard maturity checks remain intact.
- No production authentication, canonical store, KPI, Supabase write, or application runtime behavior was changed.

## Validation boundary
GitHub Pages deployment success alone is not browser E2E proof. Chromium workflow results must be checked separately. CI request isolation is test-only and does not bypass production authentication.
