# Coding Log — 2026-09-16 Five-Area Architecture

## beginner-navigation.js
- Main NAV: dashboard/activity/advancement/audit/action = 5 areas.
- Removed standalone maturitymap button.
- Renumbered Audit ④, Action ⑤.
- Added role-oriented labels and Closed Loop hint.
- `HD20_NAV.areas` changed to five canonical areas.
- legacy maturitymap/map/maturity navigation is redirected to Dashboard `maturity` subtab.

## dashboard-section-tabs.js
- Dashboard tabs changed from 4 to 5.
- Added `maturity` = 고도화 맵 / Portfolio·공식확정 Case.
- Maturity tab targets `#hd20MaturityMapTab` and invokes existing maturity map API/event for compatibility.
- Leaving maturity closes legacy map mode.

## hd20-six-nav-layout.js
- Legacy filename is retained for loader compatibility, but CSS contract is now canonical five-area layout.
- Desktop grid changed from repeat(6) to repeat(5).
- Old `hd20SixNavLayoutStyle` is actively removed before installing `hd20FiveNavLayoutStyle`.
- Public runtime API renamed to `HD20_FIVE_NAV_LAYOUT`.

## activity-excel-preview-import.js
- Fixed HTML escaping regression: `&quot;` now includes its terminating semicolon.
- Import batch IDs are retained until DB verification completes.
- Generic DB push success is no longer treated as proof that the current import exists remotely.
- On `ready + push`, `HD20_DB_SYNC.fetchRemote()` is called and the remote canonical payload must contain every imported ID before UI reports `DB 반영 검증 완료`.
- Missing IDs / unavailable remote API / verification error remain explicitly incomplete/error states.

## final-layout-polish.js
- Dashboard section-tabs child cache remains `20260916-five-area-map-7`.
- Legacy six-nav loader cache bumped to `20260916-five-area-2` so the corrected five-column CSS is delivered.

## index.html
- `beginner-navigation.js` cache → `20260916-five-area-3`.
- `activity-excel-preview-import.js` cache → `20260916-remote-verify-3`.
- `final-layout-polish.js` parent cache → `20260916-five-area-cache-23`.

## Safety
- Preview/file parsing does not write Canonical/Supabase data.
- Explicit user confirmation remains required before import.
- No forced empty server write introduced.
- KPI target/achievement semantics unchanged.

## Known migration debt
- `.github/workflows/browser-smoke.yml` still contains standalone `maturitymap` main-nav assumptions and must be migrated.
- `hd20-maturity-map-tab.js` still contains standalone-screen compatibility behavior; next migration should convert it to a pure dashboard panel while preserving legacy deep links.