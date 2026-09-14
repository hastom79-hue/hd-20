# HD-20 코딩일지 — Maturity Activity ID Integrity Detail

작성일: 2026-09-14

## 변경 목적
고도화 맵의 Activity exact Drill-down이 ID 중복/누락 데이터에서 ambiguous 결과를 만들지 않도록 차단하고, 운영자가 해당 Case를 화면에서 직접 식별할 수 있도록 상세 모달을 추가한다.

## 수정 파일 1: `hd20-maturity-id-integrity-guard.js`
Cache: `v=20260914-2`

### 신규 상수
```js
const MODAL='hd20MaturityIdIntegrityModal'
```

### 신규/확장 함수
#### `data()`
- canonical official confirmed rows 로드
- `id || activityId` 기준 count Map 생성
- missing count 계산
- duplicate Map 계산

#### `issues()` 신규
각 공식확정 Case에서 다음을 반환:
```js
{
  id,
  team,
  workplace,
  date,
  status,
  reason
}
```
reason:
- `Activity ID 누락`
- `Activity ID 중복 (N건)`

#### `summary()` 확장
- 이상 없음: 정상 문구
- 누락/중복 존재: `data-actionable="1"`, keyboard focus 가능
- 클릭 안내 문구 표시

#### `ensureModal()` 신규
- `#hd20MaturityIdIntegrityModal` 최초 1회 생성
- role=dialog / aria-modal 적용
- close button / backdrop close 지원

#### `openIssues()` 신규
- `issues()` 결과를 table로 렌더링
- columns: Activity ID / 생산팀 / 작업장 / 판정일 / 상태 / 이상 사유
- 정상 시 empty-state 표시

#### `protectDetail()` 유지/강화
```js
n===1  -> enabled
n===0  -> disabled / Activity ID 확인 필요
n>=2   -> disabled / Activity ID 중복 · 상세 Grid 차단
```
정상으로 복원될 때 기존 disabled/title/text 상태도 제거/복원.

#### `validate()` 확장
```js
{
  confirmed,
  missing,
  duplicateIds,
  duplicateCases,
  issueRows,
  exactSafe
}
```

### 이벤트
- click: actionable integrity banner → `openIssues()`
- Enter: keyboard open
- Escape: modal close
- data refresh events에서 `refresh()` 재실행
- Map/Case/Detail DOM mutation 시 재검사

### 공개 API
```js
window.HD20_MATURITY_ID_INTEGRITY_GUARD={
  data,
  issues,
  openIssues,
  refresh,
  validate
}
```

## 수정 파일 2: `final-layout-polish.js`
Guard cache:
```text
hd20-maturity-id-integrity-guard.js?v=20260914-1
→
hd20-maturity-id-integrity-guard.js?v=20260914-2
```
Commit:
`29630f855468650780c14e8aaef155a5e501124a`

## 수정 파일 3: `index.html`
Loader cache:
```text
final-layout-polish.js?v=20260914-37
→
final-layout-polish.js?v=20260914-38
```
Commit:
`b27e375b7f432bd42f64e72fb7e418d14790679e`

회귀보호 확인:
```html
<div class="cardBody"><div class="trendBox"></div></div>
```
보존.

Supabase auth cache 보존:
```text
supabase-auth.css?v=20260914-accesspopup-2
supabase-auth.js?v=20260914-accesspopup-5
```

## 기능 Commit
`a7e5da576705ee8e7bbd96d35701199e4c62c879`
- detail modal/list implementation

## 정확성 규칙
- ID 자동 생성/자동 수정 안 함
- duplicate 발견 시 silent first-match 금지
- duplicate/missing Case의 exact drilldown 차단
- production canonical official-confirmed source만 검사
- fuzzy team/workplace match 사용 금지

## Source 검증
- 상세 테이블은 `issues()` 한 source만 사용
- summary/duplicate badge/button-disable도 동일 `data()` count Map 사용
- 따라서 summary count와 상세 Case 판정 기준이 동일함

## Responsive
Desktop:
- modal max-width 920px
- max-height 86vh

Mobile <=720px:
- modal full-screen
- table min-width 680px + horizontal scroll

## CI/배포 기록 기준
직전 `d405cb39cc232f0e996b8cf5ae0c08dc02a2fc99` Pages 배포는:
- build success
- deploy success
- report success
- exact `pages_build_version`
- `Reported success!`

새 기능+문서 commit의 최종 Pages SHA는 후속 검증 후 기록한다.

## 잔여위험 / 다음검증
- live production browser source에서 `validate()` 결과 직접 확인 필요
- duplicate fixture가 실제 존재하는 경우 disabled button UX 확인 필요
- runner 기반 browser E2E는 일반 GitHub-hosted Runner start 장애와 분리해서 해석
- 데이터 정정 후 `refresh()`가 stale warning/modal 정보를 제거하는지 확인
