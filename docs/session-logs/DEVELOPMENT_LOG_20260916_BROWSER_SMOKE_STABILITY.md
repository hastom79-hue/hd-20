# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Browser contract verifies canonical five main areas; dashboard maturity remains a dashboard subtab/panel, not a sixth standalone area.
- Critical browser waits use application readiness instead of `networkidle`/`domcontentloaded` where parser-blocking runtime scripts make those lifecycle events unsuitable.

## 2026-09-16 — Boot/readiness repairs
- Browser, current-IA, subtab-grid and resource diagnostic flows moved to `waitUntil:'commit'` plus explicit HD20 controller readiness and CI-only external-script stubbing.
- Exact HEAD `a12df91564e5830986ccf65a873faaba3545a962` proved `.beginnerNav` could exist before it was visible; readiness was corrected to DOM attachment rather than visibility.
- Dashboard canonical smoke was corrected from stale four-subtab expectations to canonical five groups: `summary / execution / maturity / standard / field`, including dashboard-native maturity validation.
- Nav-scroll smoke was aligned to the same CI boot policy while preserving desktop/mobile five-area scroll reset checks.

## 2026-09-16 — Early five-area navigation boot
- HEAD `d7f2ccddc72a2ed0fc792a8f14a3fccde7ac5c9a` still showed browser/nav-scroll failures before generated navigation buttons. Logs proved `window.HD20_NAV` was defined while the button population remained deferred until `DOMContentLoaded`.
- `index.html` places the static `.beginnerNav` and core dashboard DOM before the script chain, while many classic parser-blocking scripts follow. Waiting for the final `DOMContentLoaded` unnecessarily delayed canonical navigation initialization.
- `beginner-navigation.js` now initializes immediately when the already-parsed static `.beginnerNav` exists, with a one-time guard and `DOMContentLoaded` fallback only if the nav is genuinely unavailable. This is production boot hardening, not a CI bypass.
- Five-area order, dashboard default, deep-link normalization and dashboard-native maturity behavior are unchanged. No auth, store, KPI or Supabase write path changed; no server-side forced empty write was introduced.

## 2026-09-17 — Playwright DOM probe correction
- Chromium run `35096738551` on HEAD `de8a0952c9c820aeb8ba99c6492d18dc7e0a58a2` proved the early-nav production fix worked: Playwright resolved `.beginnerNav` as visible with controller `canonical-five-area-v10-early-boot`, but the `waitForSelector(... state:'attached')` readiness call still timed out before functional assertions.
- Main browser smoke now uses `waitForFunction(() => document.querySelector(...))` for boot DOM-existence probes. This removes the contradictory selector-state wait while retaining explicit controller, dashboard priority, operational bridge and maturity readiness.
- The browser contract again checks 5 top KPI cards, 6 health metrics, zero legacy landing panels, forbidden legacy Audit labels, advancement separation/actor semantics, exact five-area order and dashboard-native maturity behavior.
- This change is test-only. Production application/auth/store/KPI/Supabase behavior is unchanged and no server-side forced empty write was introduced.

## 2026-09-17 — Cross-workflow DOM probe alignment
- The same contradictory attached-selector readiness pattern remained in nav-scroll, current-IA, subtab-contract-grid, dashboard-canonical, design-layout and resource-initiator diagnostic workflows.
- All six workflows now use direct DOM existence probes with `waitForFunction` for boot-only readiness. Functional assertions were retained rather than weakened.
- Subtab modal readiness was also converted to an explicit class-state DOM probe. Design-layout now uses the same CI-only external-script stub policy as the other browser workflows so external SDK availability does not block local static UI validation.
- Production HTML/JS, authentication, Supabase data behavior, KPI calculations and write paths were not changed. No server-side forced empty write was introduced.

## Validation boundary
Pages deployment success alone is not browser E2E proof. Chromium workflow results must be checked separately; CI request isolation remains test-only.
