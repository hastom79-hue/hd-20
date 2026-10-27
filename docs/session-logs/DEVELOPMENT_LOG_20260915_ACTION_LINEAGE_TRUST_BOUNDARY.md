# Development Log — Action lineage trust boundary

Date: 2026-09-15

## Validation finding
During Audit → Action registration, the Action ID integrity guard can replace a colliding generated ID and emit `hd20-action-updated` with `replacedId`. The linkage listener previously accepted any event carrying a `replacedId` while a registration attempt was active. That left a narrow lineage-confusion path where an unrelated event could nominate an existing exact ID.

## Change
- Replacement-ID handoff is trusted only when event source is exactly `action-id-integrity-guard`.
- The replacement target must exist as exactly one current Action row.
- The replaced old ID must have existed in the pre-registration snapshot.
- Normal newly-created IDs remain constrained to exactly one unseen exact-ID match.
- Ambiguous/missing matches fail closed; no first-row/fuzzy/team/workplace fallback was introduced.
- Refreshed loader to `action-audit-linkage.js?v=20260915-3`.

## Preserved invariants
Production filtering, Audit exact-ID lineage, Supabase behavior, and the no-server-forced-empty-write rule are unchanged.
