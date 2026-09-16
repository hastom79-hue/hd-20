# Coding Log — Browser Smoke Stability

Date: 2026-09-16

- Browser smoke navigation contract fixed to canonical five-area IA: dashboard / activity / advancement / audit / action.
- Removed Playwright `networkidle` dependency from the critical boot test. The page is now considered booted only after DOMContentLoaded plus concrete HD-20 UI selectors are available.
- Added explicit checks that body is visible and `hd20-auth-pending` is cleared in local bypass mode.
- Added dashboard maturity bridge verification: maturity stays inside dashboard, no standalone maturitymap navigation, no `tab=maturitymap` URL state.
- Test scope intentionally focuses first on boot availability and canonical five-area routing so external auth/network activity cannot falsely hang the smoke test.
- No production store write logic changed.
