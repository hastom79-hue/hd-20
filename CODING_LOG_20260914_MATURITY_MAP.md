# HD-20 코딩일지 — 고도화 맵 / Exact Drill-down / Filter Isolation

작성일: 2026-09-14

## 1. 목적
이번 코딩일지는 고도화 맵 Top-level 기능과 Activity exact Drill-down, 복귀 흐름, 운영상태 필터/정렬 보완 과정에서 실제 코드가 어떻게 변경되었는지 추적하기 위한 기록이다.

원칙:
- 원본 데이터는 canonical source만 사용
- stable Activity ID exact match 사용
- fuzzy team/workplace lineage 금지
- 기존 Audit/Action canonical rule 침범 금지
- index 전체교체 시 회귀보호 구조 보존

---

## 2. `hd20-maturity-map-tab.js`
### 역할
독립 Top-level `maturitymap` 화면을 생성하고 공식확정 Case를 팀 단위로 표시한다.

### 핵심 구현
- `HD20KPIData.load()` 사용
- `isCandidate`, `isConfirmed`, `isMaintained` 사용
- KPI:
  - 후보
  - 공식확정
  - 현재 유지
  - 전환율
- 팀별 Case 카드 생성
- 팀 선택 시 해당 팀 Case만 노출
- Case 상세 Modal 제공

### 정확성 원칙
- 팀 Case 배열의 원본 인덱스를 `data-mmt-case`로 유지
- 화면 정렬 시 DOM 위치만 바뀌고 `data-mmt-case`는 변경하지 않음
- 임의 maturity score 생성하지 않음

### Cache
`hd20-maturity-map-tab.js?v=20260914-2`

---

## 3. `hd20-maturity-map-operational-guard.js`
### 역할
Core map 위에 운영상태, Case 상세연결, Activity exact Drill-down, Grid 복귀 흐름을 추가한다.

### 주요 상수
```js
const TAB='maturitymap'
const ROOT='#hd20MaturityMapTab'
const RETURN_KEY='hd20MaturityMapReturnV1'
```

### Canonical Case source
```js
const rows=a.load().filter(a.isConfirmed)
```
공식확정만 사용한다.

### `stateOf(x)`
운영상태를 계산한다.

유지미흡 직접상태:
```js
x?.valid===false || /유지미흡|부적합|중지|해제|실패/.test(raw)
```

재점검 필요:
```js
/재점검|점검대기|확인필요|재확인|관찰/.test(raw)
```

그 외 maintained 판정:
```js
HD20KPIData.isMaintained(x)
```

### `caseForButton(btn)`
Case 버튼의 team + `data-mmt-case` 원본 인덱스로 canonical source Case를 역조회한다.

```js
const list=canonical().byTeam.get(team)||[]
return list[idx]||null
```

### Activity ID 부여
`decorateCase()`에서 stable key 저장:
```js
btn.dataset.activityId = x.id || x.activityId
```

### Activity 상세 Grid 이동
`openActivity(id)`:
```js
HD20_OPS_V2.go('advancement','standard',{openGrid:true,q:id})
```

fallback:
- `HD20_NAV.go('advancement')`
- `HD20_SUBNAV.select('advancement','standard')`
- `HD20_SUBNAV.openGrid()`
- `#hd20GridSearch`에 Activity ID 입력

### 복귀 Context
Grid 진입 전:
```js
sessionStorage.setItem('hd20MaturityMapReturnV1', JSON.stringify({id,team,at:Date.now()}))
```

### Grid 복귀 버튼
Canonical Grid 열림 시:
```text
← 고도화 맵으로 돌아가기
```

### 복귀 동작
`returnToMap()`:
- Universal Grid close
- maturitymap 이동
- map open 재보장
- `restoreReturnFocus()` 호출

### `restoreReturnFocus()`
- exact `data-activity-id` 조회
- 원 Team open
- 원 Case `mmtReturnFocus` class 적용
- scrollIntoView
- 2.2초 후 highlight 제거
- sessionStorage return context 삭제

### API
```js
window.HD20_MATURITY_MAP_OPERATIONAL_GUARD={
  ensureOpen,
  sortCases,
  decorate,
  stateOf,
  openActivity,
  returnToMap,
  restoreReturnFocus,
  applyFilter,
  validate
}
```

