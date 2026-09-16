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
