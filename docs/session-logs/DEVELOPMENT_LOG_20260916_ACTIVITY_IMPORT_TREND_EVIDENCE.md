# Development Log — 2026-09-16 Activity Import Trend / Evidence

## Implemented
- Added recent 12-month Production Excel Import trend with month-over-month delta.
- Added team-level reference signals: previous-month decrease and current-month activity gap.
- Activity-gap detection is only enabled when a real team leader master exists; no synthetic team population is created.
- Added current-month canonical evidence table: ID, date, team, activity type, problem text.
- Added trend, decrease-team, activity-gap-team, and evidence IDs to mail preview.
- Signals are explicitly labeled reference signals, not official target achievement/failure judgments.

## Safety
- Demo/Test/E2E rows remain excluded through `HD20KPIData.isNonProdRow()`.
- No new write path.
- Excel Preview remains non-persistent until explicit confirmation.
- No server-side forced empty write.
- Mail remains manual `mailto:` compose only.

## Cache
- `activity-import-analysis-mail-preview.js?v=20260916-trend-evidence-5`