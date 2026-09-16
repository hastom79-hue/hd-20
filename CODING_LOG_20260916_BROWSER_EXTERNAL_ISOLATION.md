# CODING LOG — 2026-09-16 — Browser external isolation

## `.github/workflows/browser-smoke.yml`
- Added Playwright request routing before navigation.
- Local `127.0.0.1` / `localhost` resources continue normally.
- External CDN/service requests are aborted only inside CI smoke, preventing parser-level DOMContentLoaded stalls.
- Main navigation transitions use in-page DOM click so the smoke tests navigation logic independently of an auth overlay caused by intentionally unavailable external auth SDK.
- Maturity visibility now requires both absence of `hd20DashboardSectionHidden` and `hidden === false`.

## Evidence before repair
Run 35055073397 failed at `page.goto` waiting for `domcontentloaded`; Chromium installation and local web server steps passed. No UI assertion was reached.

## Safety
No production application file or data-write path was changed. The smoke still requires exact five-area navigation, visible body, no auth-pending class, dashboard priority/bridge, dashboard maturity active state, no standalone maturity nav, and no legacy maturitymap URL state.
