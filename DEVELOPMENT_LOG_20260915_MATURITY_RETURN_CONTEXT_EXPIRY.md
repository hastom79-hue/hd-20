# HD20 개발일지 — 고도화 복귀 Context 만료/이탈 정리

## 목적
고도화 Case → Activity Grid → 원 Case 복귀 경로에서 이전 Case의 sessionStorage 복귀 Context가 장시간 또는 이탈 후 남아 다음 Case 검증에 재사용되는 위험을 제거한다.

## 확인된 잔여 위험
`hd20MaturityMapReturnV1`은 정상 복귀 또는 명시적 Grid 닫기에서는 제거되지만, 사용자가 왕복 경로를 중단하고 다른 메인 업무영역으로 이동하거나 장시간 방치하는 경우 stale Context가 남을 수 있었다.

## 변경
- 복귀 Context TTL 15분 적용.
- ID 누락, timestamp 누락, TTL 초과 Context는 read 시 즉시 삭제.
- 왕복 중 Dashboard/Activity/Audit/Action 등 다른 메인 업무영역으로 이탈하면 Context 삭제.
- maturitymap/advancement 간 정상 왕복은 삭제하지 않음.
- 정상 복귀 시 기존 Activity ID + 생산팀 exact 1건 검증 및 원 Case 복원 흐름 유지.
- Grid 검색어 초기화 및 명시적 닫기/Escape 정리는 기존 동작 유지.

## 불변조건
- exact ID 비교 유지.
- 생산팀 보조키 유지.
- production-only 필터 로직 변경 없음.
- Supabase 동기화/서버 write 변경 없음.
- server-side forced empty write 추가 없음.

## 캐시
`final-layout-polish.js`의 `hd20-maturity-grid-exact-focus-guard.js` loader를 `v=20260915-4`로 갱신.

## 후속 검증
index.html의 final-layout loader 자체 cache freshness와 Case A → 이탈 → Case B 재진입 시 Context 재사용 여부를 계속 검증한다.
