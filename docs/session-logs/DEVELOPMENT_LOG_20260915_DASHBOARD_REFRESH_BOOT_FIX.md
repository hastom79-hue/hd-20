# DEVELOPMENT LOG — Dashboard Refresh Boot Fix

## 발견 오류
고도화 맵에서 `open()` 시 URL에 `?tab=maturitymap`을 기록하고, `beginner-navigation.js` 초기화가 새로고침 시 해당 query를 다시 읽어 고도화 맵을 자동 재개했다. 이 때문에 사용자가 브라우저 새로고침을 하면 첫 화면이 대시보드가 아니라 고도화 맵이 되는 오류가 발생했다.

## 수정
- 앱 최초 부팅/새로고침은 무조건 `dashboard`로 시작한다.
- Dashboard 진입 시 URL의 `tab`, `sub` 상태를 제거한다.
- 탭 클릭 중에는 기존 `HD20_NAV.go()`를 통해 각 영역 이동을 유지한다.
- 첫 탭과 active 상태는 `① 대시보드`로 고정한다.

## 검증 원칙
앞으로 단순 탭 클릭뿐 아니라 새로고침, query 잔존, 뒤로가기/재진입 등 초기화 경로를 기술 검증 범위에 포함한다.

## 데이터 불변조건
Supabase/localStorage 생산 데이터 write 로직은 변경하지 않았으며 server-side forced empty write도 추가하지 않았다.
