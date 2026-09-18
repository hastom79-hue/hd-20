# HD-20 개발일지 — 초기 구동 안정화 및 최종 회귀검증 (2026-09-17)

## 목적
HD-20 전면개편 이후 남아 있는 브라우저 초기 구동 불안정과 CI 회귀검증 실패를 실제 로그 기준으로 순차 제거하고, 동일 최종 HEAD에서 전체 검증을 완료한다.

## 작업 원칙
- 최초 실제 실패 단계부터 확인한다.
- 운영 코드가 정상이고 CI 기대값만 오래된 경우 운영 코드를 변경하지 않는다.
- Supabase/Auth/KPI/Data-save 로직은 직접 원인이 확인되지 않는 한 수정하지 않는다.
- 빈 데이터 강제 저장/초기화 금지.
- 추정으로 PASS 처리하지 않고 GitHub Actions의 completed/success를 확인한다.
- HD-23은 작업 범위에서 제외한다.

## 2026-09-17 확인 및 변경 이력
### 1. Runtime smoke canonical navigation 기준 정합화
- 기존 runtime smoke가 `canonical-five-area-v9-dashboard-map`을 기대해 현재 production navigation v10과 불일치함을 확인.
- production `beginner-navigation.js`의 5개 상단 영역은 dashboard/activity/advancement/audit/action이며 maturity deep link는 dashboard 내부 maturity로 라우팅되는 구조가 정상임을 확인.
- workflow 기대값만 `canonical-five-area-v10-early-boot`로 수정.
- 커밋: `a9068e5422df7d8446d9e56049547e76f9250980` (`test: align runtime smoke with canonical nav v10`)
- 결과: 해당 HEAD의 runtime smoke 및 package 성공.

### 2. Dashboard canonical browser boot 단계 진단
- dashboard-canonical에서 정적/source 검사는 통과하나 Playwright가 `window.HD20_NAV`/`window.HD20_DASHBOARD_TABS` 준비를 기다리는 과정에서 timeout 발생.
- 단계별 readiness probe를 추가하여 beginnerNav → HD20_NAV → dashboard tabs → dashboard priority → operational bridge 순서로 실패 위치를 드러내도록 보완.
- 커밋: `e54e870c5974016481a12e6f33e36688289aed51` (`test: expose dashboard canonical boot stage`)
- timeout catch 내부 `page.evaluate()`가 renderer block 시 같이 정지할 수 있음을 확인.

### 3. Browser diagnostic fail-fast 보완
- timeout 진단에서 renderer evaluate를 제거하고 오류 문자열만 사용하도록 변경.
- browser close를 finally로 보장하고 process exitCode를 명시.
- 커밋: `90ddbd98734068cae9d56659cd40371e47118473` (`test: make dashboard boot timeout fail fast`)
- 이 HEAD에서 runtime smoke는 성공했으나 nav-scroll/resource diagnostic 등 browser 계열 실패가 남음.

### 4. Navigation 조기 로딩 시도
- 공통 실패점이 `window.HD20_NAV` 준비 단계로 모이므로 `beginner-navigation.js`를 정적 `.beginnerNav` 직후 조기 로드하도록 이동하고 하단 중복 로드를 제거.
- 커밋: `e99222cb58099e5e74e9971ae46e1da98cbcbd42` (`fix: boot canonical navigation before dashboard scripts`)
- 이후에도 browser wait에서 HD20_NAV timeout이 남아 단순 로드 위치만의 문제는 아님을 확인.

### 5. Navigation DOM-ready 의존 완화
- DOMContentLoaded까지 기다리는 경로를 완화하고 `.beginnerNav`가 나타나면 초기화를 시도하도록 보완.
- 커밋: `12468e87819f021c4d712be31dbd2b64dc12e49d` (`fix: initialize canonical nav as soon as nav DOM appears`)
- Pages build/deploy 및 runtime smoke는 성공.
- dashboard-canonical은 `.beginnerNav` 확인 후 `HD20_NAV` 단계에서 계속 timeout.

### 6. Local script load trace 추가
- 추측성 production 수정 대신 실제 local JS 응답 순서를 기록하는 resource initiator diagnostic을 추가.
- 각 local script HTTP response와 page error를 기록하고 진단 자체는 45초 timeout으로 보호.
- 커밋: `a871cda6ffd45927850931b3a3b5f7bba051efbf` (`test: trace local script load before renderer stall`)
- trace job은 성공.
- `beginner-navigation.js`, `supabase-sync.js`, `supabase-auth.js`, `app.js`, dashboard/activity/audit/action 관련 다수 JS가 HTTP 200으로 연속 로드됨을 확인.
- 따라서 현재 주원인은 local JS 404 또는 단순 리소스 누락으로 보지 않는다.
- 동일 HEAD의 dashboard-canonical은 여전히 `boot stage HD20_NAV timeout; pageErrors=`로 실패.

