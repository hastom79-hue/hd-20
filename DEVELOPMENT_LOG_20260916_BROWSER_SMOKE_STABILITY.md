# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Critical Playwright navigation first changed from `waitUntil: networkidle` to application-readiness based navigation.
- Browser contract verifies five main areas only; dashboard maturity remains a dashboard subtab/panel, not a sixth standalone area.
- Maturity visibility requires the panel to exist, not be `hidden`, and have computed display other than `none`.

## 2026-09-16 follow-up — Chromium boot trace
- HEAD `f0508f70f48bd7c9f17cb7a106a76b1f9b70ee32` confirmed Pages build/deploy success, but browser run 35059920771 still timed out waiting for `domcontentloaded` even after external scripts were stubbed. The failure occurred before five-area assertions.
- The browser smoke now returns to `waitUntil:'commit'`, waits for the static `.beginnerNav` container, then explicitly waits for `window.HD20_NAV`. It records local requested and completed resource paths so the next failure identifies the parser/bootstrap boundary rather than producing another opaque navigation timeout.
- Current-IA smoke still contained a stale `networkidle` dependency. It now uses the same CI-only external script stubbing, `commit` navigation, static nav-container readiness, and explicit HD20 controller/dashboard-tab readiness while preserving desktop/mobile five-area and dashboard-group assertions.
- This phase is diagnostic hardening, not a production bypass. No production application/authentication/store/Supabase write behavior changed.

## Validation boundary
GitHub Pages deployment success alone is not browser E2E proof. Chromium workflow results must be checked separately. CI request isolation is test-only and does not bypass production authentication.
