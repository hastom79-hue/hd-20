# DEVELOPMENT LOG — Maturity Return Context Cleanup

Date: 2026-09-15

## 목적
고도화 Case → Activity Grid → 원 Case 왕복 이후 또는 사용자가 Grid를 명시적으로 닫은 뒤 sessionStorage의 복귀 Context와 Grid 검색어가 다음 탐색에 잔존하는 위험을 제거한다.

## 변경
- `hd20-maturity-grid-exact-focus-guard.js`
  - `clearReturn()` 추가.
  - 원 Case 복귀 직전에 `hd20GridSearch`를 초기화하고 input 이벤트를 발생시켜 검색 필터를 정상 복원.
  - Grid 닫기 버튼, 배경 클릭, Escape에 의한 명시적 종료 시 `hd20MaturityMapReturnV1` 삭제.
  - 원 Case 복귀 버튼 경로에서는 Context를 먼저 삭제하지 않고 기존 operational guard가 exact Case 복원 성공 후 삭제하도록 유지.
- `final-layout-polish.js`
  - exact focus guard cache key를 `v=20260915-3`으로 갱신.

## 안전성
- Activity ID + 생산팀 exact 1건 조건 유지.
- ambiguous/missing 자동 선택 없음.
- 서버/Supabase write 로직 변경 없음.
- 강제 빈 배열 서버 쓰기 없음.
- `action-audit-prefill-guard.js?v=20260912-2` 경로 유지.

## 후속 검증
`index.html`의 final-layout loader cache key 갱신 여부와 Actions runner 상태를 별도 연속 검증한다.