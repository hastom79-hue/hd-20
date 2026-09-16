# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Critical Playwright navigation first changed from `waitUntil: networkidle` to `domcontentloaded` plus explicit application readiness selectors.
- Run 35055346412 proved that even `domcontentloaded` could time out before any UI contract assertion.
- Browser navigation is therefore decoupled from document lifecycle completion: `waitUntil: commit` confirms the local HTTP response, then concrete HD-20 DOM selectors are awaited directly.
- Readiness selectors use attached-state so validation measures application construction rather than unrelated resource completion.
- Maturity visibility now requires the panel to exist, not be `hidden`, and have computed display other than `none`.
- Browser contract verifies five main areas only; dashboard maturity remains a dashboard subtab/panel, not a sixth standalone area.
- Boot evidence records `document.readyState`, body visibility and cleared local auth-pending state.

## Validation boundary
GitHub Pages deployment success alone is not browser E2E proof. Browser smoke result must be checked separately. This change does not bypass production authentication and does not modify canonical operational data.
