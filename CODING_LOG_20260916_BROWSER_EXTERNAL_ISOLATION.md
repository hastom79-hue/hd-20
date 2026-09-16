# CODING LOG — 2026-09-16 — Browser external isolation

## `.github/workflows/browser-smoke.yml`
- Playwright request routing is installed before navigation.
- Local `127.0.0.1` / `localhost` resources continue normally.
- External parser-blocking `script` requests are fulfilled with an empty JavaScript 200 response only inside CI smoke.
- Other external requests are aborted in CI.
- Navigation now waits for `domcontentloaded` and then `.beginnerNav button[data-key="dashboard"]`, rather than treating a committed document as an initialized app.
- Main navigation transitions remain in-page DOM clicks so local UI logic is testable without production auth services.
- Maturity visibility requires `hidden === false` and visible computed display.

## Evidence before repair
Run 35055073397 failed waiting for DOMContentLoaded. A later HEAD 7aa84cfc layout run reached committed navigation but timed out waiting for the dashboard button. The repository index already contains the `.beginnerNav` container, while `beginner-navigation.js` injects the buttons on DOMContentLoaded. This isolated the remaining CI failure to parser/DOMContentLoaded progression rather than a missing navigation source file.

## Safety
No production application file, auth policy, canonical store, Supabase write path, KPI calculation, or import path was changed. External script stubbing exists only in the GitHub Actions Chromium test environment.
