# Coding Log — 2026-09-15 — Exact Trace closure semantics

## Files
- `action-effect-recurrence-integrity.js`
- `final-layout-polish.js`

## 구현
`recurrenceValue()`의 explicit known/unknown 판정을 재사용하는 `closure(c)`를 추가했다. 상태 순서는 unlinked → open → effect unverified → recurrence → recurrence pending → closed 이다.

`reconcileExactTraceUi()`는 각 Action ID의 실제 저장 row를 조회해 closure pill과 재발 cell을 함께 교정한다. `reconcileExactCaseUi()`는 Exact Case Detail의 Action ID를 읽고 label=`재발` 필드를 실제 recurrence 상태로 다시 표시한다.

`patchTraceClosureApi()`는 기존 production trace guard의 private legacy closure가 외부 API로 노출된 뒤에도 공개 API가 최신 fail-closed 판정을 사용하도록 보정한다. queue/boot/mutation 경로에서 재적용하여 로드 순서 차이에도 수렴하도록 했다.

## Cache
`final-layout-polish.js` 내부 recurrence integrity loader를 `v=20260915-2`로 갱신했다.

## Safety
ID 추정 연결 없음. production filter 수정 없음. DB/Supabase 저장 동작 수정 없음. server-side empty write 없음.