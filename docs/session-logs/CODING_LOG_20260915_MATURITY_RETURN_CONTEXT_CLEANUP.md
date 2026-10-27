# CODING LOG — Maturity Return Context Cleanup

Date: 2026-09-15

## Code contract
`hd20MaturityMapReturnV1`은 고도화 Case에서 Activity Grid로 들어간 exact 왕복 세션에만 유효해야 한다.

### 추가 함수
- `clearReturn()` — sessionStorage return key 제거.
- `resetGridQuery()` — `#hd20GridSearch` 값을 비우고 input 이벤트 발생.
- `explicitGridClose(e)` — Grid close button / backdrop / Escape만 명시적 종료로 판정.

### 종료 규칙
- `returnToSource()`에서는 검색어만 초기화하고 return Context는 보존한다.
- operational guard의 `returnToMap()` → `restoreReturnFocus()`가 Activity ID + 생산팀 exact 1건을 찾은 경우에만 기존 `clearReturn()`이 실행된다.
- 사용자가 Grid 자체를 닫아 왕복을 포기한 경우 exact focus guard가 Context를 즉시 삭제한다.

### Cache
`final-layout-polish.js` loader:
`hd20-maturity-grid-exact-focus-guard.js?v=20260915-3`

## Regression invariants
- fuzzy team/workplace matching 없음.
- first-row fallback 없음.
- ambiguous ID fail-closed 유지.
- production data write/Supabase write 변경 없음.
- Action Audit Prefill loader 경로 변경 없음.