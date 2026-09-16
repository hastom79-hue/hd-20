# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Browser smoke navigation contract remains canonical five-area IA: dashboard / activity / advancement / audit / action.
- Dashboard maturity remains inside dashboard with no standalone `maturitymap` navigation and no `tab=maturitymap` URL state.
- No production store write logic changed and no authentication restriction was removed.

## Follow-up fixes
- Nav-scroll and subtab-grid workflows use CI-only external isolation and application readiness while preserving functional assertions.
- Design-layout smoke uses five main tabs, expects nav count 5, and validates maturity after activating Dashboard `data-dashboard-section="maturity"`.
- HEAD `27838414805fa3cba444d262308b78324ec39634`: Pages build/deploy and package passed; layout job `104676233121` failed before any layout assertion because `domcontentloaded` did not fire within 30 seconds.
- Layout navigation now uses Playwright `waitUntil:'commit'` (15s) only to establish the local HTTP response, then waits up to 20s for `.beginnerNav button[data-key="dashboard"]` and `#hd20DashboardPriority`. This prevents parser-blocking external resources from being mistaken for application layout failure.
- Multi-viewport overflow, critical-box, modal, six-KPI, advancement hierarchy, Audit, Action and Dashboard maturity assertions remain unchanged in intent.
- CI continues to block non-local requests only inside the test browser.
- No server-side forced empty writes were introduced. No canonical localStorage/Supabase production write path was changed.