## 현재 판단
1. 배포/파일 제공 계층은 정상 범위다: Pages build/deploy와 기본 runtime smoke는 성공 사례가 확인됨.
2. `.beginnerNav` 정적 DOM 존재 및 local JS HTTP 200 응답도 확인됨.
3. 남은 핵심은 브라우저에서 로드된 초기화 코드 사이의 실행 순서/경쟁/observer 상호작용 또는 메인 스레드 지연을 특정하는 것이다.
4. `HD20_NAV`를 억지로 mock하거나 production 기능을 축소해서 CI만 통과시키는 방식은 사용하지 않는다.

## 잔여작업 — 고정 순서
### P1. HD20_NAV 초기화 차단 원인 격리
- beginner-navigation 및 인접 초기화 모듈을 구간별로 격리한다.
- local script response 성공과 실제 execution 성공을 분리해서 확인한다.
- 필요 시 CI 전용 script-prefix/bisection 진단을 추가한다.
- 최초 blocking module을 특정한 뒤 해당 파일만 최소 수정한다.

### P2. 개별 실패 workflow 정리
- `dashboard-canonical`: HD20_NAV 이후 dashboard tabs/priority/bridge까지 완주 확인.
- `layout`: 최초 실패 assertion을 확인하고 실제 layout 결함인지 stale CI인지 구분.
- `subtab-contract-grid`: 최초 실패 assertion을 확인하고 production/CI 중 수정 대상을 결정.
- `nav-scroll`, `current-ia`: 최종 conclusion을 확인하고 실패 시 동일 원칙으로 처리.

### P3. 통합 브라우저 회귀검증
- 상단 5영역: dashboard/activity/advancement/audit/action.
- Dashboard 내부 5영역: summary/execution/maturity/standard/field.
- Dashboard → 타 메뉴 → Dashboard 복귀 시 summary reset.
- maturity가 독립 상단 메뉴로 재등장하지 않는지 확인.
- PC 1440x1000 및 Mobile 375x812에서 overflow/쏠림/겹침 확인.
- 탭 전환, scroll stability, modal, drill-down, return context 확인.
- 데이터 저장/조회/Auth/Supabase는 회귀 발생 여부만 검증하고 불필요한 수정 금지.

### P4. 동일 최종 HEAD 종료검증
- runtime smoke
- package/source checks
- dashboard canonical
- nav scroll
- layout
- current IA
- subtab contract/grid
- resource diagnostic
- Pages build/deploy
- 관련 workflow가 동일 HEAD에서 `completed/success`인지 확인 후에만 완료 처리.

## 미완료 상태
2026-09-17 현재 전체 PASS 아님. 브라우저 초기화 및 일부 layout/subtab 계열 workflow failure가 남아 있다.


