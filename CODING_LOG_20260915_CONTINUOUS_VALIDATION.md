# HD-20 코딩일지 — 연속 실행·검증 2026-09-15

## 수정 1 — 중복 Activity ID 상태에서 잘못된 Case 참조 제거
대상: `hd20-maturity-map-priority-filter-guard.js`

기존 방식:
```js
const m=new Map();
... m.set(id,x)
state(btn,map) => map.get(btn.dataset.activityId)
```

문제:
- Activity ID 중복 시 뒤 Case가 앞 Case를 덮어씀.
- Integrity Guard는 중복 Drill-down을 막지만 우선순위/필터 상태까지 보호하지 못함.

수정 방식:
```js
canonical() => team별 canonical source 보존
sourceForButton(btn) => team + data-mmt-case 원본 인덱스로 exact source 복원
state(btn) => operational guard stateOf(sourceForButton(btn))
```

추가 검증 API:
```js
HD20_MATURITY_PRIORITY_FILTER_GUARD.validate()
```
반환:
- cards
- mapped
- unmapped
- mode
- mappingSafe

Commit:
`f3d70c7661bf06f1374dd4b3dccddf7f9a3543e1`

## 수정 2 — 동적 loader cache 갱신
대상: `final-layout-polish.js`

변경:
`hd20-maturity-map-priority-filter-guard.js?v=20260914-2`
→
`hd20-maturity-map-priority-filter-guard.js?v=20260915-1`

Commit:
`92ae12a4da03b100f927f5f444adea4630588e1f`

## 수정 3 — index loader cache 갱신
대상: `index.html`

변경:
`final-layout-polish.js?v=20260914-38`
→
`final-layout-polish.js?v=20260915-1`

Commit:
`8f2091b782427b702f184728a6dd07f4c3c50921`

main 재조회로 새 cache key가 실제 반영된 것을 확인했다.

## 수정 4 — DB Sync API 초기 노출 race 제거
대상: `supabase-sync.js`

기존에는 인증 사용자 확인 후 최초 remote fetch/apply/sanitize push가 끝난 뒤에만 `window.HD20_DB_SYNC`가 노출됐다. Health Guard는 `HD20_DB_SYNC.fetchRemote`를 유한 retry로 기다리므로 느린 초기 hydration에서 retry 소진 가능성이 있었다.

수정 후 인증 사용자 확인 직후 API를 노출하고 기존 hydration을 계속 수행한다. `fetchRemote()`는 동일 client/user를 사용하며 sanitize/preserve/conflict 규칙과 push payload는 변경하지 않았다.

Commit:
`84113306bc0c002898b0e02c170eed53c5c12c3e`

## 정적/기술 회귀 확인
- ID Integrity Guard는 duplicate ID 건수/Case 수를 별도로 계산하고 동일 ID 2건 이상이면 Activity 상세 Grid 버튼을 disabled 처리한다.
- Operational Guard의 Case 원본 mapping은 팀 + `data-mmt-case` 원본 인덱스를 사용한다.
- Priority Filter Guard도 같은 mapping 규칙으로 통일했다.
- `현재 유지(ok)` 별도 상태키와 legacy `mmtFilter=all` 충돌방지 구조는 유지했다.
- 원 Case 복귀 시 `mmtReturnFocus`가 숨김 상태이면 전체 필터로 전환하는 기존 repair 로직은 유지했다.
- Trace backlink는 `원천 Audit ID` exact field만 읽고 `#hd20AuditCloseEvaluation`에서 exact cell ID 행만 선택한다.
- Browser Smoke는 5-area 배열을 기대하지만 Runtime Smoke는 6-area canonical navigation을 검사한다. CI test contract 자체의 불일치다.
- 최신 Browser Smoke failure는 steps 0개, log blob 없음으로 테스트 코드 실행 이전 Runner 단계 실패로 확인했다.
- 서버측 강제 empty write는 추가하지 않았다.

## 다음 자동 검증
- Browser Smoke main expected를 6-area로 정합화하고 HDPS dashboard expected와 분리
- Pages deploy exact SHA
- 브라우저 runtime `validate()`
- duplicate ID fixture에서 서로 다른 상태의 카드 정렬/필터 독립성
- Grid 왕복 복귀
- Supabase Production Activity/Action sanitize 완료 여부
