# HD-20 Coding Log — Activity Import DB Sync Visibility

Date: 2026-09-16

## Files
- `activity-excel-preview-import.js`
- inspected `supabase-sync.js`

## Implementation
- Added `result()` helper to update importer status text.
- Confirmed import now labels Canonical Store completion separately from DB state.
- Added `hd20-db-status` listener:
  - `syncing + push` → `DB 동기화중…`
  - `ready + push` → `DB 동기화 완료`
  - `error` → `DB 동기화 오류`
- Existing `localStorage.setItem` remains the importer write boundary; `supabase-sync.js` owns remote push scheduling.

## Contract
`Excel validation → Preview → explicit confirm → Canonical Store write → existing Supabase sync queue → push status event`

No forced empty remote write added.
