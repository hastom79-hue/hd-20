# HD-20 코딩일지 — Boot Stabilization / Regression QA (2026-09-17)

## 범위
브라우저 초기 구동, canonical navigation, dashboard canonical smoke, resource trace 및 최종 회귀검증.

## 변경/검증 기록
### `a9068e5422df7d8446d9e56049547e76f9250980`
- file: `.github/workflows/runtime-smoke.yml`
- change: stale `canonical-five-area-v9-dashboard-map` assertion을 production의 `canonical-five-area-v10-early-boot` 기준으로 정합화.
- reason: production navigation은 이미 5-area v10 canonical이며 CI만 과거 marker를 검사.
- verification: runtime smoke success, package success.

### `e54e870c5974016481a12e6f33e36688289aed51`
- file: `.github/workflows/dashboard-canonical-smoke.yml`
- change: browser boot readiness를 단계별 probe로 분리.
- probes: `.beginnerNav`, `window.HD20_NAV`, `window.HD20_DASHBOARD_TABS`, dashboard nav button, `#hd20DashboardPriority`, `#hd20OperationalBridge`.
- finding: renderer가 막힐 경우 timeout catch 내부 `page.evaluate()`도 hang 가능.

### `90ddbd98734068cae9d56659cd40371e47118473`
- file: `.github/workflows/dashboard-canonical-smoke.yml`
- change: timeout catch에서 `page.evaluate()` 제거, fail-fast error, `try/finally` browser close, top-level `process.exitCode=1`.
- result: runtime smoke success. browser 계열 failure는 계속 존재.

### `e99222cb58099e5e74e9971ae46e1da98cbcbd42`
- files: `index.html` 및 navigation load 위치 관련 변경.
- change: `beginner-navigation.js`를 정적 `.beginnerNav` 직후 조기 로드, 기존 하단 중복 load 제거.
- intent: 긴 초기 script chain 이전에 canonical nav API를 노출.
- result: HD20_NAV browser timeout 잔존.

### `12468e87819f021c4d712be31dbd2b64dc12e49d`
- file: `beginner-navigation.js`
- change: DOMContentLoaded 의존을 줄이고 `.beginnerNav` 출현 시 초기화하도록 조기 boot 경로 보완.
- result: Pages build/deploy와 runtime smoke 성공. dashboard-canonical은 HD20_NAV timeout 잔존.

### `a871cda6ffd45927850931b3a3b5f7bba051efbf`
- file: `.github/workflows/resource-initiator-diagnostic.yml`
- change:
  - CDP Network request/response 추적.
  - local JS response를 `LOCAL_SCRIPT_RESPONSE`로 기록.
  - pageerror 기록.
  - external script stub 유지.
  - `timeout 45s node trace.cjs`로 진단 무한대기 방지.
  - browser close를 finally에서 보장.
- observed:
  - `beginner-navigation.js?v=20260917-five-area-early-boot-1` HTTP 200.
  - `supabase-sync.js`, `supabase-auth.js`, `layout-priority.js`, `app.js`, dashboard/activity/audit/action 및 guard script들이 연속 HTTP 200.
  - trace job success.
  - dashboard-canonical은 별도로 `boot stage HD20_NAV timeout; pageErrors=`.
- conclusion: HTTP load success != script execution/readiness success. 404/resource omission hypothesis는 우선순위 하향.

## 현재 코드 리스크 가설 — 미확정
- 초기 classic script 실행 순서와 navigation boot의 경쟁.
- MutationObserver 또는 초기 DOM 재구성 모듈 간 상호작용.
- 동기식 DOM 작업/초기화가 Playwright execution context 응답을 지연시키는 가능성.
- `final-layout-polish.js`가 후속 dashboard module들을 동적 삽입하므로 dashboard readiness는 nav readiness 해결 후 별도 검증 필요.

위 가설은 증거 확보 전 production 수정 근거로 사용하지 않는다.

## 다음 코딩 순서
1. CI 진단에서 local script의 response뿐 아니라 실행 완료 경계를 측정한다.
2. script prefix/bisection 방식으로 `HD20_NAV`가 정상 생성되는 최대 prefix와 실패하는 최초 prefix를 찾는다.
3. 최초 blocking/competition 파일의 코드를 읽고 최소 수정한다.
4. dashboard-canonical 재실행 후 다음 최초 실패 단계로 이동한다.
5. layout/subtab/nav-scroll/current-ia 로그를 각각 최초 assertion 기준으로 정리한다.
6. 최종 HEAD에서 전체 workflow 회귀검증한다.

