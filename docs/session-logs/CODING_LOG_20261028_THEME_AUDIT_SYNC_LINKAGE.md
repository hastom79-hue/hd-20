# Coding Log — 2026-10-28 — Theme Audit History, Sync, and Action Traceability

## Scope
- theme-inspection.js
- supabase-sync.js
- index.html
- .github/workflows/maturity-theme-regression.yml
- DEVELOPMENT_LOG.md
- DEVELOPER_GUIDE.md

## Changes
1. Corrected the line-by-theme vulnerability matrix to use the latest saved audit checklist for each line and selected month, rather than counting action rows. Repeated findings therefore remain visible even when they are deduplicated against an already-open action.
2. Added a visible selected-month audit history table (latest eight attempts), with audit time, line, team, NG count, pass rate, linked action count, and observation memo. Historical audit records remain append-only.
3. Added hd20ThemeAuditChecksV1 to the canonical Supabase payload sync. If an older remote payload does not yet contain this key, existing local history is preserved and scheduled for push rather than discarded.
4. Linked repeat findings to existing active actions through relatedAuditRecordIds, lastAuditRecordId, lastAuditedAt, and recheckCount; newly created actions retain the originating audit record ID. This avoids duplicate open actions while preserving the recheck trail.
5. Corrected date/month/due-date calculation to Korea Standard Time and made local-storage write failures explicit.
6. Bumped cache keys for theme-inspection.js and supabase-sync.js. The dashboard source, layout, and calculations were not changed.
7. Extended the regression workflow to check JavaScript syntax, matrix source, visible history, audit-sync migration preservation, action traceability, and cache versions.

## Validation
- The regression workflow is configured to run on the affected file paths and on manual dispatch.
- Live authenticated cross-session Supabase synchronization cannot be simulated by static repository checks; it remains a distinct production-session verification item.
- No dashboard files or dashboard selectors were changed in this patch.
