# Coding Log — Recurrence Confirmation Close Guard

Date: 2026-09-15

## Changed files
- `audit-close-evaluation.js`
- `final-layout-polish.js`

## Logic
Added `recurrenceKnown(a)` compatible with the existing trace model. A recurrence value is known only when boolean `recurrence` exists or a non-empty recurrence field exists and is not `미확인`.

`closureState(d)` now returns:
- `linked`
- `open`
- `unverified`
- `recurrencePending`
- `recurrence`
- `canMaintain`

`canMaintain` requires zero `open`, `unverified`, `recurrencePending`, and `recurrence` rows, while preserving the exact linkage requirement for improvement-request Audits.

`evaluate(..., '유지', ...)` now throws `재발 미확인 Action N건이 있어 유지 판정할 수 없습니다.` before the actual recurrence check.

## Compatibility validation
Existing `audit-action-case-trace.js` already models `미확인 / 미발생 / 재발` and exposes `재발확인 대기`; this change aligns close-evaluation semantics with that existing UI/state model. No fuzzy team/workplace matching was introduced. No server-side forced empty write was introduced.