# Development Log — Recurrence Confirmation Close Guard

Date: 2026-09-15

## Finding
Audit 종료평가의 `유지` 조건은 완료 및 효과검증, 실제 재발 차단은 수행했지만 `recurrenceState=미확인` 또는 재발 확인값 부재를 명시적으로 차단하지 않았다. 반면 Audit↔Action Case Trace는 `recurrenceKnown()`을 사용해 `재발확인 대기`를 별도 상태로 표시하고 있었다.

## Fix
- `audit-close-evaluation.js`에 `recurrenceKnown()` 추가.
- 정확 Audit ID로 연결된 모든 생산 Action에 대해 완료 → 효과검증 → 재발확인 순서를 강제.
- 효과검증 완료 후 재발확인이 없는 Action은 `recurrencePending`으로 분류.
- `유지` 저장 시 `recurrencePending`이 1건 이상이면 차단.
- 화면 폐쇄상태에 `재발확인 대기 N` 표시.
- 종료평가 snapshot에 `finalEvaluationRecurrencePendingActions` 저장.
- `미흡` 저장 규칙과 생산/비생산 필터, 정확 Audit ID linkage는 변경하지 않음.

## Invariants
- 서버 측 강제 빈값 write를 추가하지 않음.
- Supabase sync/sanitize/conflict 정책 변경 없음.
- Action 연계는 `auditDrawId || sourceCaseId` exact equality 유지.
- 1:N Audit→Action은 연결된 모든 Action이 조건을 만족해야 `유지` 가능.

## Cache
`final-layout-polish.js`의 Audit Close Evaluation loader를 `audit-close-evaluation.js?v=20260915-2`로 갱신.