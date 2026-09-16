# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Browser smoke navigation contract remains canonical five-area IA: dashboard / activity / advancement / audit / action.
- Initial removal of Playwright `networkidle` was insufficient: run 35055346412 timed out at `page.goto(... waitUntil:'domcontentloaded')` before any UI assertion.
- Navigation now uses `waitUntil:'commit'`; after the local response begins, HD-20 readiness is determined only by `.beginnerNav`, `#hd20DashboardPriority`, and `#hd20OperationalBridge` attachment.
- Added `document.readyState` to boot diagnostics while retaining body visibility and `hd20-auth-pending` checks.
- Dashboard maturity visibility now checks the actual `hidden` property and computed `display`, avoiding false-positive visibility from class-only checks.
- Dashboard maturity remains inside dashboard with no standalone `maturitymap` navigation and no `tab=maturitymap` URL state.
- No production store write logic changed and no authentication restriction was removed.
