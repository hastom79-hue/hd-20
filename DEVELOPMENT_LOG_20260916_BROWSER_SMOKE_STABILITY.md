# Development Log — Browser Smoke Stability

Date: 2026-09-16

## Purpose
Stabilize executable browser validation after the five-area IA and dashboard-native maturity map conversion.

## Changes
- Critical Playwright navigation changed from `waitUntil: networkidle` to `domcontentloaded` plus explicit application readiness selectors.
- Browser contract verifies five main areas only.
- Dashboard maturity is verified as a dashboard subtab/panel, not a sixth standalone area.
- Boot validation checks visible body and cleared local auth-pending state.

## Validation boundary
GitHub Pages deployment success alone is not browser E2E proof. Browser smoke result must be checked separately. This change does not bypass production authentication and does not modify canonical operational data.