## 수정 금지/보호 영역
- 원인 미확정 상태의 Supabase/Auth 변경 금지.
- KPI 산식/데이터 계약 임의 변경 금지.
- Data-save 동작을 CI 통과 목적으로 mock/disable하지 않는다.
- 빈 데이터 강제 write 금지.
- production이 정상인 stale CI는 workflow 쪽을 수정한다.

## 종료조건
동일 HEAD에서 핵심 browser/runtime/source/Pages workflow가 모두 completed/success이고 PC/mobile canonical UI 계약이 검증되어야 종료한다.


## 2026-09-18 후속 코딩·검증 기록
### Boot feedback-loop 및 Maturity
- `85731df`: Activity import preview의 MutationObserver → mount/render → innerHTML 재변경 loop를 idempotent mount로 차단. quarter/Q1C/triple isolation 진단으로 초기 stall 범위를 축소.
- `7537b16`: CI Node context의 `window` 참조를 browser evaluate로 이동.
- `5f3ea2e`: canonical boot stage marker로 `maturity-start` hard stall 증거 확보.
- `7b16ab5`: maturity showcase render가 이미 존재하면 즉시 반환하여 MutationObserver feedback loop 제거.
- `e82ba24`: maturity 선택 시 `#hd20MaturityMapTab.hidden=false`를 보장해 실행완료 후 visible:false 결함 수정.

### Null selector 진단과 실패/폐기 기록
- `204076a`: maturity filter selector null-safe 보강. 반복 page error는 잔존하여 단독 원인 아님.
- `577ef2e`: subtab workflow에 pageerror stack capture 추가.
- `8c79191`: `hd20-trace-exact.js`의 `$`/`$$` helper 및 fallback traversal null-safe 보강. 이후 오류 stack이 operational-integrity로 이동.
- `068531b`: operational-integrity 수정 중 `$` 중복 선언 syntax error를 만든 실패 커밋.
- `5ccdc49`: correction 시도였으나 실제 content가 수정되지 않아 폐기.
- `9f4fab3`: 파일을 다시 읽어 `const $=..., $$=...` 선언을 실제로 복구. Runtime/Browser/Subtab/Canonical 정상화.

### CI 계약 정합화
- `3335a3b`: 현재 index에 없는 Master modal을 무조건 요구하던 Design Layout smoke를 surface 존재 시에만 geometry 검증하도록 수정. production modal을 임의 복원하지 않음.
- `3e04c896`: Browser Smoke의 `errors` 배열 scope를 try 바깥으로 이동하여 failure diagnostic 자체의 ReferenceError 제거. 이 HEAD에서 10/10 PASS.
- `f6bd500`: 기능 검증 후 full-page screenshot timeout이 workflow를 실패시키지 않도록 viewport screenshot + warning 처리. evidence capture와 기능 판정을 분리.

### 416건 밀집데이터 회귀
- `8cfa50f`: CI localStorage 전용 fixture 생성. Activity 192, Audit 96, Action 128. canonical 16팀 순환. source=`ci-load-fixture`. 운영 Supabase write 없음.
- edge states: 후보/판정대기/보완요청/확정/유지미흡/기한경과/효과 미검증/재발.
- photo fields: BEFORE/AFTER에 외부 제조현장 참고사진 URL을 넣어 이미지 필드가 존재하는 데이터 계약을 함께 운동시킴. 실제 사업장 사진으로 표기하지 않음.
- `a42289f`: dense grid render wait를 20초까지 관찰하여 slow와 stall을 구분.
- `f666bdb`: LOAD_STAGE instrumentation으로 Activity/Advancement/Audit/Action 및 8개 grid 단계 측정. 전체 PASS.
- `d08671f`: Activity first entry <12000ms, other area entry <5000ms, each grid <5000ms 성능 회귀 assertion 추가. dense subtab smoke PASS.

### Layout 계약
- Desktop: 1440x1000 / 1152x800 / 900x900. Mobile: 375x812 및 dense grid 390x844.
- horizontal overflow <=2px 계약, Standard desktop 2-card 폭 균형, 모바일 single-column/grid viewport 폭 계약 유지.
- 1440px Standard 측정: 좌/우 668px / 668px. 한쪽 몰림과 과도한 우측 공백을 허용하지 않음.

### 최종 검증 HEAD
`f6bd5007511270109bcadefb9d29201cf7c4dcae`: Package, Runtime, Nav Scroll, Current IA, Design Layout, Browser, Dashboard Canonical, Resource Initiator, Subtab Contract Grid, Pages build/deploy 전부 completed/success.

