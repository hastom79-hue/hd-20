# CODING LOG — Dashboard Refresh Boot Fix

## Root Cause
`hd20-maturity-map-tab.js`가 고도화 맵 진입 시 URL `tab=maturitymap`을 저장했고, 기존 `beginner-navigation.js:init()`이 reload 시 `tab` query를 복원했다.

## Code Change
`beginner-navigation.js`
- `init()`의 query 기반 자동 복원 제거
- 초기화 시 `go('dashboard', nav)` 강제
- Dashboard 진입 시 `tab/sub` query 제거
- controller marker: `canonical-six-area-v8-dashboard-boot`

## Expected
- 일반 접속: Dashboard
- 고도화 맵 사용 후 F5/새로고침: Dashboard
- 다른 탭 사용 후 새로고침: Dashboard
- 탭 클릭 이동: 기존 기능 유지

## Safety
데이터 저장/Supabase 동기화 로직 변경 없음. forced empty write 없음.
