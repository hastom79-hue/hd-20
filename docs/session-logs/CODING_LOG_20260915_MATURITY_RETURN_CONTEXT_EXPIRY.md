# HD20 코딩로그 — 고도화 복귀 Context 만료/이탈 정리

## 대상
- `hd20-maturity-grid-exact-focus-guard.js`
- `final-layout-polish.js`

## 구현
`RETURN_TTL = 15 * 60 * 1000`을 추가했다.

`readReturn()`은 raw sessionStorage 값을 그대로 신뢰하지 않고 다음을 검증한다.
- `id` 존재
- `at` timestamp 존재
- 현재시각 - `at` <= TTL

조건을 만족하지 않으면 `clearReturn()` 후 null을 반환한다.

`abandonedMainNav(e)`를 추가하여 pending return Context가 있는 상태에서 `.beginnerNav button[data-key]` 중 `maturitymap`, `advancement` 이외 영역으로 이동하면 Context를 제거한다. 정상 왕복에 필요한 maturitymap ↔ advancement 전환은 보존한다.

`validate()`에 `ageMs`를 포함해 런타임 진단 시 Context 나이를 확인할 수 있게 했다.

## 캐시 버전
`hd20-maturity-grid-exact-focus-guard.js?v=20260915-4`

## 회귀 안전성
- `exactRows()`의 Activity ID 완전일치 유지.
- 생산팀 완전일치 보조조건 유지.
- `hits.length === 1` fail-closed 유지.
- 정상 returnToSource → operational guard `returnToMap()` → `restoreReturnFocus()` 흐름 유지.
- production 데이터 필터/DB sync/server write 미변경.