### 잔여 기술 관찰점
- 416건 fixture에서 Activity 최초 진입이 약 7.5초로 다른 영역보다 느림. 기능 정지는 아니며 현재 <12초 성능 회귀 예산으로 감시.
- KPI/Supabase/Auth/Data-save semantics는 위 CI/성능 작업에서 변경하지 않음.


## 2026-09-18 후속 코딩 기록
### b297479 — perf: remove redundant table enhancement polling
- `table-enhance-suite.js`의 300ms 간격 40회 전역 table scan 제거.
- 초기 1회 scan + 데이터/Navigation 이벤트 기반 scan + 기존 tbody MutationObserver 유지.
- dense Activity 8350ms → 7246ms, exact-head 10/10 PASS.

### f40f1e1 — perf: remove redundant KPI modal polling
- `kpi-modal-bootstrap.js`의 singleton modal 생성 후 250ms 반복 `ensure()` 제거.
- `boot(){ensure()}`로 단순화.
- dense Activity 7246ms → 6231ms, exact-head 10/10 PASS.

### 580d642 — perf: share activity workflow KPI snapshot
- `renderActivity(s=snap())`, `renderWorkplace(s=snap())`로 standalone 호환 유지.
- 통합 `render()`는 `const s=snap()` 1회 후 공유.
- dense Activity 6453ms. 직전 6231ms와 차이는 CI noise 범위로 판단. exact-head 10/10 PASS.

### 6bf063e — perf: defer hidden workflow data rendering
- `build()`의 DOM 골격 생성 계약은 유지.
- 최초 boot는 Activity 데이터만 render.
- `hd20-subtab-changed`에서 Advancement/Audit 진입 시 해당 데이터 render.
- 일반 데이터 갱신 이벤트는 기존 전체 render 의미 유지.
- dense: Activity 6322ms; Advancement 309ms; Audit 374ms; Action 335ms.
- Grid: Activity 590/445ms, Advancement 419/362ms, Audit 1008/717ms, Action 778/716ms.
- exact-head 10/10 + Pages PASS.
- KPI 정의/source filtering/localStorage write/Supabase/auth/layout 구조 변경 없음.


## 2026-09-21 Validation / Subtab / Full-page 코딩 마감 기록
- `a1cbf80`, `276a65b`, `a17c39e`: desktop content span, dense mobile overflow/bounds, 416건 fixture quality assertions 추가.
- `8bb8791`~`90806c4`: Maturity script 순서 고정, visible map assertion, global observer churn 제거, 비활성 탭/무관 subtab에서 maturity refresh 억제.
- `eb990b8`, `e6f9f1d`, `ced1ff2`, `f4adde0`, `a00b074`, `dae42de`: validation fixture 선행 seed, empty storage reseed, Supabase sync 격리, validation KPI loader, reload loop 제거.
- `cd699ed`: fixture category '개선'을 KPI가 인식하는 '5S 고도화'로 정합화. Browser에서 activities 192/candidates 32/confirmed 16 확인.
- `0da68bd`: Dashboard 5 sections + 8 operational subtabs browser traversal 추가. 이후 `1735b92`에서 operational visible data, `6095381`/ `81a8899`에서 Dashboard content/overflow를 실제 content model에 맞게 강화.
- Subtab 진단: 여러 진단/accessor/cache 커밋을 거쳐 `c9a55a1`에서 page.evaluate의 누락된 area 인자를 확인. `8ae23fe`에서 synchronous render diagnostic/assertion으로 CI 자체 대기 혼선을 제거하고 8 subtab/grid PASS.
- `8c66180`: normal mode non-prod filter에 web-validation-fixture, VALID-* id/sourceCaseId 추가. `6aea1e2`: dashboard-kpi-source cache version publish.
- `e3d3438`: validation page에서 416건을 읽은 동일 browser page가 normal URL로 이동한 뒤 KPI snapshot validationRows===0인지 자동 검증. 실제 로그 activities/candidates/confirmed=0, validationRows=0, isolated=false.
- `81a8899` exact-head 전체 회귀 PASS. Dashboard coverage: summary 6/1187/overflow0, execution 9/2416/0, maturity 4/data16/1310/0, standard 3/811/0, field 1/data6/1025/0.
- 운영 데이터 저장/Supabase write 계약은 validation fixture가 직접 쓰지 않으며, validation mode에서는 remote sync를 차단한다. 일반 KPI 화면은 validation fixture를 non-prod로 제외한다.
