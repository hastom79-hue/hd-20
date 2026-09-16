# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Browser contract verifies five main areas only; dashboard maturity remains a dashboard subtab/panel, not a sixth standalone area.
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

## Validation boundary
Pages deployment success alone is not browser E2E proof. Chromium workflow results must be checked separately; CI request isolation remains test-only.
