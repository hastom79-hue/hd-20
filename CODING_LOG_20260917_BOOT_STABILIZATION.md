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
