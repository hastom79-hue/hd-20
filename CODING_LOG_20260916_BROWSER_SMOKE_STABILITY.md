# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Browser smoke navigation contract remains canonical five-area IA: dashboard / activity / advancement / audit / action.
- Main browser readiness is determined from local HTTP/app readiness rather than unrelated external network idleness.
- Dashboard maturity remains inside dashboard with no standalone `maturitymap` navigation and no `tab=maturitymap` URL state.
- No production store write logic changed and no authentication restriction was removed.

## Follow-up fixes
- Runs 35056797325 and 35056797377 exposed remaining `networkidle` dependencies in nav-scroll and subtab-grid workflows; both were isolated from external requests in CI while preserving their functional assertions.
- HEAD `01fe648cebe7e0f57713e8c8b8082dde49f821ba` design-layout job 104675659539 failed at `page.goto(... waitUntil:'networkidle')` before layout assertions. Pages deploy and package checks succeeded on the same HEAD.
- `.github/workflows/design-layout-smoke.yml` had two stale contracts: `tabs` still included standalone `maturitymap`, and `navCount` expected 6.
- Layout smoke now uses five main tabs only, expects nav count 5, blocks non-local requests in CI, waits on concrete dashboard DOM readiness, and navigates main areas with DOM-dispatched clicks.
- Maturity-map layout is validated after returning to Dashboard and activating `data-dashboard-section="maturity"`; the assertion requires dashboard active state, visible non-hidden map panel, and absence of standalone maturity navigation.
- Existing multi-viewport horizontal-overflow, critical-box, modal, six-KPI, advancement hierarchy, Audit and Action layout checks remain.
- No server-side forced empty writes were introduced. No canonical localStorage/Supabase production write path was changed.
