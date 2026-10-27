# HD-22 Background Override Fix

- Date: 2026-09-15
- Issue: HD-20 `styles.css` had the HD-22 background token, but later-loaded `hd20-overhaul.css` applied a body gradient, so the deployed main screen did not visually change.
- Fix: Added an explicit `html,body{background:#F4F6F8!important}` override in `styles.css` so the HD-22 background wins the existing cascade without changing cards, navigation, data, or workflow behavior.
- Scope: visual background only.
- Invariants: no storage/Supabase/write-path changes; no server-side forced empty writes.