### Cache
`hd20-maturity-map-operational-guard.js?v=20260914-6`

---

## 4. 기존 priority 로직 문제 발견
기존 `priority(btn)`:
```js
return (s.attention?2:0) + (s.performance==='유지미흡'?1:0)
```

문제:
- 현재 유지 + 재점검 필요 = 2
- 유지미흡 단독 = 1

따라서 재점검 단독 Case가 유지미흡 단독보다 앞설 수 있었다.
운영 우선순위는 `유지미흡 → 재점검 필요 → 현재 유지`가 더 적절하므로 별도 Guard에서 보정했다.

---

## 5. `hd20-maturity-map-priority-filter-guard.js`
### 최초 추가
신규 파일로 추가.

초기 기능:
- `현재 유지` 필터 추가
- 우선순위 재정렬
- 복귀 Case가 필터에 숨으면 자동 `전체` 전환

### 우선순위 보정
```js
rank=(s.performance==='유지미흡'?2:0)+(s.attention?1:0)
```

결과:
1. 유지미흡 + 재점검 필요 = 3
2. 유지미흡 = 2
3. 현재 유지 + 재점검 필요 = 1
4. 현재 유지 = 0

동일 rank는 최신 판정일 우선.

### DOM 정렬 방식
Core DOM 순서를 직접 다시 append하지 않고 CSS order 사용:
```js
x.card.style.order=String(i)
```

이유:
- 원 `data-mmt-case` 인덱스 보존
- source mapping 영향 최소화

---

## 6. `현재 유지` 필터 충돌 발견
기존 operational guard의 `applyFilter()`는 다음 3개 mode만 처리한다.
```js
all
weak
review
```

신규 Guard가 `ok`를 동일 `data-mmt-filter` 값으로 쓰면, 데이터 갱신/refresh 타이밍에 기존 Guard가 `mode==='ok'`를 해석하지 못해 모든 Case를 숨길 수 있다.

### 수정 방법
신규 Guard에 별도 상태키 사용:
```js
const MODE='mmtPriorityFilter'
```

### `setMode(r,mode)`
```js
r.dataset[MODE]=mode
if(mode==='ok') r.dataset.mmtFilter='all'
```

즉:
- 신규 Guard는 `mmtPriorityFilter='ok'`
- legacy Guard에는 `mmtFilter='all'`
- legacy refresh가 들어와도 전체 숨김 발생하지 않음
- 신규 Guard가 최종적으로 현재 유지 Case만 표시

### `modeOf(r)`
```js
return r.dataset[MODE] || r.dataset.mmtFilter || 'all'
```

### 현재 필터 처리
```js
show = mode==='all'
  || (mode==='weak' && s.performance==='유지미흡')
  || (mode==='review' && !!s.attention)
  || (mode==='ok' && s.performance==='현재 유지')
```

### 복귀 시 숨김 보정
`repairReturnVisibility()`:
- `mmtReturnFocus` Case가 `data-mmt-filter-hidden='1'`이면
- mode를 `all`로 바꿈
- legacy `mmtFilter='all'`
- filter 재적용
- Case scroll

### Cache
최종:
`hd20-maturity-map-priority-filter-guard.js?v=20260914-2`

---

## 7. `final-layout-polish.js`
### 역할
동적 Guard/script loader.

### 추가된 maturity scripts
```js
['hd20SixNavLayoutScript','hd20-six-nav-layout.js?v=20260914-1']
['hd20MaturityMapTabScript','hd20-maturity-map-tab.js?v=20260914-2']
['hd20MaturityMapOperationalGuardScript','hd20-maturity-map-operational-guard.js?v=20260914-6']
['hd20MaturityMapPriorityFilterGuardScript','hd20-maturity-map-priority-filter-guard.js?v=20260914-2']
```

### 회귀보호
기존 retired stylesheet 제거 MutationObserver 구조를 유지했다.
기존 Audit/Action/Retention dynamic loader 목록도 그대로 유지했다.

---

## 8. `index.html`
### 수정 목적
`final-layout-polish.js`의 신규 loader를 브라우저 캐시에 즉시 반영하기 위한 cache bust.

### 변경
```text
final-layout-polish.js?v=20260914-35
→
final-layout-polish.js?v=20260914-36
```

