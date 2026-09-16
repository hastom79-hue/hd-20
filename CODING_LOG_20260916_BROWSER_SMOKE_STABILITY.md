# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Browser smoke navigation contract remains canonical five-area IA: dashboard / activity / advancement / audit / action.
- Initial removal of Playwright `networkidle` was insufficient in the main browser workflow: run 35055346412 timed out before any UI assertion.
- Main browser readiness is determined from local HTTP/app readiness rather than unrelated external network idleness.
- Dashboard maturity visibility checks the actual `hidden` property and computed `display`, avoiding false-positive visibility from class-only checks.
- Dashboard maturity remains inside dashboard with no standalone `maturitymap` navigation and no `tab=maturitymap` URL state.
- No production store write logic changed and no authentication restriction was removed.

## Follow-up fixes
- Run 35056797325 (`HD20 nav scroll smoke`) and run 35056797377 (`HD20 subtab contract grid smoke`) exposed two remaining `networkidle` dependencies.
- `.github/workflows/nav-scroll-smoke.yml`: added CI-only route interception that permits only localhost/127.0.0.1 resources; initial navigation now uses `domcontentloaded` and explicit selectors/runtime readiness. Existing desktop/mobile five-area scroll-reset assertions remain intact.
- `.github/workflows/subtab-contract-grid-smoke.yml`: added the same CI-only external request isolation; initial navigation and post-seed reload now use `domcontentloaded`; all canonical five-area, dashboard-group, maturity, eight subtab contract, universal grid and mobile-width assertions remain intact.
- Main-area and maturity test navigation uses DOM-dispatched clicks where external auth is intentionally unavailable in CI. This changes test mechanics only; production authentication remains untouched.
- No server-side forced empty writes were introduced. No canonical localStorage/Supabase production write path was changed.
