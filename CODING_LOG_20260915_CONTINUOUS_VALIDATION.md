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

재조회 결과 `index.html`에 신규 cache key가 실제 반영된 것을 확인했다.

## 수정 4 — Browser Smoke 실제 IA 계약 정렬
대상: `.github/workflows/browser-smoke.yml`

기존:
```js
const expected=['dashboard','activity','advancement','audit','action'];
```
이 하나의 배열을 main과 `hdps-dashboard.html` 양쪽에 사용했다.

수정:
```js
const expectedMain=['dashboard','activity','advancement','maturitymap','audit','action'];
const expectedHdps=['dashboard','activity','advancement','audit','action'];
```
- main assertion은 `expectedMain` 사용
- HDPS dashboard assertion은 `expectedHdps` 사용
- main navigation 왕복 smoke에 `maturitymap` 추가

Commit:
`caed3325be526d616b4ae19da3511d2791b0384d`

애플리케이션 코드는 변경하지 않고 실제 IA와 테스트 계약만 일치시켰다.

## 정적 회귀 확인
- ID Integrity Guard는 duplicate ID 건수/Case 수를 별도로 계산하고 동일 ID 2건 이상이면 Activity 상세 Grid 버튼을 disabled 처리한다.
- Operational Guard의 Case 원본 mapping은 팀 + `data-mmt-case` 원본 인덱스를 사용한다.
- Priority Filter Guard도 같은 mapping 규칙으로 통일했다.
- `현재 유지(ok)` 별도 상태키와 legacy `mmtFilter=all` 충돌방지 구조는 유지했다.
- 원 Case 복귀 시 `mmtReturnFocus`가 숨김 상태이면 전체 필터로 전환하는 기존 repair 로직은 유지했다.

## CI 실행 결과 및 원인 분리
- `8f2091b...` 기준 Browser Smoke `34909083051`, Nav Scroll Smoke `34909083054`는 failure.
- Browser Smoke job raw log는 Azure Blob `BlobNotFound`로 회수 불가.
- 이후 main `f7b7f16364bcc71304e63e4c13d2e36924125ffb` 기준 Runtime Smoke `34911473287`의 `smoke` job과 Package Source `34911473301`의 `package` job도 모두 failure이며 step 목록이 비어 있었다.
- 서로 다른 workflow가 실제 step 0개 상태로 동일 실패하므로 해당 CI 적색은 테스트 assertion 실패가 아니라 Runner/Actions 실행 전 단계 문제로 분류했다.
- 따라서 앱 코드를 CI 적색만 보고 임의 수정하지 않는다.

## Browser Smoke 계약 드리프트 해소
현재 실제 구조:
```js
main = ['dashboard','activity','advancement','maturitymap','audit','action'] // 6영역
hdps-dashboard = ['dashboard','activity','advancement','audit','action'] // 5영역
```
기존 Browser Smoke의 단일 5영역 기대값을 분리했다. Runner가 복구되면 main nav assertion이 `maturitymap` 누락 때문에 오탐 실패하지 않도록 했다.

## Exact lineage 코드 재검증
`action-audit-linkage.js`:
- `setPending()`은 `auditDrawId || sourceCaseId`에서 exact Audit ID를 취득한다.
- `patchCreated()`는 생성 Action의 `sourceCaseId`와 `auditDrawId`에 동일 Audit ID를 저장한다.
- 날짜 자동기한은 UTC calendar arithmetic으로 계산하여 KST 하루 밀림을 방지한다.

`hd20-trace-backlink-guard.js`:
- `sourceAuditId()`는 열린 Exact Case Detail의 `원천 Audit ID` 필드만 읽는다.
- `highlight(id)`는 Audit 유지관리 table cell의 trim text가 exact ID와 동일한 행만 선택한다.

`hd20-maturity-map-operational-guard.js`:
- `caseForButton()`은 팀 + `data-mmt-case` 원본 index를 사용한다.
- `openActivity()`는 exact Activity ID를 Grid query로 전달한다.
- `restoreReturnFocus()`도 exact `data-activity-id`로 원 Case를 복원한다.

## 다음 자동 검증
- 신규 Browser Smoke commit의 Actions Runner step 실행 여부
- main 6영역 / HDPS 5영역 Browser 계약 실제 실행
- Pages deploy exact SHA
- 브라우저 runtime `validate()`
- duplicate ID fixture에서 서로 다른 상태의 카드 정렬/필터 독립성
- Grid 왕복 복귀
- Supabase Production Activity/Action sanitize 완료 여부
