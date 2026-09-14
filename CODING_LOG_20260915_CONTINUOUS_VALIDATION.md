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

## 정적 회귀 확인
- ID Integrity Guard는 duplicate ID 건수/Case 수를 별도로 계산하고 동일 ID 2건 이상이면 Activity 상세 Grid 버튼을 disabled 처리한다.
- Operational Guard의 Case 원본 mapping은 팀 + `data-mmt-case` 원본 인덱스를 사용한다.
- 이번 Priority Filter Guard 수정도 같은 mapping 규칙으로 통일했다.
- `현재 유지(ok)` 별도 상태키와 legacy `mmtFilter=all` 충돌방지 구조는 유지했다.
- 원 Case 복귀 시 `mmtReturnFocus`가 숨김 상태이면 전체 필터로 전환하는 기존 repair 로직은 유지했다.

## 다음 자동 검증
- `index.html` final-layout cache 갱신
- Pages deploy exact SHA
- 브라우저 runtime validate()
- duplicate ID fixture에서 서로 다른 상태의 카드 정렬/필터 독립성
- Grid 왕복 복귀
- Supabase Production Activity/Action sanitize 완료 여부