### 반드시 보존한 항목
```html
<div class="cardBody"><div class="trendBox"></div></div>
```

Supabase auth:
```text
supabase-auth.css?v=20260914-accesspopup-2
supabase-auth.js?v=20260914-accesspopup-5
```

기존 주요 canonical scripts도 변경하지 않음.

---

## 9. `beginner-navigation.js`
### 변경 목적
Top-level 6영역 지원.

버튼:
- dashboard
- activity
- advancement
- maturitymap
- audit
- action

maturitymap은 일반 subtab area와 다르게 별도 이벤트로 연다.

Cache:
`beginner-navigation.js?v=20260914-map-1`

---

## 10. `hd20-six-nav-layout.js`
### 역할
6개 Top-level navigation responsive layout.

- Desktop: 6 columns
- <=1100px: 3 columns
- <=720px: 2 columns

Cache:
`hd20-six-nav-layout.js?v=20260914-1`

---

## 11. Activity ID Grid 검색 검증
`openActivity()`는 Activity ID를 `q`로 전달한다.

확인 항목:
- `advancement.standard` Canonical Grid가 열리는가
- Evidence/Grid row에 Activity ID가 포함되는가
- `#hd20GridSearch`가 row 전체 text 검색인가

검증 결과:
- Activity ID는 Advancement Standard 근거행의 검색 가능한 필드에 포함
- q=Activity ID로 exact Case row 필터 가능
- 별도 fuzzy matcher 불필요

---

## 12. 배포 Commit 흐름
### `ec4132aadec2747550810b6107a313ed2d2b0763`
- priority guard 첫 적용 및 index cache 반영
- Pages build success
- Pages deploy success
- report success
- deploy log exact:
```text
pages_build_version = ec4132aadec2747550810b6107a313ed2d2b0763
Reported success!
```

### `ba398e17628cb3b8d3db027a21c2e269c85786af`
- 현재 유지 filter 상태를 legacy state와 분리

### `392fbb869605404ce83bd1732950947cec070828`
- loader에서 priority filter guard cache v2 적용

### `158f7f51c32e6f8de6b56a4b4803832a956a0c43`
- index의 `final-layout-polish.js` cache v36 적용
- Pages run 생성 확인
- 최종 Pages exact SHA 확인은 후속 검증 대상으로 유지

### 문서화 commit
- 개발일지 신규 파일 작성 commit은 기능 commit 이후 별도 문서 commit으로 남긴다.
- 문서 commit 이후 `main SHA`와 실제 배포 기능 SHA가 달라질 수 있으므로 보고 시 구분한다.

---

## 13. CI / Runner 주의
일반 smoke workflow는 최근 반복적으로 Runner step 시작 전 failure 패턴을 보였다.
따라서 아래 기준으로 기록한다.

- `steps:null` 또는 app test step 미실행 → 기능 failure로 단정 금지
- Pages Build/Deploy success + exact `pages_build_version` → 배포 성공 근거
- 브라우저 E2E는 실제 Playwright/브라우저 step 수행+pass일 때만 성공 선언

---

## 14. 회귀방지 체크리스트
코드 수정 전/후 반드시 확인:
- [ ] `trendBox` 구조 보존
- [ ] Supabase auth version 보존
- [ ] `HD20KPIData.isConfirmed()` 공식확정 기준 보존
- [ ] `HD20KPIData.isMaintained()` 유지 기준 보존
- [ ] Demo/E2E 생산 제외
- [ ] Activity→Audit fuzzy lineage 없음
- [ ] Activity Drill-down exact ID만 사용
- [ ] Map return context exact Activity ID 기준
- [ ] 현재 유지 filter가 legacy `mmtFilter`와 충돌하지 않음
- [ ] index 전체 replace 전 최신 SHA fetch
- [ ] cache bust 후 Pages exact SHA 확인

---

## 15. 앞으로 코딩일지 기록 형식
모든 기능 변경 시 아래를 빠짐없이 남긴다.
1. 날짜/시간
2. 사용자 요구사항
3. 재현 증상
4. 근본 원인
5. 수정 파일
6. 수정 함수/상태키/이벤트
7. canonical rule 영향
8. backward compatibility
9. cache version
10. commit SHA
11. source validation
12. Pages exact SHA
13. browser/runtime validation
14. 잔여위험
15. 다음 검증 항목