## 2026-09-18 최종 안정화·밀집데이터 회귀검증 추가 기록
- 초기 구동 원인은 단순 API/observer 제거나 DOMContentLoaded 조정만으로 해결되지 않았으며, 구간 격리 결과 Activity import preview 계열의 MutationObserver → mount/render → innerHTML → MutationObserver feedback loop와 Maturity showcase의 동일 유형 feedback loop를 각각 특정했다.
- Activity import preview feedback loop는 이전 커밋 `85731df`에서 idempotent mount 방향으로 제거했다. 이후 quarter/Q1C/triple isolation 진단으로 boot stall 범위를 축소했다.
- `7537b16`: subtab CI에서 Node context의 `window` 참조 오류를 browser context 평가로 정정.
- `5f3ea2e`: canonical dashboard boot stage를 노출하여 Maturity 단계가 `maturity-start`에서 정지함을 확인.
- `7b16ab5`: `hd20-maturity-map-showcase.js`의 render/innerHTML/MutationObserver feedback loop 제거. 이미 mount된 showcase는 재렌더하지 않도록 idempotent 처리.
- `e82ba24`: Maturity 실행은 완료됐으나 `visible:false`였던 별도 가시성 결함을 수정. maturity panel 선택 시 hidden 상태를 해제.
- `204076a`: maturity filter selector를 null-safe로 보강했으나 해당 HEAD에서 반복 page error는 해소되지 않음. 원인 확정 전 시도였으며 단독 해결책으로 채택하지 않음.
- `577ef2e`: subtab browser error를 문자열만이 아니라 stack까지 수집하도록 진단 강화.
- `8c79191`: `hd20-trace-exact.js` selector를 null-safe로 수정. 이후 stack에서 trace-exact 오류는 사라지고 남은 최초 오류가 operational-integrity로 이동함을 확인. Browser/Runtime/Package 성공.
- `068531b`: operational-integrity null-safe 보강 시도 중 실수로 `$` 중복 선언을 만들어 syntax error를 유발. 실패 커밋으로 기록.
- `5ccdc49`: 위 선언 수정 시도였으나 실제 파일 내용이 여전히 잘못된 상태였으므로 폐기.
- `9f4fab3`: `$`/ `$$` helper 선언을 실제 파일 재조회까지 포함해 정상 복구. 동일 HEAD에서 9/10 성공, Design Layout만 stale Master modal 가정으로 실패. Standard desktop 1440px에서 좌/우 카드 폭 668/668로 균형 확인.
- `3335a3b`: 현재 DOM에 존재하지 않는 Master modal을 필수로 요구하던 stale layout CI를 현재 surface와 정합화. Design Layout 성공. 이후 Browser Smoke의 diagnostic `errors` scope 결함만 남음.
- `3e04c896`: Browser Smoke diagnostic scope 수정. 동일 HEAD에서 10개 workflow 전체 성공을 최초 확정.
- `8cfa50f`: 운영 Supabase가 아닌 CI localStorage에 Activity 192 + Audit 96 + Action 128 = 총 416건의 결정론적 밀집데이터 fixture 추가. 현재 canonical 16개 생산팀을 순환 적용하고 판정대기/보완요청/확정/유지미흡/기한경과/효과미검증/재발 등 예외상태 포함. BEFORE/AFTER에는 검증용 제조현장 참고사진 URL 필드를 포함하며 실제 HD현장 사진으로 주장하지 않는다.
- `a42289f`: 대량데이터 그리드의 정상 렌더링과 정지를 구분하기 위해 CI render wait window 조정.
- `f666bdb`: area/subtab/grid 단계 진단 추가. 416건에서 Activity 최초 진입 약 7.5초, 이후 영역 전환 약 0.3~0.4초, 상세 grid 약 0.4~1.1초 수준을 확인. 전체 10개 workflow 성공.
- `d08671f`: 밀집데이터 성능 회귀 예산 추가. Activity 최초 진입 <12초, 기타 영역 <5초, 상세 grid <5초. Subtab 성능 검증 성공.
- `f6bd500`: Browser Smoke의 full-page screenshot이 30초 timeout으로 기능검증을 오염시키는 문제를 제거. viewport evidence capture로 축소하고 evidence capture 실패는 warning으로 분리.

### 레이아웃 검증 원칙 및 결과
- Desktop 1440x1000, 1152x800, 900x900과 Mobile 375x812/390x844를 기준으로 전체 폭 활용, 불필요한 여백, 좌우 쏠림, 카드 균형, horizontal overflow를 검증한다.
- 특히 기준·추이/Standard 영역처럼 콘텐츠가 좌측에 몰리고 우측이 비는 레이아웃을 금지한다. Standard desktop은 1440px에서 668/668 균형 카드로 검증됐다.
- 밀집데이터 상태에서도 8개 operational subtab, 상세 grid, Maturity, 모바일 grid overflow 검증을 통과했다.

### 최종 동일 HEAD 검증
최종 검증 HEAD `f6bd5007511270109bcadefb9d29201cf7c4dcae`에서 다음 10개가 모두 `completed/success`임을 확인했다.
- Package HD20 source — 35289962102
- HD20 runtime smoke — 35289962262
- HD20 nav scroll smoke — 35289962133
- HD20 current IA smoke — 35289962213
- HD20 design layout smoke — 35289962242
- HD20 browser smoke — 35289962221
- HD20 dashboard canonical smoke — 35289962127
- HD20 resource initiator diagnostic — 35289962128
- HD20 subtab contract grid smoke — 35289962141
- pages build and deployment — 35289960860

## 현재 상태
초기 구동/브라우저/Canonical Dashboard/Subtab/Grid/Layout/Pages의 핵심 회귀검증은 전체 PASS. 남은 성능 관찰 포인트는 416건 기준 Activity 최초 진입이 다른 영역보다 무거운 점이며, 현재 설정한 <12초 회귀 예산 안에서 관리한다. 운영 Supabase/Auth/KPI/Data-save 계약은 이번 밀집데이터 검증을 위해 변경하지 않았다.
