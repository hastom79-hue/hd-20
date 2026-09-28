# HD-20 코딩일지 — Validation Fixture / Team Master / Auth Simplify / Subtab Split (2026-09-22)

## 범위
`web-validation-fixture.js` 가상데이터 파이프라인, 3건의 실서비스 화면오류 수정,
팀 마스터 재구성, Supabase 비밀번호 로그인 단계 제거, ③④⑤ 서브탭 3-way 분리.
검증은 전 구간 Playwright(Chromium, 모바일 430px 기본, 일부 데스크톱 1440px)로
실제 클릭 조작 기반으로 수행. 정적 코드 추정만으로 완료 처리하지 않음.

## 변경/검증 기록

### `8c5129c` — fix: Audit pending miscounted as managing; team master order/groups; validation fixture v10
- file: `hd20-native-production-guard.js`
  - change: `seoulDate(a.auditDate||a.performedAt||a.auditPerformedAt||a.completedAt)`
    호출부 2곳을 `auditStart(a)`로 교체. `auditStart()`는 위 필드가 모두 없으면
    `''`을 반환(기존에는 `seoulDate(undefined)`가 오늘 날짜를 반환).
  - reason: 실시일 없는 Audit이 "오늘부터 6개월 관리중"으로 잘못 집계됨.
  - verification: 가짜 프로덕션 도메인 없이 로컬 clone으로 재현 → 수정 후 Audit
    lane 카운트가 대기 32 / 관리중 147 / 종료평가 대기 53 / 완료 88로 정상화(브라우저
    직접 측정).
- file: `dashboard-kpi-source.js`
  - change: `isNonProdRow(x)`를 `isNonProdRowBase(x)`로 이름 변경하고, 새
    `isNonProdRow(x)`가 `validationMode()===true && x.source==='web-validation-fixture'`
    이면 `false`(=정상 데이터)를 반환하도록 래핑.
  - reason: 15개 화면 스크립트가 이 함수를 공유해 검증 데이터를 숨기고 있었음.
  - verification: 수정 전/후 KPI 카드가 0건→실제 수치로 바뀜을 스크린샷 대조.
- file: `app.js`
  - change: `CANONICAL_TEAMS`(고정 배열) → `TEAM_DEFS`(순서+그룹 튜플 16개) +
    `TEAM_GROUP`(Map) + `TEAM_GROUPS` 로 교체. `TEAM_MASTER`에
    `groupNames()/groupOf()/teamsOf()` 추가. `loadSettings()`에
    `gmes5s_team_master_sig` 서명 비교를 추가해 마스터가 바뀐 최초 1회만
    `gmes5s_team_display_order`를 초기화.
  - verification: Node vm harness로 `teamNames()` 순서, `groupOf('성능팀')`,
    `teamsOf('조립2팀')`(프레임제작/Boom제작/휠로더3/초대형조립) 단정 통과. 저장된
    옛 순서 → 마스터 변경 시 1회 초기화 → 이후 사용자 커스텀 순서는 보존됨을
    Node로 재현.
- file: `web-validation-fixture.js` (v10)
  - v9→v10: `isNonProdRow` 수정과 짝을 맞추기 위한 버전 bump만.
- file: `index.html`
  - change: 위 4개 스크립트 `?v=` 캐시 버전 갱신.

### `260b0a4` — fix: restore FOUC guard so auth gate doesn't flash dashboard on load
- file: `index.html`
  - change: `<html lang="ko">` → `<html lang="ko" class="hd20-auth-pending">`.
  - reason: `supabase-auth.css`의 `html.hd20-auth-pending body{visibility:hidden}`
    규칙이 초기 HTML에 클래스가 없어 전혀 적용되지 않고 있었음. `supabase-auth.js`의
    `boot()`/`showBootError()`/`handleExpiredCompanySession()`은 이 클래스를
    **제거**만 할 뿐 추가하는 코드가 어디에도 없었음(초기 HTML에 박혀 있는 것을
    전제로 설계된 것으로 보임).
  - verification: `chromium.launch(args=['--host-resolver-rules=MAP faux.hd20.test 127.0.0.1'])`로
    non-localhost 프로덕션 조건을 재현. 0/60/120/200/300/450/650/900ms 연속
    스크린샷으로 수정 전 대시보드가 잠깐 보였다가 게이트로 덮이는 것, 수정 후
    처음부터 게이트만 보이는 것을 시각적으로 대조. localhost 경로는 영향 없음을
    별도 확인(`htmlClass:'hd20-ready'`, `bodyVisibility:'visible'`).

### `67826a5` — feat: remove Supabase password login step, keep company-mail gate
- file: `supabase-auth.js` (전체 재작성)
  - 제거: Supabase 클라이언트 생성/`onAuthStateChange`, `renderSupabaseGate()`
    (비밀번호 폼), `bindForm()`, `authenticated()`, `handleIdentityMismatch()`,
    `clearSupabaseSession()`, `startSupabase()`.
  - 추가: `enterApp(session)` — `window.HD20_AUTH_BYPASS=true` 설정,
    `setAppVisible(true)`, `renderSessionChip()`, `ensureLogoutButton()`,
    `'hd20-auth-bypass'` 이벤트 dispatch(기존 localhost 우회와 동일 패턴 재사용).
  - `renderMailGate()`의 폼 submit 핸들러가 `startSupabase()` 대신 `enterApp()`
    직접 호출.
  - `handleExpiredCompanySession()`을 Supabase 세션 정리 없이 메일 세션만 지우고
    게이트를 다시 그리도록 단순화.
  - 호환성 확인: `startSupabase/renderSupabaseGate/bindForm/handleIdentityMismatch/
    clearSupabaseSession/window.supabase/HD20_SUPABASE/SUPABASE_URL/SUPABASE_KEY/
    authenticated(` 9개 패턴을 전 파일 grep. `supabase-sync.js`가 `HD20_SUPABASE`를
    (생성이 아니라) **소비**만 하는 것 외에는 참조가 없음을 확인 후 제거.
- file: `index.html`
  - change: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">` 제거,
    `supabase-auth.js?v=` 캐시 버전 갱신.
- verification (가짜 프로덕션 도메인):
  - `notcompany@gmail.com` → 접근 제한 팝업 유지, gate_on=true.
  - `tester@hd.com` → gate_on=false, `window.HD20_AUTH_BYPASS===true`,
    세션칩 `tester@hd.com · 4시간 59분`, 로그아웃 버튼 렌더.
  - reload → gate_on=false 유지(세션 지속), 로그아웃 클릭 → gate_on=true +
    `localStorage.getItem('hd20_company_session_v1')===null`.
  - `?validation=1` 배너/KPI 정상, 15개 뷰 콘솔 오류 0건(`e2e.py`).

### `f253916` — feat: split ③④⑤ overloaded subtabs into 3 each; fix pagination bugs
- 실측 방법론: `document.documentElement.scrollHeight`를 각 탭 실제 버튼 클릭 후
  측정(초기에는 `.app` 자식 bounding-box 합산 방식을 썼으나 `#awWorkplace`가
  `#performanceConversionAnalysis` 내부에 DOM 이동되어 있어 이중 계산되는 것을
  발견 → scrollHeight 방식으로 교체).
- file: `hd20-overhaul.css`
  - change: `.awTable tbody tr.teHidden{display:none}` →
    `.awTable tbody tr.teHidden,.amCases tbody tr.teHidden{display:none}`.
  - root cause: `table-enhance-suite.js`의 `scan()`이 `.awTable, .amCases`를
    이미 대상으로 하고 있었고 `.amCases` 테이블에 `teHidden` 클래스도 정상
    부여되고 있었으나, 숨김 CSS 규칙 선택자가 `.awTable`에만 걸려 있어 `.amCases`
    테이블(640행)은 시각적으로 전혀 숨겨지지 않고 있었음.
- file: `action-leadtime-grid.js`
  - change: `<table class="hd20Lt">` → `<table class="hd20Lt awTable">`.
  - root cause: Lead Time 비교 표(640행)가 애초에 `awTable`/`amCases` 어느
    클래스도 없어 `table-enhance-suite.js`의 스캔 대상에서 완전히 제외되어
    있었음(단순 클래스 누락, 로직 결함 아님).
- file: `audit-close-evaluation.js`
  - change: 종료평가 표(133행)에 `awTable` 클래스 추가. 동일 원인.
- file: `table-enhance-suite.js`
  - change: `window.addEventListener('hd20-subtab-changed',()=>setTimeout(scan,60))` 추가.
  - reason: 위 두 표는 `awTable` 클래스를 부여해도, 서브탭 전환 시점에 새로
    렌더링되는 콘텐츠에 대해 `scan()`이 재실행되지 않아(기존에는 최초 boot +
    특정 데이터 이벤트에서만 재스캔) 여전히 페이지네이션이 적용되지 않는 사례가
    있었음(`hd20AuditCloseEvaluation`은 유지관리 탭 진입 시 재조립됨).
- file: `hd20-subtabs.js`
  - `MAP` 변경:
    - `advancement: [['judge','후보 목록'],['analysis','3조건 분석'],['standard','확정·수평전개']]`
    - `audit: [['draw','대상 추출'],['inspect','실시·점검 입력'],['retention','유지관리']]`
    - `action: [['manage','조치 목록'],['master','팀장 기준정보'],['verify','효과·재발관리']]`
  - `CONTRACT`: 위 3영역의 목적문(purpose/judge/next/features) 전면 재작성,
    나머지 영역은 문구 변경 없음.
  - `applyAudit(sub)`: 기존 2-way(`sub==='audit'` 분기) → 3-way
    (`show(draw,sub==='draw')`, `show(batch,sub==='draw')`,
    `show(closed,sub==='inspect')`, `show(retention,sub==='retention')`).
  - `applyAction(sub)`: 기존 2-way(`sub==='manage'` 분기) → 3-way
    (`show(form,sub==='manage')`; `sub==='verify'`일 때만 verify 패널 렌더/노출,
    그 외엔 숨김 — `master`일 때 verify 패널도 form도 노출하지 않음).
  - `datasetFallback()`의 CSV 타이틀 분기(`sub==='audit'?...`)를
    `sub==='retention'?...`(역방향 조건)로 정정 — 'audit' 문자열 자체가
    사라졌으므로.
- file: `hd20-ops-v2.js`
  - `metrics()` 맵에 `audit.draw`(구 `audit.audit`와 동일 값), `audit.inspect`
    (동일 값 재사용), `advancement.analysis`(1개 조건/2개 이상/3조건 충족 세분),
    `action.master`(생산팀 수 등) 4개 키 추가. 누락 시 `map[...]||map['dashboard.summary']`
    폴백으로 대시보드 기본값이 잘못 표시되는 것을 방지.
  - `metricDrill()`의 `routes.audit` 배열과 `bindDashboardRoutes()`의 `rr` 배열에
    하드코딩되어 있던 `['audit','audit']` 딥링크 2곳을 `['audit','draw']`로 수정.
    이름이 바뀐 서브키를 그대로 뒀다면 대시보드 KPI 드릴다운 클릭 시 존재하지
    않는 서브탭으로 이동해 버튼 활성 표시가 깨지는 회귀가 발생했을 것.
- file: `audit-subtab-dedupe-guard.js` (전체 재작성)
  - `classify()`: `.auditDraw,#hd20AuditBatchExecution`→`'draw'`,
    `.auditClosedLoop`→`'inspect'`(기존에는 draw와 동일 그룹 `'audit'`),
    `.audit6m,#hd20AuditCloseEvaluation`→`'retention'`(변경 없음).
  - `apply()`: boolean(`retention`) 기반 2-way → `sub` 문자열 3-way 비교로 재작성.
- file: `action-subtab-dedupe-guard.js` (전체 재작성)
  - `classify()`: `.amMaster`를 `'manage'` 그룹에서 분리해 `'master'` 신설.
    `.hd20LtWrap`을 `'manage'` 그룹에 새로 편입(기존에는 미분류라 항상 노출).
  - `apply()`: `sub==='verify'` boolean 2-way → `manage`/`master`/`verify`
    3-way. `:scope >` 선택자 목록에 `.hd20LtWrap` 추가.
- file: `advancement-subtab-dedupe-guard.js` (전체 재작성)
  - 기존에는 `#hd20MaturityConditionAnalysis`(3조건 분석 패널, 14,386px)를
    전혀 관리하지 않아 `judge`/`standard` 어느 서브탭에서도 항상 노출되고
    있었음(중복 표시의 직접 원인). 새 `apply()`에서 `sub==='analysis'`일 때만
    노출하고, `judge`/`standard`에서는 숨김. `#awWorkplace`(후보 목록)는
    반대로 `analysis`에서만 숨김. 기존 `pcStage/pcTypes/pcCriteriaBanner/pcInsight`
    2-way 로직(judge 전체 노출 vs standard는 confirmed/maintained만)은 유지하되
    `analysis` 분기에서는 전부 숨김으로 확장.
- file: `index.html`, `final-layout-polish.js`
  - change: 위 9개 변경 파일의 `?v=` 캐시 버전을 `20260922-subtab-split-1`로 통일
    갱신(`final-layout-polish.js`는 동적 주입 스크립트 4개의 버전 문자열 포함).

### `4aee88b` — feat: split advancement '3조건 분석' into summary + detail
- file: `maturity-condition-analysis.js`
  - change: `<table class="mcaTable">` → `<table class="mcaTable awTable">`.
  - root cause: 어제 고친 `.amCases`/`.hd20Lt`와 동일 패턴 — 라인·작업장별
    상세표(7,528px)가 `awTable`/`amCases` 어느 클래스도 없어 스캔 대상에서
    제외되어 있었음.
- file: `hd20-subtabs.js`
  - `MAP.advancement`: `[['judge',...],['analysis',...],['standard',...]]` →
    `[['judge',...],['analysis',...],['detail','라인·작업장 상세'],['standard',...]]`.
  - `CONTRACT['advancement.analysis']`: 목적문을 "요약"으로 축소, features에서
    "라인·작업장 상세표" 제거.
  - `CONTRACT['advancement.detail']` 신규 추가.
- file: `advancement-subtab-dedupe-guard.js`
  - `apply()`: `sub` 판정을 `['analysis','detail','standard'].includes(...)`
    기준 4-way로 확장. `mcaHeavy = sub==='analysis'||sub==='detail'`로
    mca 패널 전체 노출 여부를 먼저 정하고, 그 안에서 다시
    `summaryParts`(mcaHead/mcaLevelRail/mcaCriteria/mcaBodyGrid/mcaJudge)는
    `sub==='analysis'`, `detailParts`(mcaTableWrap/mcaFoot)는 `sub==='detail'`
    에서만 노출하도록 내부 분기 추가.
- file: `hd20-ops-v2.js`
  - `metrics()`에 `advancement.detail` 항목 추가(누락 시 대시보드 기본값
    오표시 방지 — 어제와 동일 이유).
- file: `index.html`, `final-layout-polish.js`
  - change: 4개 변경 파일 캐시 버전 `20260922-subtab-split-2`로 갱신.
- verification:
  - `③ 고도화·표준화`의 4개 서브탭(후보 목록/3조건 분석/라인·작업장 상세/
    확정·수평전개) 전체 클릭, scrollHeight 실측: 6,886 / 3,523 / 3,246 / 3,923px.
  - 16개 탭(5영역×2~4서브탭) 전체 재순회 + edge=1 + scale=3&edge=1 스트레스
    모드: 콘솔 오류 0건, dialog(팝업) 0건.
  - 스크린샷으로 서브탭 버튼 4개 노출, 각 화면의 WORK PURPOSE 패널 문구가
    올바른 서브탭에 매칭됨을 육안 확인.

### `57e264c` — feat: split action '조치 목록' + audit '유지관리', keep legacy sub-keys intact
- file: `hd20-subtabs.js`
  - `MAP.audit`: `[...,['retention','유지관리']]` →
    `[...,['ongoing','6개월 관리중'],['retention','종료평가']]`.
  - `MAP.action`: `[['manage',...],['master',...],['verify',...]]` →
    `[['manage',...],['leadtime','처리기간 분석'],['master',...],['verify',...]]`.
  - `CONTRACT['audit.ongoing']` 신규, `CONTRACT['audit.retention']` 문구를
    "종료평가" 중심으로 축소(6개월 추적 전체 설명 제거).
  - `CONTRACT['action.leadtime']` 신규.
  - `applyAudit(sub)`: 기존에는 `.audit6m`만 `retention` 변수로 참조하고
    `#hd20AuditCloseEvaluation`은 이 함수에서 전혀 다루지 않았음(dedupe guard
    단독 관리). `ongoing=$('.audit6m',root)`, `closeEval=document.getElementById(...)`
    로 분리해 `show(ongoing,sub==='ongoing')`, `show(closeEval,sub==='retention')`
    명시.
  - 첫 시도에서 `s.replace()` 대상 문자열의 줄바꿈 뒤 공백 1칸을 빠뜨려
    `assert count==1`이 실패하며 스크립트가 파일 write 전에 중단된 것을
    `repr()`로 원문 대조해 확인 후 재시도(디스크에 반영 안 된 상태로
    "syntax OK"만 출력되는 것을 먼저 잡아냄 — 실제 파일 내용을 다시 읽어
    검증하는 습관으로 조기 발견).
- file: `audit-subtab-dedupe-guard.js` (전체 재작성)
  - `classify()`: `.audit6m`→`'ongoing'`, `#hd20AuditCloseEvaluation`→`'retention'`
    (기존에는 이 두 role이 합쳐진 하나의 boolean이었음).
  - `apply()`: `['draw','inspect','ongoing','retention'].includes(...)` 4-way.
- file: `action-subtab-dedupe-guard.js` (전체 재작성)
  - `classify()`: `.hd20LtWrap`→`'leadtime'` 신규(기존에는 `'manage'` 그룹에
    속해 있었음).
  - `apply()`: `['leadtime','master','verify'].includes(...)` 4-way,
    `:scope > .hd20LtWrap` 개별 토글 추가.
- file: `hd20-ops-v2.js`
  - `metrics()`에 `audit.ongoing`(관리중/재발 징후/Action 연계/월별 확인),
    `action.leadtime`(전체/완료/기한경과/기한 내 완료) 추가.
  - 버그: `action.leadtime`의 "기한 내 완료"를 최초
    `doneActions.filter(x=>!overdue(x)).length`로 작성 → `overdue()`가
    `!isDone(x)`를 전제 조건으로 삼는 함수라 done 건에는 항상 `false`를
    반환, 결과적으로 `doneActions.length`(완료)와 완전히 같은 값(399)이
    나오는 것을 브라우저 실측으로 발견. `doneActions.filter(x=>{const
    d=txt(x.due||x.targetDate).slice(0,10),dd=txt(x.doneDate).slice(0,10);
    return !!d&&!!dd&&dd<=d})`로 직접 비교하도록 수정, 217건으로 정정 확인
    후 같은 커밋에 포함.
- file: `index.html`, `final-layout-polish.js`
  - change: 4개 변경 파일 캐시 버전 `20260922-subtab-split-3`로 갱신.
- 참고: pull 시 저장소 소유자가 별도로 커밋한
  `test: align regression contracts with current HD20 IA`
  (`.github/workflows/runtime-smoke.yml`만 변경)가 먼저 들어와 있었음. 내
  변경 파일과 겹치지 않음을 diff로 확인 후 진행.
- verification:
  - `④ 진단·유지` 4탭 scrollHeight: 대상추출 6,965 / 실시점검입력 7,483 /
    6개월관리중 5,651 / 종료평가 6,512px. metrics 스트립 4탭 모두 정상.
  - `⑤ 개선실행` 4탭 scrollHeight: 조치목록 7,728(최대치 8,768→7,728) /
    처리기간분석 5,295 / 팀장기준정보 5,435 / 효과재발관리 4,285px.
  - 전체 16개 탭 순회 + edge=1 + scale=3&edge=1: 콘솔 오류 0건, dialog 0건.

### `c7b499e` — fix: KPI evidence grid was empty for all 6 subtabs split today/yesterday
- 발견 경위: "계속 실행 검증" 반복 요청에 따라, 이전까지 테스트하지 않았던
  각 서브탭의 "상세 데이터 그리드" 버튼을 처음으로 전수 클릭 검증.
- file: `hd20-kpi-evidence-drill.js`
  - `evidence(area,sub,index)` 함수의 `switch(`${area}.${sub}.${index}`)`에
    다음 case 추가:
    - `'audit.draw.0'~'audit.draw.3'`: 기존 `'audit.audit.0~3'`(Audit 원천/
      실시대기/완료/부적합)과 완전히 동일한 로직 재사용.
    - `'audit.inspect.0'~'audit.inspect.3'`: 위와 동일(실시·점검 입력도
      같은 Audit 원천 데이터를 다루므로).
    - `'audit.ongoing.0'~'audit.ongoing.3'`: 관리중 / 재발 징후(종료평가
      미기재 중 retentionRisk) / Audit 연계 Action / 월별 확인 대상.
    - `'action.leadtime.0'~'action.leadtime.3'`: 전체 개선요청 / 완료 /
      기한경과 / 기한 내 완료(`doneDate<=due` 직접 비교, 어제 커밋 `57e264c`와
      동일 계산식 재사용).
    - `'advancement.analysis.0'~'advancement.analysis.3'`,
      `'advancement.detail.0'~'advancement.detail.3'`: 둘 다 고도화 후보 /
      1개 조건 / 2개 이상 / 3조건 충족(`advancement.judge`와 동일 데이터
      재사용 — 화면은 요약/상세로 나뉘어도 근거 데이터는 같은 후보 집합).
  - 변경하지 않음: `'audit.retention.*'`(외부 `hd20-retention-evidence-guard.js`,
    `hd20-retention-evidence-trace-bridge.js`가 index 0, 2, 3을 특정 의미로
    참조), `'action.manage.*'`, `'action.verify.*'`,
    `'advancement.judge.*'`, `'advancement.standard.*'` — 모두 기존 의미
    그대로 유지.
  - file: `index.html`: 캐시 버전 `20260922-subtab-split-4`로 갱신.
- root cause 분석: 어제·오늘의 "전수 검색으로 확인" 작업은 `sub==='...'`
  직접 비교 패턴만 grep했음. 이 파일은 `${area}.${sub}.${index}` 템플릿
  리터럴을 조합해 만든 문자열을 switch-case로 매칭하는 방식이라 동일한
  검색어로 걸리지 않았음 — 검색 방법론 자체의 사각지대였고, 앞으로 sub-key
  영향 분석 시 `case'${area}.` 형태의 조합 문자열 패턴도 함께 검색해야 함.
- 부가 확인 (코드 수정 없음):
  - 사내메일 인증(mail-only auth) 흐름을 가짜 프로덕션 도메인
    (`--host-resolver-rules`)에서 오늘 변경분 포함 최종 HEAD로 재검증:
    게이트 진입/새로고침 세션유지/검증모드 병행 모두 정상.
  - "연계 흐름" 버튼의 Playwright 실클릭이 멈추는 현상을 발견·격리:
    `nav-scroll-stability.js`가 탭 전환 후 0/40/140/320ms 지연 스크롤
    재조정을 하는데, 그 직후 곧바로 다른 요소를 Playwright로 실클릭하면
    "요소 안정성 대기"와 충돌해 자동화 클릭이 멈춤. `button.onclick()`을
    JS로 직접 호출하면 즉시 정상 동작(모달 정상 오픈)하는 것을 확인해
    애플리케이션 결함이 아닌 자동화-타이밍 특이사항으로 결론.

### `0e74799` — feat: virtual data now shows by default, no ?validation=1 needed
- file: `web-validation-fixture.js`
  - `const OFF=MODE==='0'||MODE==='off';if(OFF){...restore...return}` —
    기존 `if(MODE!=='1'){...restore...return}`을 대체. 시드 조건이 반전됨.
  - `MODE==='reset'` 분기의 `location.replace(cleanUrl())` →
    `location.replace(cleanUrl({validation:'0'}))`로 변경(리다이렉트 후
    기본값-on 로직에 의해 즉시 재시딩되는 것을 방지).
  - 배너 "원본 복구" 링크 라벨을 "가상데이터 끄기(원본 복구)"로 변경.
  - `V`를 10→11로 bump.
- file: `supabase-sync.js`
  - `boot()`의 `if(new URL(location.href).searchParams.get('validation')
    ==='1'){...return}` → `if(__v!=='0'&&__v!=='off'){...return}`로 동일
    규칙 적용. Supabase 클라이언트 생성 코드가 이미 제거된 상태(커밋
    `67826a5`)라 실질적 동작 변화는 없음 — 방어적 일관성 수정.
- file: `dashboard-kpi-source.js`
  - `validationMode()`: `return ...==='1'` → `const v=...;return
    v!=='0'&&v!=='off'`. 파라미터 없이 접속 시 fixture는 정상 시딩했지만
    이 함수가 여전히 false를 반환해 `isNonProdRow()`가 방금 시딩된 행을
    다시 "비운영 데이터"로 걸러내는 바람에 KPI 카드가 0건으로 보이는 회귀를
    로컬 테스트에서 직접 발견(`activity_count=960`인데 `고도화 후보 발굴
    0건`으로 나오는 불일치를 스크립트로 포착) 후 즉시 수정.
- file: `index.html`: 위 3개 스크립트 캐시 버전 `20260922-default-on-1`로 갱신.
- 회귀 재발 방지 차원에서 전수 검색:
  `grep -rn "searchParams\\.get\\('validation'\\)\\s*===\\s*'1'" *.js` —
  위 3개 파일 외 추가 매치 없음을 확인 후 커밋.
- verification (Chromium):
  - 4가지 URL(파라미터 없음 / `?validation=0` / `?validation=1` /
    `?validation=1&scale=3`)에서 배너·activity count·KPI 표시값을 모두
    대조: 파라미터 없음과 `validation=1`이 완전히 동일한 결과(Activity 960,
    KPI 154건)를 내고, `validation=0`만 진짜 빈 상태(0건)임을 확인.
  - 파라미터 없이 접속 후 16개 서브탭 전체 순회: 콘솔 오류 0건, scrollHeight
    수치가 기존 `?validation=1` 테스트와 완전히 동일.
  - "가상데이터 끄기" 배너 링크 클릭 → 빈 상태 전환 → `reload()` → 여전히
    빈 상태 유지(수정 전이었다면 이 지점에서 즉시 재시딩되어 실패했을
    시나리오).
  - 가짜 프로덕션 도메인(`--host-resolver-rules`)에서 `tester@hd.com` 로그인
    → 파라미터 없는 URL 그대로 배너·KPI 정상 표시.
  - `?validation=1&edge=1` 기존 엣지 모드 하위 호환 확인.

### `e535a26` — fix: distinguish active subtab visually; remove duplicate metrics
- file: `hd20-subtabs.css`
  - `.hd20Subnav button.on{background:#fff;...}` → `background:var(--hd-primary)`
    (또는 `#0b5b83` 직접 지정), `color:#fff`, `font-weight:900`,
    `::after` 삼각 포인터(`border-color:#0b5b83 transparent transparent`) 추가.
  - hover 상태 색상도 `#0b5b83` 계열로 통일.
- file: `hd20-ops-v2.js` — `metrics()` 4개 항목 재설계(모두 count 기반):
  - `'audit.inspect'`: 실시 대상(`!x.auditDate`) / 결과 입력대기
    (`x.auditDate&&!txt(x.auditResult||x.result)`) / 최근 7일 실시
    (`today()` 기준 0~7일 이내 `auditDate`) / 부적합 등록(기존과 동일).
  - `'advancement.detail'`: 표시 라인(`new Set(candidates.map(line)).size`) /
    표시 작업장(workplace 동일) / 공식확정 사례(`advancementConfirmed`) /
    최근 7일 갱신(`judgedAt||date` 기준).
  - `'action.leadtime'`: 계획대비 지연(`dd>d`) / 계획대비 조기완료(`dd<d`) /
    7일 이상 지연(`(dd-d)/86400000>=7`) / 정시완료·당일(`dd===d`).
  - `'action.master'`: `read('hd20TeamLeaderMasterV1')`를 직접 읽어 생산팀
    총원 / 이메일 등록 수 / 팀장 지정 수 / 미지정 수.
- file: `hd20-kpi-evidence-drill.js`
  - 위 4개의 `evidence()` case를 `hd20-ops-v2.js`와 동일한 필터 로직으로
    동기화(안 하면 `hd20-kpi-parity-guard.js`가 옛 값으로 되돌림).
  - `case'action.master.0'~'action.master.3'`: 기존에 이 case 자체가 없어
    그리드 버튼이 "0개 데이터셋"으로 항상 비어 있던 것을 발견, 팀 리더
    마스터 배열을 직접 조회해 `title/headers/rows`를 구성하는 케이스를
    신규 추가(기존 `setA/setU/setV/setX` 프리셋이 팀 리더 행 구조에 맞지
    않아 인라인으로 직접 작성).
- file: `index.html`: 4개 변경 파일 캐시 버전 갱신(`dedup-fix-1`→`-3` 단계적
  적용, 중간에 leadtime 로직을 평균값→count로 다시 설계하며 2회 추가 bump).
- 디버깅 메모: `action.leadtime`을 처음에 "평균 처리일수"(일 단위 평균)로
  설계했을 때 브라우저 실측에서 "399일"(완료 건수 399와 동일한 값)이 찍히는
  것을 발견. `hd20-kpi-parity-guard.js`가 매 렌더마다 각 메트릭 버튼의
  숫자를 `evidence(area,sub,index).rows.length`(단순 행 개수)로 강제
  덮어쓰기 때문에, 평균·최댓값처럼 "개수가 아닌" 지표는 애초에 이 메트릭
  스트립 구조와 맞지 않음을 확인하고 전부 count 기반으로 재설계.
- verification (Chromium, 파라미터 없이 기본 로드):
  - 8개 인접 탭 쌍의 메트릭 스트립을 전수 대조: 이전에 3~4개 겹쳤던 4개 쌍
    모두 더 이상 겹치지 않음을 확인.
  - "평균 처리일수 399일" 버그를 재설계 후 "계획대비 지연 182건 / 조기완료
    208건 / 7일 이상 지연 123건 / 정시완료 9건"으로 정정 확인.
  - 16개 탭 전체 순회 + 각 탭 "상세 데이터 그리드" 버튼(팀장 기준정보 포함
    전부 "4개 데이터셋") + scrollHeight: 콘솔 오류 0건.
  - 활성 탭 스크린샷: 진한 파란 배경 + 흰 글씨 + 하단 포인터로 명확히 구분됨.

### `44a5c3f` — fix: reduce bubble overlap in dashboard maturity map
- 진단 도구 메모: Playwright의 표준 `page.screenshot()`이 이 페이지에서
  15초 이상 타임아웃되는 현상을 발견(`getAnimations()`는 0, CSS 애니메이션
  없음 확인 — 원인 미상이나 페이지 전체 DOM 노드 수가 약 29,910개로 매우
  많은 것과 연관 추정). `context.new_cdp_session(page)` +
  `Page.captureScreenshot`(CDP 직접 호출)로 우회해 캡처 성공.
- file: `hd20-maturity-map-tab.js`
  - 충돌 회피 로직: 기존 `used.forEach(p=>{if(겹침)한번만 ±4px 넛지})` →
    `for(let pass=0;pass<8;pass++){겹침 있으면 각도(i*47+pass*67°)·거리
    (5+pass*1.5px)로 밀어내고 재검사}`로 교체. 겹침 판정 임계값도
    `Math.abs(dx)<4&&Math.abs(dy)<5` → `<7&&<8`로 넓혀 더 적극적으로 회피.
  - 버블 크기: `40+min(22,confirmed*5)`px(최대 62px) →
    `34+min(14,confirmed*3)`px(최대 48px)로 축소.
  - `@media(max-width:700px)`의 `.mmtMap{min-height:430px}` →
    `620px`(데스크톱 500px보다 크게 — 좁은 폭을 세로 공간으로 보완).
- file: `index.html`: 캐시 버전 갱신. `final-layout-polish.js`에 동일 id
  (`hd20MaturityMapTabScript`)의 또 다른 버전 문자열이 있으나, index.html의
  정적 `<script id="hd20MaturityMapTabScript">`가 이미 같은 id를 선점해
  동적 로더가 스킵하는 죽은 설정임을 확인(이번 세션에서 만든 문제 아님,
  손대지 않음).
- verification (Chromium, CDP 캡처):
  - 수정 전/후 스크린샷 대조: 수정 전 여러 버블이 직접 겹쳐 숫자가 완전히
    가려짐 → 수정 후 16개 버블 전부 숫자 식별 가능(가장 밀집된 구간의 팀
    이름 라벨만 일부 인접).
  - 16개 서브탭 전체 재순회(scrollHeight, 그리드 데이터셋 수): 수정 전과
    완전히 동일한 수치, 콘솔 오류 0건 — 이 파일 변경이 다른 화면에 영향
    없음을 확인.

### `b8f75bc` — perf: batch maturity-map DOM insertion; harden pagination re-scan timing
- file: `hd20-maturity-map-tab.js`
  - `render()` 루프: `map.appendChild(dot)`/`cases.appendChild(row)`(팀당
    개별 호출, 총 32회) → `dotFrag`/`rowFrag`(DocumentFragment)에 누적,
    루프 종료 후 `map.appendChild(dotFrag);cases.appendChild(rowFrag)`
    2회로 축소.
  - 진단 근거: `document.querySelectorAll(':scope>*')` 반복으로 28개 파일의
    `.observe(document.body|documentElement,{subtree:true,...})` 호출을
    확인(action-effect-recurrence-integrity.js, hd20-kpi-parity-guard.js,
    hd20-canonical-grid-guard.js 등). 원본 파일(수정 전 `hd20-maturity-map-
    tab.orig.js`)로도 `document.querySelectorAll('*').length`가 동일하게
    4.55s 걸리는 것을 대조해 이 파일의 로직 문제가 아니라 앱 전역의
    관찰자 수 문제임을 확인 후, 그래도 "내가 발생시키는 mutation 횟수"를
    줄이는 것이 유일하게 안전하고 국지적인 개선 지점이라 판단.
- file: `table-enhance-suite.js`
  - `window.addEventListener('hd20-subtab-changed',()=>setTimeout(scan,60))`
    → `setTimeout(scan,0);setTimeout(scan,60);setTimeout(scan,250)` 3회
    재시도로 보강(관찰자 폭주로 인한 타이머 지연에 대비, 첫 시도로는
    race를 완전히 못 막았음을 뒤이어 발견).
- file: `audit-subtab-dedupe-guard.js`, `action-subtab-dedupe-guard.js`
  - `window.addEventListener('hd20-subtab-changed',e=>setTimeout(()=>apply
    (e.detail),0))` → `e=>Promise.resolve().then(()=>apply(e.detail))`.
  - 진단 과정: `deep_repro2.py`~`deep_repro5.py` 5단계로 좁혀감 —
    (1) 종료평가 표 자체의 rows/hidden 수가 정상(133/108)임을 먼저 배제,
    (2) `document.body` 자식 중 800px 초과 요소를 걸었을 때 `.app`이
    4,453px로 정상이었으나 `scrollHeight`는 12,745px로 불일치 발견,
    (3) `bottom>6000`인 요소를 전수 검색했으나 없음 → 절대위치 요소가
    아님을 확인, (4) 버그 상태를 잡은 직후 곧바로 재조회하면 이미 정상
    (4504)으로 돌아와 있는 것을 발견해 "일시적으로만 존재하는 겹침"으로
    결론, (5) `audit-subtab-dedupe-guard.js`만 `setTimeout(fn,0)`을 쓰고
    `advancement-subtab-dedupe-guard.js`는 이미 동기 호출이었던 것을
    grep으로 대조해 원인 파일 특정.
- file: `final-layout-polish.js`, `index.html`: 4개 변경 파일 캐시 버전 갱신.
- 병합 메모: 로컬에 6개 파일 미커밋 변경분이 쌓인 상태에서 레포 소유자의
  커밋 2건(`5035395`,`500eb92`, CSS 폭/여백 조정)이 먼저 push됨 → `git pull`
  이 `index.html`(한 줄짜리 minified 파일)에서 자동 병합 실패 →
  `git show origin/main:index.html`로 원격 최신본을 받아 그 위에 내 2개
  캐시 버전 문자열 교체만 재적용하는 방식으로 정확히 해소(다른 5개 파일은
  소유자가 손대지 않아 `git log --oneline -- <file>`로 사전 확인 후 그대로
  적용).
- verification (Chromium, 모바일 430px):
  - 고도화 맵 탭 최초 클릭→렌더 완료: 0.35s(수정 전 수 초, 최대 관측
    4.91s+).
  - 버블 직접 클릭(`onclick()` 직접 호출) 반응: 여전히 초 단위 소요 —
    28개 관찰자 각각의 감사가 필요한 별도 과제로 남김.
  - 종료평가 race: 단일 시퀀스 10회 반복 재현 시도 결과 수정 전 대비 빈도
    감소(완전 제거는 아님, 개발일지에 잔여 리스크로 기록).
  - 16개 탭 전체 순회: 콘솔 오류 0건, scrollHeight 전부 정상 범위.
  - 소유자의 최근 2개 커밋과 diff 대조로 충돌 없이 병합됐음을 확인.

### `d4ca925` — feat: prioritize headline KPI cards above OPERATION HEALTH
- file: `dashboard-priority-layout.js`
  - `ensure()`: PERFORMANCE FLOW 라벨 삽입 체크를 OPERATION HEALTH(`root`)
    생성보다 앞으로 이동(원래는 root 생성 → label 체크 순서였음. 둘 다
    `cards.insertAdjacentElement('beforebegin',...)`를 쓰므로 이론상으로는
    "나중에 호출된 쪽이 .cards에 더 가깝게 붙는" 것이 정상이라 순서 자체가
    최종 DOM 배치에 영향은 없지만, 코드 가독성과 한 곳에서 "라벨 먼저,
    그 다음 메인 블록" 순서로 명확히 하기 위해 재배치).
  - `root`(OPERATION HEALTH) 삽입: `cards.insertAdjacentElement
    ('beforebegin',root)` → `cards.insertAdjacentElement('afterend',root)`.
    이 한 줄이 실질적인 순서 반전의 핵심.
  - PERFORMANCE FLOW 라벨의 `<span>` 부제: "보조지표로 확인" →
    "핵심지표로 확인"(문구도 실제 우선순위에 맞게 수정).
- file: `final-layout-polish.js`: `dashboard-priority-layout.js` 캐시 버전
  `20260902-1` → `20260923-kpi-first-1`.
- 디버깅 메모(잘못된 회귀 의심 기록): 수정 직후
  `document.getElementById('hd20Subnav'/'hd20PurposePanel'/'hd20OpsMetrics')`
  가 모두 `null`로 나와 처음엔 이 변경이 원인인 회귀로 의심. 원인 규명
  절차: (1) `ensure()`/`ensurePurpose()`/`renderMetrics()`의 anchor 의존성을
  코드로 추적했으나 `.cards`/`#hd20DashboardPriority`와 무관하게
  `.beginnerHint` 기준으로 삽입되는 것을 확인, (2) 그런데도 사라지는 것을
  실측했기에 **동일 테스트 스크립트를 원본(미수정) 파일에도 돌려봄** →
  원본에서도 동일하게 `purposePanel:false, subnav:false`가 재현됨을 확인,
  (3) 대기시간을 6초로 늘려 수정본·원본 각 3회씩 비교 → 두 파일이 완전히
  동일한 패턴(항상 subnav/purposePanel은 false, opsMetrics만 간헐적으로
  true/false)을 보임을 확인해 "내 변경과 무관한, 애초에 대시보드 영역에서는
  쓰이지 않는 요소들"이라는 결론에 도달. 잘못된 회귀 의심 → 반증까지의
  과정을 기록으로 남겨, 이후 유사한 착시를 겪을 때 "원본과 대조 먼저"라는
  절차를 상기시키기 위함.
- verification (Chromium):
  - `inspect_dashboard.py`로 `.app` 직계 자식 순서 확인: `top → beginnerNav
    → beginnerHint → hd20DashboardSectionLabel(PERFORMANCE FLOW) → cards
    → hd20DashboardSectionTabs → hd20DashboardPriority(OPERATION HEALTH)
    → card(트렌드 차트)`.
  - 데스크톱(1440px)·모바일(430px) 스크린샷으로 헤드라인 지표 5개 카드가
    워크플로 안내 직후 바로 보임을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건, scrollHeight 전부 직전 검증치와
    일치(종료평가의 기존 문서화된 간헐적 race 제외).

### `80b1fd2` — fix: reorder 확정·수평전개 summary-before-detail; fix missing 효과·재발관리 panel
- 조사 방법론: `inspect_all_tabs.py`로 15개 탭의 `#awActivity`/
  `#awWorkplace`/`#hd20MaturityConditionAnalysis`/`#performanceConversion
  Analysis`/`#awAudit`/`#awAction`(탭별로 맞는 루트) 직계 자식들의
  높이·제목을 일괄 실측. 이후 `inspect_opaque.py`로 한 덩어리로 보이는
  블록(`.hd20AdvancementIntegrated`, `.auditDraw`, `#hd20AuditCloseEvaluation`,
  `#awAction`)의 내부 3단계까지 재귀 실측.
- file: `activity-workflow.js`
  - `.awSplit` 내부 두 `${card(...)}` 호출의 순서를 반전:
    `card('고도화 후보 / 공식판정', <table class="awTable">...)` +
    `card('운영상태', <div class="awAuditLane">...)` →
    `card('운영상태',...)` + `card('고도화 후보 / 공식판정',...)`.
    (변수/함수 로직은 그대로, 템플릿 리터럴 내 두 조각의 등장 순서만 교체.)
- file: `hd20-subtabs.js`
  - `ensureActionVerify(root)`: `const anchor=$('.awKpis',root)||
    $('.awFlow',root)` → `...||$('.awHero',root)`.
  - 진단 과정: `document.getElementById('hd20ActionVerifyStatus')`가
    "효과·재발관리" 직행/`조치 목록` 경유 등 4가지 네비게이션 경로 모두에서
    100% `null` 재현. `#awAction`의 실제 `directChildrenClasses`를
    조회해 `.awKpis`/`.awFlow`가 존재하지 않고 `.awHero`/`.awActions`만
    존재함을 확인 → `ensureActionVerify`가 찾던 앵커가 애초에 이 마크업
    버전에서 존재한 적이 없었거나 리네임 시 갱신이 누락된 것으로 추정.
- file: `index.html`: 위 2개 파일 캐시 버전 갱신.
- 보류(수정하지 않음): `④ 6개월 관리중`의 "awAuditLane" 요약 라인이
  `audit6m`(상세 표) 뒤에 오는 것도 동일 패턴으로 의심되었으나,
  `activity-workflow.js`에서 `awAuditLane`을 생성하는 코드 조각의 주변
  텍스트가 "⑤ 진단·유지"로 표기되어 있어(현재 영역 번호는 "④") 레거시/
  불일치 코드 경로일 가능성이 있음. 실제 라이브 DOM에서 `awAuditLane`이
  `awHero` 직후가 아니라 `audit6m` 이후에 위치하는 이유를 완전히 규명하지
  못한 상태로 성급히 수정하면 다른 화면에 영향을 줄 위험이 있어 별도
  조사 과제로 남김(문서에 기록).
- verification (Chromium, 모바일 430px):
  - 확정·수평전개: `inspect_opaque2.py`로 `.awSplit` 자식 순서가
    `awCard(운영상태,420px) → awCard(고도화 후보/공식판정,1200px)`로
    바뀐 것을 확인. 스크린샷으로도 대조.
  - 효과·재발관리: 수정 전후 `getElementById` 결과 대조
    (`null` → `{display:'block',hidden:false,h:255,text:'효과·재발
    검증현황...전체 개선요청640건...'}`). 스크린샷으로 패널이 실제
    렌더링됨을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. scrollHeight는 효과·재발관리만
    4,588→4,850px 증가(정상), 나머지 15개는 직전 검증치와 완전 동일.

### `abc91fc` — fix: reserve scrollbar-gutter to stop content leaning/margin shift
- file: `styles.css`
  - `html,body{min-width:0}` 앞에 `html{scrollbar-gutter:stable both-edges}`
    추가.
  - 진단: `styles.css`에서 `.app{max-width:1680px;margin:auto;padding:18px
    22px 30px}`를 확인 — `margin:auto`가 `body`의 가용 폭 기준으로
    가운데 정렬되는데, 클래식 스크롤바 브라우저에서는 세로 스크롤바
    등장 시 `document.documentElement.clientWidth`가 스크롤바 두께만큼
    줄어들어, 탭마다 콘텐츠 길이(스크롤 유무)가 달라지면 `.app`의 중심
    기준 폭도 함께 바뀌어 좌우 여백이 들쭉날쭉해짐.
  - 재현: 헤드리스 Chromium 기본값은 오버레이 스크롤바(폭을 줄이지 않음)
    라 그대로는 재현되지 않아, `chromium.launch(args=['--disable-features
    =OverlayScrollbar'])`로 클래식 스크롤바를 강제해 실측.
  - 1차 시도(`scrollbar-gutter:stable`만): 클라이언트 폭 자체는
    고정(`scrollbarWidth:0`, 즉 `innerWidth===clientWidth`가 항상 유지)
    되어 탭 전환에 따른 흔들림은 해소됐으나, `.app`의 leftGap/rightGap이
    16px/31px로 15px 고정 비대칭이 남는 것을 실측(스크롤바가 다시 오른쪽
    한 곳에만 공간을 예약하기 때문).
  - 최종: `both-edges` 키워드 추가 — 좌우 양쪽에 동일하게 공간을
    예약해 스크롤바 유무와 무관하게 항상 대칭이 되도록 확정.
  - file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, `--disable-features=OverlayScrollbar`):
  - 데스크톱(1440px) 짧은 탭(대시보드)과 긴 탭(조치목록, 8,139px) 모두
    `leftGap=rightGap=31, diff=0`으로 완전 동일.
  - 모바일(430px): `leftGap=rightGap=25, diff=0`, 가로 스크롤 없음.
  - 16개 탭 전체 재순회(기본 오버레이 스크롤바 환경): 콘솔 오류 0건,
    scrollHeight 전부 정상 범위(종료평가의 기존 문서화된 간헐적 race
    제외).
  - 데스크톱 전체 스크린샷으로 레이아웃 깨짐 없음을 육안 확인.

### `3f6be0f` — fix: remove duplicate intro paragraph on 활동관리 (activity.manage) tab
- 조사 방법론: 16개 탭 전체를 `full_page=True` 스크린샷으로 캡처해 육안
  검토(자동화 메트릭 비교만으로는 "같은 화면에 두 개의 유사한 소개문이
  동시에 보이는" 종류의 중복을 못 잡는다는 것을 이번에 확인 — 텍스트
  내용 자체를 비교해야 함).
- 발견: ② 활동관리 화면에 "WORK PURPOSE · 활동관리"(hd20-subtabs.js
  CONTRACT.purpose)와 `#awActivity`의 자체 awHero `<p>`(activity-
  workflow.js)가 거의 동일한 문장을 반복. 추가로 "①②③④" 세부 단계
  가이드(`.awFlow`)가 페이지 최상단의 "업무 흐름" 배너와도 주제가
  겹치는 것을 발견했으나, 전자는 이 탭 전용 4단계(개선활동 등록→팀장
  확인→Audit 연계→고도화 후보)이고 후자는 5단계 전체 서비스 흐름으로
  세부화 수준이 달라 순수 중복은 아니라고 판단해 유지.
- file: `activity-workflow.js`
  - `<h2>② 활동관리</h2><p>실제 등록·GMES 원천 기준 5S 개선활동을
    등록하고 실행 이력을 관리합니다.</p></div>` →
    `<h2>② 활동관리</h2></div>`(문단만 제거, 제목·이후 `.awActions`/
    `.awFlow`는 그대로).
- 진단 절차(다른 영역과의 비교): `grep`으로 ③(고도화·표준화)·④(진단·유지,
  "⑤ 진단·유지"로 오기된 레거시 문자열 포함)에도 유사한 awHero 문단이
  소스에 있음을 먼저 발견 → 성급히 4개 영역 모두 수정하는 대신, 각 탭의
  실제 스크린샷을 먼저 대조 → ③(후보 목록)·⑤(조치 목록) 모두 WORK
  PURPOSE 패널 하나만 렌더링되고 레거시 awHero 문단은 화면에 전혀
  나타나지 않음을 확인(해당 영역의 `#awWorkplace`/`#awAudit`/`#awAction`
  이 다른 최신 스크립트에 의해 먼저 생성되어, 레거시 `build()` 함수 내부의
  `if($('#awXxx'))return true` 가드가 항상 참이 되어 본문이 실행되지
  않는 구조). 이 대조 덕분에 ②만 수정하고 ③④⑤ 소스의 레거시 문자열은
  건드리지 않기로 결정(죽은 코드를 굳이 청소하는 것보다, 실제 화면에
  보이는 문제만 정확히 고치는 것을 우선).
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `document.body.innerText.includes('실제 등록·GMES 원천 기준')` →
    수정 전 true, 수정 후 false.
  - scrollHeight: 활동관리 5,309→5,268px, 실적분석 3,806→3,766px(같은
    awHero를 공유하므로 둘 다 감소). 나머지 14개 탭은 직전 검증치와
    완전 동일.
  - 16개 탭 전체 재순회: 콘솔 오류 0건.

### `7b70f79` — feat: replace English jargon eyebrow-labels and dense descriptions with plain Korean
- 조사: `grep -oh "WORK PURPOSE\|FIELD EXECUTION\|..."`로 전체 JS에서
  영어 소제목 7종의 출현 횟수·소속 파일을 먼저 전수 파악(각 1회씩만
  하드코딩되어 있고 재사용 함수를 통해 여러 화면에 뿌려지는 구조임을
  확인 — 예: `workflow-crud.js`의 "Canonical Source" 한 곳만 고치면
  이 배지를 쓰는 모든 화면에 반영됨).
- file: `hd20-subtabs.js` — `renderPurpose()`의
  `<small>WORK PURPOSE · ${...}</small>` → `<small>화면 안내 · ${...}</small>`.
  16개 탭 전체가 공유하는 `ensurePurpose()`/`CONTRACT` 시스템의 템플릿
  1곳만 수정하면 전체 반영됨.
- file: `hd20-five-area-integration.js`
  - `addAreaHeader(activity,'FIELD EXECUTION',...)` →
    `addAreaHeader(activity,'현장 활동',...)`.
  - `addAreaHeader(conversion,'ADVANCEMENT CONTROL','고도화·판정',
    '성과전환 분석, 고도화 후보, GMES 원천데이터, 공식판정, 확정사례와
    고도화 수준을 하나의 화면으로 연결합니다.')` →
    `addAreaHeader(conversion,'고도화 관리','고도화·판정','등록된 고도화
    후보가 조건을 얼마나 충족했는지 확인하고, 공식 확정 여부를
    판정합니다.')` — 라벨과 설명문을 함께 재작성.
- file: `dashboard-priority-layout.js`
  - `<small>OPERATION HEALTH</small>` → `<small>운영 상태</small>`.
  - PERFORMANCE FLOW 라벨 `innerHTML` 리터럴 내 `<small>PERFORMANCE
    FLOW</small>` → `<small>핵심 지표</small>`.
- file: `hd20-maturity-map-tab.js`
  - `<small>ADVANCEMENT PORTFOLIO</small>` → `<small>고도화 현황</small>`.
- file: `workflow-crud.js`
  - `<span class="wfCanonicalNote">Canonical Source</span>` →
    `<span class="wfCanonicalNote">실제 데이터 기준</span>`.
- file: `index.html`(정적 로드 3개: hd20-subtabs.js/hd20-maturity-map-tab.js/
  workflow-crud.js), `final-layout-polish.js`(동적 로드 2개:
  dashboard-priority-layout.js/hd20-five-area-integration.js) 캐시 버전
  갱신.
- 조사했지만 이번엔 손대지 않은 것: `performance-conversion-analysis.js`의
  `build()`가 만드는 5단계 퍼널(`①활동등록/②고도화후보/③공식확정/
  ④현재유지/⑤고도화수준`, `.pcStage[data-stage=...]`)에서 "②고도화후보"/
  "③공식확정"이 상단 metric 카드와 값이 겹침을 재확인. 이 markup은
  `advancement-subtab-dedupe-guard.js`가 `sub==='standard'`일 때
  `key==='confirmed'||key==='maintained'`로 stage를 필터링하는 데
  그대로 재사용 중이라, `judge` 서브탭에서만 두 항목을 골라 숨기려면
  가드 로직을 서브탭별로 정밀하게 분기해야 함 — 성급히 markup을 잘라내면
  `확정·수평전개` 탭이 깨질 수 있어 이번 커밋에서는 보류하고 별도 과제로
  기록.
- verification (Chromium, 모바일 430px):
  - `document.body.innerText.includes(term)`을 7개 용어 전부에 대해
    확인 — 수정 전 true, 수정 후 전부 false.
  - `document.querySelector('#hd20PurposePanel small')?.textContent`
    → `"화면 안내 · 활동관리"`로 정상 대체 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 설명문이 짧아진 만큼 관련 탭
    scrollHeight가 수~수십 px 감소(정상), 구조적 변화는 없음.

### `03ec959` — feat: regroup 활동관리 sections by topic (context -> input -> data -> analysis)
- 조사: `walk_activity_dom.py`로 `#awActivity`의 실제 자식 요소 순서를
  class/id/높이/제목까지 정확히 조회(스크린샷 육안 판단이 아니라 DOM
  쿼리로 확정). "② 활동관리" 카드가 두 번 나오는 것처럼 보였던 이전
  판단은 착시였음도 함께 확인 — 실제로는 `workflow-crud.js`의
  `toolbar()`가 `.awHero .awActions`에 버튼을 병합해 넣을 뿐, 별도
  카드를 만들지 않음.
- 발견: `activity-excel-preview-import.js`의 `mount()`가
  `hero.insertAdjacentElement('afterend',bar)`(`hero=root.querySelector
  ('.awHero')`)로 항상 `.awHero` 직후에 꽂히도록 하드코딩되어 있어,
  소스 템플릿상 `.awHero` 바로 다음에 있어야 할 `.awFlow`(4단계 흐름
  가이드, 정적 템플릿에 이미 그 위치로 정의됨)를 밀어내고 있었음.
  `#hd20ImportAnalysis`(activity-import-analysis-mail-preview.js)는
  `document.getElementById('hd20ActivityExcelImport')`(=axBar) 기준
  `afterend`로 스스로 따라붙게 구현되어 있어, axBar만 옮기면 자동으로
  같이 이동함(추가 수정 불필요).
- file: `activity-excel-preview-import.js`
  - `const hero=root.querySelector('.awHero');...hero.insertAdjacentElement
    ('afterend',bar)` → `const hero=root.querySelector('.awFlow')||
    root.querySelector('.awHero');...`(동일 삽입 호출, 앵커만 교체).
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `walk_activity_dom.py` 재실행으로 새 순서 확인:
    `hd20AreaHeader→awHero→awFlow→axBar→hd20ImportAnalysis→awGrid→adcCard`.
  - 기능 테스트: `[data-ax-template]` 클릭 → `5S_운영실적_업로드양식.csv`
    다운로드 정상. `.axBar .primary`(Excel 검증 버튼)의 `onclick`
    핸들러가 앵커 변경 후에도 정상 연결됨을 확인.
  - scrollHeight: 활동관리 4,898px, 수정 전과 완전히 동일(콘텐츠 삭제
    없이 DOM 순서만 바뀌었으므로 총 높이는 불변 — 의도한 결과와 일치).
  - 16개 탭 전체 재순회: 콘솔 오류 0건, 나머지 15개 탭 scrollHeight도
    직전 검증치와 동일.

### `7de480a` — feat: regroup 고도화·표준화 - candidate list right after progress funnel
- 조사: `walk_advancement_dom.py`로 `#performanceConversionAnalysis`와
  `#awWorkplace`의 실제 자식 순서를 정확히 조회.
- file: `hd20-five-area-integration.js`
  - `integrateAdvancement()`: `let host=conversion.querySelector
    ('.hd20AdvancementIntegrated');if(!host){host=document.createElement
    ('section');host.className='hd20AdvancementIntegrated';conversion.
    appendChild(host)}` → `appendChild(host)` 대신
    `const anchor=conversion.querySelector('.pcInsight')||conversion.
    querySelector('.pcFlow');if(anchor)anchor.insertAdjacentElement
    ('afterend',host);else conversion.appendChild(host)`로 변경.
    `.pcInsight`/`.pcFlow` 둘 다 없는 극단적 경우에만 기존 동작(끝에
    追加)으로 폴백.
- file: `final-layout-polish.js`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `walk_advancement_dom.py` 재실행: 새 순서
    `hd20AreaHeader→pcHeader→pcFlow→pcInsight→hd20AdvancementIntegrated
    (154행표)→pcGrid(pcTypes+pcCriteriaBanner)` 확인.
  - 공유 컴포넌트 영향 검사: `#performanceConversionAnalysis`/
    `#awWorkplace`는 `advancement-subtab-dedupe-guard.js`의 `mcaHeavy`
    로직으로 다른 3개 서브탭에서도 표시/숨김이 제어되는데, 이 로직은
    이번 커밋에서 전혀 건드리지 않았으므로 "3조건 분석"·"라인·작업장
    상세"에서는 여전히 154행 표가 올바르게 숨겨지고(`work.classList
    .toggle('hd20SubHidden',mcaHeavy)`가 대상 요소 자체를 토글하는
    방식이라 DOM 위치 이동과 무관), "확정·수평전개"에서는 기존과 동일
    하게 보임을 각 서브탭 스크린샷으로 직접 대조 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 후보 목록 scrollHeight
    6,499→6,490px(순서 변경에 따른 미세 리플로우, 콘텐츠 변화 없음).

### `29f702c` — feat: clarify funnel connects to top metric cards (reframe, not delete)
- file: `performance-conversion-analysis.js`
  - `.pcHeader`의 `<p>` 설명문 뒤에 문장 추가: "후보·공식 확정 건수는
    위 핵심지표 카드와 같은 값을, 단계별 흐름으로 다시 보여드립니다."
  - 이전에 시도했던 "퍼널에서 중복 항목 제거" 방식은
    `advancement-subtab-dedupe-guard.js`가 `.pcStage` 마크업을
    `확정·수평전개` 탭의 stage 필터링(`key==='confirmed'||key===
    'maintained'`)에 그대로 재사용하고 있어 위험하다고 이미 판단했던
    것을 재확인하고, "삭제" 대신 "설명 추가"로 방향 전환.
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `document.querySelector('.pcHeader p')?.textContent`로 새 문장이
    포함된 것을 확인.
  - 스크린샷으로 실제 렌더링 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 이 설명문을 공유하는 3개
    서브탭(후보 목록/3조건 분석/라인·작업장 상세)만 텍스트 길이만큼
    scrollHeight 37~38px 증가(정상), 나머지 13개는 직전 검증치와 동일.

### `a60d61d` — feat: regroup 6개월 관리중 - status summary before detail table
- 조사: `walk_audit_dom.py`로 `#awAudit`의 4개 서브탭별 실제 자식 순서를
  전수 조회. "6개월 관리중"에서만 `.awAuditLane`(410px)이
  `.awCard.audit6m`(1744px) **뒤**에 위치함을 확인.
- 원인 체인 추적: `grep -n "insertAdjacentElement"`로 관련 5개 파일
  (activity-workflow.js/audit-random-draw.js/audit-six-month-control.js/
  audit-canonical-execution.js/audit-close-evaluation.js/audit-action-
  case-trace.js)의 앵커 로직을 모두 대조:
  - `audit-random-draw.js`(auditDraw): `(a.querySelector('.awHero')||
    a.firstElementChild).insertAdjacentElement('afterend',host)`
  - `audit-six-month-control.js`(audit6m): `(host.querySelector
    ('.auditDraw')||host.querySelector('.awHero')||host.firstElementChild)
    ?.insertAdjacentElement('afterend',box)`
  - `audit-canonical-execution.js`(auditClosedLoop): 위와 동일한
    `.auditDraw` 우선 앵커.
  - `audit-close-evaluation.js`(hd20AuditCloseEvaluation): `.audit6m`
    우선, 없으면 `.auditClosedLoop`, 없으면 `host.lastElementChild`.
  - `audit-action-case-trace.js`: `.audit6m`→`.auditClosedLoop`→
    `.awHero`→`firstElementChild` 순으로 폴백.
  모든 카드가 ".auditDraw가 있으면 그 뒤" 패턴을 공유하고, auditDraw
  자신은 항상 `.awHero` 바로 뒤에 꽂히므로, "awHero→auditDraw→(나머지
  전부 체인)"이 고정되고 원래 awHero 바로 다음에 있어야 했던
  awAuditLane이 이 체인 전체 뒤로 밀려나는 구조였음을 규명.
- file: `audit-random-draw.js`
  - `(a.querySelector('.awHero')||a.firstElementChild).insertAdjacentElement
    ('afterend',host)` → `(a.querySelector('.awAuditLane')||a.querySelector
    ('.awHero')||a.firstElementChild).insertAdjacentElement('afterend',host)`.
  - 안전성 근거: `.awHero`와 `.awAuditLane`은 `activity-workflow.js`의
    단일 `w.innerHTML=` 호출로 원자적으로 함께 생성되므로, `#awAudit`이
    존재하는 시점에는 항상 `.awAuditLane`도 이미 존재함 — 타이밍 경합
    없음.
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `walk_audit_dom.py` 4개 서브탭 전체 재조회: "6개월 관리중"만
    `awHero→awAuditLane→audit6m`으로 순서 변경, 나머지 3개(대상추출/
    실시점검입력/종료평가)는 완전히 동일(awAuditLane이 그 서브탭에서는
    애초에 숨김 처리되어 영향 없음).
  - 스크린샷으로 "④ 진단·유지" 제목 바로 다음에 4개 요약 카드
    (관리중 200건/재발징후 29건/Action연계 546건/월별확인 200건)가
    표시되고 그 다음에 상세 표가 이어짐을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. scrollHeight 16개 전부 수정
    전과 완전히 동일(콘텐츠 삭제 없이 순서만 조정 — 의도한 결과와 일치).

### `19d2f5e` — fix: restore amHeroNote position on 효과·재발관리
- 조사: `walk_action_dom.py`로 `#awAction`의 4개 서브탭별 실제 자식 순서를
  전수 조회. "효과·재발관리"만 `.amHeroNote`(160px)가
  `#hd20ActionVerifyStatus`(273px) 뒤로 밀려나 있음을 확인.
- 원인 규명: `action-mail-workflow.js`의 `build()`가 `awHero`+`amHeroNote`
  를 단일 `a.innerHTML=` 호출로 원자적으로 생성(`amHeroNote`가 항상
  awHero 바로 다음). 그런데 오늘 세션 초반(효과·재발관리 검증패널 미표시
  버그 수정 시) `ensureActionVerify`에 `.awHero` 폴백을 추가하면서,
  `#hd20ActionVerifyStatus`가 `.awHero` 바로 뒤에 꽂혀 이미 그 자리에
  있던 `.amHeroNote`를 밀어낸 것으로 확인 — 그 수정 자체(패널을 보이게
  만든 것)는 올바랐으나 부수적으로 순서가 어긋남.
- file: `hd20-subtabs.js`
  - `ensureActionVerify(root)`: `const anchor=$('.awKpis',root)||
    $('.awFlow',root)||$('.awHero',root)` → `...||$('.amHeroNote',root)||
    $('.awHero',root)`(amHeroNote를 awHero보다 우선 앵커로 추가).
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `walk_action_dom.py` 재실행: "효과·재발관리"가
    `awHero→amHeroNote→hd20ActionVerifyStatus`로 다른 3개 서브탭과
    동일한 순서가 됨을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 효과·재발관리만 +3px(무시 가능한
    리플로우), 나머지 15개는 직전 검증치와 동일.

### `b4d45e1` — fix: show "고도화 작업장 추이" chart only on 고도화·표준화 area
- 조사 순서: `grep -c "trendBox" index.html` → 1(정적 중복 아님 확인) →
  `check_trendbox.py`로 5개 영역 전환마다 `.trendBox`의 상위 `.card`가
  `visible`/`hidden`/`parentPath`를 추적 → 5개 영역 전부 `visible:True,
  hidden:False, parentPath:['DIV.card','DIV.app(...)']`로 동일 —
  `.app`의 직계 자식이라 영역 전환과 무관하게 항상 보임을 확정.
- 근본 원인: `beginner-navigation.js`의 `closeScreens()`가
  `document.querySelectorAll('.awScreen')`만 순회해 `.on` 클래스를
  떼는데, 이 트렌드 카드는 `.awScreen` 클래스가 없어 애초에 이 순회
  대상에 포함되지 않음. `openAdvancement()`도 `#performanceConversion
  Analysis`만 토글할 뿐 이 카드는 건드리지 않음.
- file: `hd20-five-area-integration.js`
  - `syncTrendChartVisibility()` 신규: `document.querySelector
    ('.trendBox')?.closest('.card')`로 카드 참조, `window.HD20_NAV
    ?.active?.()||'dashboard'`로 현재 영역 조회,
    `card.classList.toggle('hd20SubHidden',area!=='advancement')`.
  - `window.addEventListener('hd20-nav-area-changed',()=>setTimeout
    (syncTrendChartVisibility,0))` — `beginner-navigation.js`의
    `syncNav()`가 이미 매 영역 전환마다 발생시키는 이벤트를 그대로 재사용
    (신규 이벤트 추가 없음, 기존 인프라 재사용으로 저위험).
  - 최초 로드 시에도 `DOMContentLoaded` 또는 즉시 실행 후 300ms 뒤
    1회 동기화(다른 sync 패턴과 동일한 타이밍 보수 처리).
- file: `final-layout-polish.js`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `check_trendbox.py`: ①②④⑤ 전부 `visible:False,hidden:True`, ③만
    `visible:True,hidden:False`로 전환.
  - `verify_trendbox_subtabs.py`: ③ 내부 4개 서브탭(후보목록/3조건분석/
    라인작업장상세/확정수평전개) 전부 `visible:True`, ③→①로 복귀 시
    다시 `visible:False`로 정상 전환(양방향 확인).
  - 16개 탭 전체 재순회: 콘솔 오류 0건. scrollHeight가 ③의 4개
    서브탭만 수정 전과 동일, 나머지 12개는 차트 높이(약 369px)만큼
    정확히 감소 — 콘텐츠 삭제 없이 가시성만 바뀐 결과와 정확히 일치.
  - 스크린샷으로 "활동관리" 탭이 차트 없이 정상적으로 끝나는 것을
    육안 확인.

### `b0d8911` — fix: clarify "진행중" label ambiguity on 조치 목록 (relabel, not delete)
- 조사: `audit_all_areas.py`로 5개 영역 각각의 `.app` 직계 자식을 스냅샷
  → id/class 기준으로 "5개 영역 모두에서 보이는 것"과 "일부에서만
  보이는 것"을 집합 연산으로 분류. 트렌드차트 수정 후 재실행 결과
  5개 영역 공통 요소는 `top`/`beginnerNav`/`beginnerHint`(정상 공유
  내비게이션)뿐이고, 4개 영역 공통 요소(`hd20Subnav`/`hd20PurposePanel`/
  `hd20OpsMetrics`)는 대시보드를 제외한 나머지 4개 영역에서 정상적으로
  쓰이는 것으로 이미 알고 있던 의도된 구조 — 추가로 "새는" 요소 없음을
  확인.
- 16개 탭 스크린샷 재검토 중 ⑤ 조치 목록에서 상단 지표 "진행/대기
  241건"과 `.amSummary`의 "진행중 162건"을 발견, 계산 검증:
  `action-mail-workflow.js`의 `wait=rows.filter(c=>c.status!=='완료'&&
  !over.includes(c))`(기한경과 제외) vs `hd20-ops-v2.js`의
  `'진행/대기':actions.filter(x=>!isDone(x))`(기한경과 포함) — 162+79
  (기한경과)=241로 계산 정확, 데이터 불일치 아님을 확인.
- file: `action-mail-workflow.js`
  - `<small>진행중</small>` → `<small>기한내 진행중</small>`(라벨만
    수정, `data-am-sum="wait"` 집계 로직·변수명은 그대로 유지).
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - `.amSummary` 텍스트: "전체 요청 640건 완료 399건 기한내 진행중
    162건 기한경과 79건" 정상 확인.
  - 스크린샷으로 4열 그리드에서 2줄 줄바꿈이 자연스럽게 되어 레이아웃
    깨짐 없음을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건, scrollHeight 전부 수정 전과
    동일(텍스트만 변경, 구조 변경 없음).

### `f151a99` — fix: remove 3 duplicate metric cards from 효과·재발 검증현황 panel
- 조사: 16개 탭 스크린샷 재검토 중 ⑤ 효과·재발관리에서 상단
  `#hd20OpsMetrics`(검증대상399/효과검증완료323/검증대기76/재발40)와
  `#hd20ActionVerifyStatus`의 `.awKpis`(전체개선요청640/조치진행
  대기241/완료·효과검증대상399/효과검증완료323/재발확인40, 5개)를
  나란히 대조. `grep -o "'action.verify':\[...\]" hd20-ops-v2.js`로
  상단 스트립 계산식을, `grep -n "function renderActionVerify"`로
  패널 계산식을 각각 확인 — "효과검증 완료"는 라벨까지 완전히 동일,
  "완료·효과검증 대상"="검증 대상", "재발 확인"="재발"도 값이 정확히
  일치함을 확인(서로 다른 함수가 `hd20ActionCasesV2`의 같은 원본
  데이터를 각자 필터링해 중복 산출).
- file: `hd20-subtabs.js`
  - `renderActionVerify(root)`의 `.awKpis` innerHTML에서
    `<div><small>완료·효과검증 대상</small>...</div><div><small>효과검증
    완료</small>...</div>` ~ `<div><small>재발 확인</small>...</div>`
    3개 블록 제거, `전체 개선요청`/`조치 진행·대기` 2개 블록만 유지.
  - `.awHint`(검증대기 76건 안내 문장)는 그대로 유지 — 별도 손실 방지
    조치 불필요(이미 문장 형태로 같은 정보를 담고 있었음).
- file: `index.html`: 캐시 버전 갱신.
- CSS 확인: `.awKpis{grid-template-columns:1fr!important}`(hd20-five-
  area.css) — 단일 열 레이아웃이라 5→2개로 줄어도 그리드가 비어
  보이거나 어색해지는 문제 없음을 사전 확인 후 진행.
- verification (Chromium, 모바일 430px):
  - 패널 텍스트: "전체 개선요청640건 조치 진행·대기241건 완료 399건
    중 효과검증 미입력 76건은 검증 대기 상태입니다."로 정상 축소.
  - 스크린샷으로 실제 레이아웃 확인(2개 카드 + 안내문, 어색함 없음).
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 효과·재발관리만
    3,801→3,707px(제거된 3개 카드 높이만큼 정확히 감소), 나머지
    15개는 직전 검증치와 완전히 동일.

### `d21fc0f` — fix: remove amSummary card on 조치 목록 (3/4 items duplicated top strip)
- 조사 방법론 고도화: `find_remaining_dupes.py`로 16개 탭 전체를 자동
  순회하며 `#hd20OpsMetrics`의 값 집합과 `.awKpi/.amKpi/.amSummary>div/
  .awKpis>div/.pcStage` 각 항목의 값을 대조, 값이 겹치는 항목을 자동
  리스트업. 결과: ③후보목록(퍼널, 이미 처리됨)과 ⑤조치목록
  (`.amSummary`, 지난 커밋에서 라벨만 고치고 값 중복은 미처리)
  2곳만 잔존.
- file: `action-mail-workflow.js`
  - `build()` 템플릿에서 `<div class="amSummary">...</div>`
    (전체요청/완료/기한내진행중/기한경과 4카드) 블록 전체 삭제.
  - 안전성 확인: `renderCases()`의 `sumEls={total:$('[data-am-sum=
    "total"]',a),...}` → `if(sumEls.total){...}` 가드가 이미 있어
    대상 요소 소실 시 조용히 스킵(에러 없음).
  - `action-subtab-dedupe-guard.js`의 `.amSummary` 관련 선택자
    (`classify()`, `:scope > .amSummary`)도 대상이 없으면 단순히
    매치 0건으로 안전.
- file: `index.html`: 캐시 버전 갱신.
- 판단 근거(왜 라벨 수정이 아닌 완전 삭제로 전환했는지): `.amSummary`
  는 `grid-template-columns:repeat(4,1fr)` 고정 4열이라, 중복 3개만
  제거하고 고유 1개("기한내 진행중")만 남기면 그리드 3/4이 빈 채로
  남아 시각적으로 어색함. "기한내 진행중"의 정보 가치도 같은 영역의
  "처리기간 분석" 탭이 계획대비 지연/조기완료/7일이상지연/정시완료로
  이미 더 상세히 다루고 있어, 카드 전체를 삭제해도 실질적 정보 손실이
  낮다고 판단.
- verification (Chromium, 모바일 430px):
  - `document.querySelector('.amSummary')` → `null`.
  - `.amCases tbody tr` 640행 정상(표 렌더링에 영향 없음 확인).
  - 스크린샷으로 레이아웃 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 조치 목록만
    7,090→6,974px(제거분만큼 정확히 감소), 나머지 15개는 직전
    검증치와 완전히 동일.

### `2bbdcfa` — feat: differentiate 실적분석 from 활동관리
- 조사: 16개 탭 풀페이지 스크린샷을 완성도 관점(WORK PURPOSE 안내와
  실제 콘텐츠가 일치하는지)에서 재검토. "실적분석"의 WORK PURPOSE는
  "팀별 활동 편차, 편차 원인, 최근 추이, 후보 전환 분석의 의사방향
  확인"을 명시하지만 실제 화면은 "활동관리"와 완전히 동일(같은 Excel
  Import, 같은 등록 버튼, 같은 흐름가이드)했음.
- 원인 규명: `applyActivity(sub)`의 유일한 분기(`const form=$('.awRegisterFormCard',root);if(form)show(form,sub==='manage')`)
  대상 요소가 `check_registerform.py`로 직접 확인한 결과 두 서브탭
  모두에서 `h:0`(내용이 항상 비어있음 — 등록 폼은 `#awRegisterModal`
  모달로 실제 위치가 옮겨져 있어 정적 카드 자리는 빈 채로 남음)이라,
  toggle이 시각적으로 전혀 효과가 없었음을 확인.
- file: `hd20-subtabs.js`
  - `applyActivity(sub)`에 `isAnalysis=sub==='analysis'` 분기를 추가해
    다음 4개 요소를 실적분석에서 숨김: `.awFlow`(등록 흐름가이드),
    `.awActions`(+5S 신규등록 버튼), `#hd20ActivityExcelImport`(Excel
    Import 도구), `#hd20ImportAnalysis`(Excel Import 분석). `.awGrid`
    (실적 표)와 `.adcCard`(팀별 차트)는 두 서브탭 모두 유지.
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - scrollHeight: 활동관리 4,529px(불변), 실적분석 3,027→2,323px.
  - 스크린샷으로 실적분석이 "화면안내→상단지표→표→팀별차트"의
    조회·분석 전용 화면으로 정리됨을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 나머지 14개 탭은 직전
    검증치와 완전히 동일.

### `2322352` — feat: implement dashboard "성과·운영분석" section
- 조사: `hd20-subtabs.js`의 CONTRACT를 grep으로 전수 추출해 각 항목의
  title/purpose를 실제 화면 내용과 대조하던 중, "dashboard.analysis"로
  가는 UI 버튼이 어디에도 없음을 발견(`check_dashboard_analysis.py`로
  `window.HD20_SUBNAV.state()`가 항상 `{area:'dashboard',sub:'summary'}`
  로 고정되어 있음을 확인). 이어서 `grep -rn "dashboard.*analysis"`로
  이 키가 hd20-ops-v2.js/hd20-kpi-evidence-drill.js/hd20-ops-production-
  filter-guard.js/hd20-operational-integrity.js 등 다수 파일에서 실제로
  참조되는 살아있는 키임을 확인(죽은 코드 아님) — 특히 `hd20-subtabs.js`
  의 `applyDashboard(sub)`에 `sub==='analysis'` 분기가 이미 완전히
  구현되어 있음을 발견: `.cards` 숨김, `#hd20DashboardPriority` 유지,
  `#hd20OperationalBridge` 노출, `.bottomGrid` 노출.
- 1차 시도(되돌림): `dashboard-section-tabs.js`의 `apply(key)`에
  `window.HD20_SUBNAV?.select?.('dashboard','analysis')`를 추가해
  `applyDashboard`를 그대로 트리거하려 했음. 이 과정에서 Playwright
  테스트 환경이 완전히 hang되는 현상을 겪음 — `pg.evaluate()`가 응답
  없이 멈춤. 단계별 `flush=True` 프린트로 격리한 결과 `goto`/최초
  `wait_for_timeout`까지는 성공하고 그 다음 `evaluate()` 호출에서
  멈추는 것을 확인, 페이지 메인 스레드 자체가 무한 루프에 빠졌다고
  판단. `select()`가 내부에서 `hd20-subtab-changed` CustomEvent를
  발생시키고, 이 이벤트가 문서 전역에 걸린 다수의 MutationObserver
  (오늘 세션에서 이미 28개 확인)와 상호작용해 재귀적 갱신 루프를
  유발한 것으로 추정 — 원인을 100% 특정하기보다, 원본 파일로 되돌리고
  더 안전한 경로로 재설계.
- 2차 구현(채택): `dashboard-section-tabs.js`만 수정, `HD20_SUBNAV`나
  다른 파일은 전혀 건드리지 않음. TABS 배열에 6번째 항목만 추가:
  `{key:'analysis',label:'성과·운영분석',desc:'Lead Time·유지율·
  재발률',targets:['#hd20DashboardPriority','#hd20OperationalBridge',
  '.bottomGrid']}`. 기존 `apply(key)` 함수(다른 5개 섹션이 이미
  안전하게 쓰고 있는, cross-file 이벤트를 발생시키지 않는 targets
  기반 표시 전환 로직)를 그대로 재사용 — 신규 함수·이벤트 없음, 배열
  항목 1건 추가가 변경의 전부.
- file: `final-layout-polish.js`: 캐시 버전 갱신.
- verification (Chromium, `--no-sandbox`, `wait_until='domcontentloaded'`
  — 이 세션의 헤드리스 환경이 외부 CDN 차단으로 `'load'` 이벤트가
  끝나지 않는 기존 특성이 있어 테스트 방식만 전환, 앱 자체와는 무관):
  - 6개 섹션 버튼 생성 확인: `1.종합현황 ~ 6.성과·운영분석`.
  - 6개 섹션을 매번 새 페이지 로드에서 독립적으로 클릭 → 전부 정상
    전환, 콘솔 오류 0건.
  - "고도화맵→기준·추이" 연속 전환 시의 자동화 느림을, 원본 미수정
    파일로도 동일 재현해 이번 변경과 무관함을 대조 확인(사전 존재
    특성).
  - 스크린샷으로 "성과·운영분석" 진입 시 "운영 건전성 KPI"(공식판정
    완료율 62.4%, 평균판정 Lead Time 12.6일, 고도화수준 Lv.3.1,
    Audit 후 6개월 유지율 33.1%, Audit 부적합 재발률 22.9%, 기한 내
    개선조치 완료율 54.4%), "6개월 종료평가 결과", "5S 고도화 판정
    기준"이 CONTRACT의 약속대로 정상 표시됨을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. "① 대시보드/성과·운영분석"의
    버튼 클릭이 오늘 세션 전체를 통틀어 처음으로 성공(이전까지는
    도달 경로 자체가 없어 매번 click=False였음), h=3,026px. 나머지
    15개 탭은 직전 검증치와 완전히 동일.

### `4d7cfa0` — fix: restore missing "통합기준정보" modal (#masterModal never existed)
- 조사 경로: `document.getElementById('openMaster').onclick` 직접 호출 →
  예외 없이 종료, `document.body.children.length` 변화 없음(77→77) →
  body 직속 자식 전체 나열해 `masterModal`이라는 id의 요소가 존재하지
  않음을 확인 → `grep -c 'id="masterModal"' index.html`로 정적 마크업
  에도 없음을 확인 → `grep -rln "masterModal|masterOrderPanel|...`로
  관련 4개 파일(app.js/master-context-final.js/operating-policy-
  master.js/modal-safety.js)을 특정.
- 각 파일 전체 소스를 읽어 필요한 셀렉터를 전수 정리:
  - app.js `initMaster()`: `#masterModal`(`.on` 클래스로 표시/숨김),
    `#closeMaster`/`#cancelOrder`/`#saveOrder`, `[data-master-tab]`,
    `#masterOrderPanel`/`#masterTargetPanel`, `#orderList`(
    `renderOrderEditor()`가 팀 순서를 ▲▼ 버튼과 함께 렌더링),
    `#q1Target`~`#q4Target`(`loadTargets()`/`readTargetInput()`).
  - master-context-final.js `mount()`: `#masterModal .modalBox`의
    `.masterTabs` 바로 뒤에 `.hd20MasterContext`(고정정보 카드 4개:
    판정주체/5S활동유형6종/고도화3대판정기준/Audit유지관리) 삽입.
  - operating-policy-master.js `ensure()`: 마찬가지로 `.masterTabs`
    뒤에 "운영정책" 탭 버튼 + `#hd20OperatingPolicyPanel`(개선요청
    자동 Deadline, Audit Risk 가중 랜덤 폼) 삽입.
  - modal-safety.js: `#masterModal .modalBox/.modalHead/.masterTabs/
    .orderList/.modalFoot`에 대한 반응형 sticky 보정 CSS(이미 존재,
    기본 골격이 있다는 전제 하의 오버라이드일 뿐 골격 자체는 안 만듦).
  - `#cols`/`#targetLine`/`#targetLabel`(app.js의 `renderChart()`/
    `renderTargetInfo()` 대상)은 `grep -c`로 index.html에 이미 정상
    존재함을 확인해 모달 문제와 무관함으로 범위에서 제외.
- 신규 파일: `master-info-modal.js`
  - 기존 `activity-register-modal.js`의 모달 CSS 패턴
    (`position:fixed;inset:0;z-index:...;display:none` +
    `.on{display:flex}`)을 그대로 따라 일관성 유지.
  - `#masterModal > .modalBox`에 `.modalHead`(제목+`#closeMaster`),
    `.masterTabs`(초기 2개 탭: 표시순서/인당목표), `#masterOrderPanel`
    (`#orderList` 컨테이너 포함), `#masterTargetPanel`(Q1~Q4 input,
    기본 `display:none`), `.modalFoot`(`#cancelOrder`/`#saveOrder`)
    구조를 문자열 템플릿으로 작성해 `document.body`에 삽입.
  - `master-context-final.js`가 삽입할 `.hd20MasterContext`용 CSS와
    `operating-policy-master.js`가 재사용할 `.masterTabs button`류
    스타일도 함께 정의(두 파일 모두 자체 스타일을 안 만들고 공용
    클래스에 의존하는 구조였으므로).
- file: `index.html`: `master-info-modal.js` 스크립트 태그를 `app.js`
  바로 앞에 삽입 — `initMaster()`(app.js의 `boot()`가 `DOMContentLoaded`
  또는 즉시 실행) 시점에 `#masterModal`이 이미 DOM에 존재하도록 순서
  보장. `master-context-final.js`/`operating-policy-master.js`는
  로드 순서상 더 뒤에 있고 각자 `if(!modal||!tabs)return false`류
  가드가 있어 순서 문제 없음을 확인.
- verification (Chromium, 모바일 430px):
  - 클릭 → `document.getElementById('masterModal').classList.contains
    ('on')` true, `h:932`(전체 오버레이) 확인.
  - "표시순서" 탭: `#orderList .orderRow` 16개(전체 생산팀 수와 일치)
    정상 렌더링.
  - `.hd20MasterContext`(고정정보 카드) 존재 확인 — master-context-
    final.js가 정상적으로 자기 콘텐츠를 삽입했음을 의미.
  - "인당 목표" 탭 전환 → `#masterTargetPanel` `display:block`,
    Q1~Q4 입력란에 기존 `localStorage`(`gmes5s_quarter_perperson_
    targets`) 값 2/3/4/5가 정상 로드됨을 스크린샷으로 확인.
  - "운영정책" 탭(operating-policy-master.js가 동적으로 추가) 클릭 →
    `#hd20OperatingPolicyPanel` `display:block`, "개선요청 자동
    Deadline"·"Audit Risk 가중 랜덤" 콘텐츠 정상 표시 스크린샷 확인.
  - E2E 저장 흐름: `[data-act="down"][data-i="0"]` 클릭으로 1·2번째
    팀 순서 실제 교체(대형Att.팀→대형메인팀) 확인 → `#saveOrder` 클릭
    → 모달 자동 닫힘 확인 → `localStorage.getItem('gmes5s_team_
    display_order')`에 변경된 순서가 정확히 저장됨을 확인.
  - `#closeMaster`(×버튼) 클릭으로도 정상적으로 닫힘을 별도 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 모달이 기본 `display:none`
    상태라 열지 않는 한 페이지 레이아웃에 전혀 영향 없음 — scrollHeight
    16개 전부 수정 전과 완전히 동일.

### `42d606a` — feat: add print-optimized CSS (@media print) - hide chrome, keep data only
- 조사: `grep -l "@media print" *.css` → 매치 없음(0건)으로 인쇄 전용
  스타일이 코드베이스에 전혀 존재하지 않음을 확인. Playwright의
  `page.emulate_media(media='print')`로 실제 인쇄 결과를 스크린샷 촬영,
  화면과 완전히 동일하게 배너·버튼·내비게이션까지 다 나오는 것을 실증.
- file(신규): `print-styles.css`
  - `@media print{...}` 블록 안에 다음을 `display:none!important`:
    `#hd20ValidationBanner`, `.top .controls`, `.beginnerNav`,
    `.beginnerHint`, `#hd20Subnav`, `#hd20DashboardSectionTabs`,
    `.hd20PurposePanel`, `.hd20AreaHeader`, `.awActions`, `.awFlow`,
    `#hd20ActivityExcelImport`, `#hd20ImportAnalysis`, `.teToolbar`,
    `.teMore`, `.wfToolbar`, 모달 계열(`.masterModal`,
    `.awRegisterModal`, `#hd20UniversalGridModal`, `[class$="Modal"]`,
    `[id$="Modal"]`).
  - AI 챗봇 버튼 숨김: 처음 `#hd20ChatLauncher`/`[class*="ChatLauncher"]`
    로 추측했으나 스크린샷에서 여전히 노출됨을 확인 →
    `expert-chatbot-final.js` 소스를 직접 읽어 실제 클래스명이
    `.hd20AiFab`(버튼)/`.hd20AiPanel`(패널)임을 확인 후 정확히 수정.
  - `#hd20OpsMetrics button`은 `hd20-ops-v2.js`에서
    `<button type="button" data-metric="${i}">`로 만들어지는 것을
    사전에 grep으로 확인해 위 "모달/버튼 숨김" 규칙에서 의도적으로
    제외 — 테두리·커서만 인쇄용으로 단순화(`border`, `cursor:default`)
    해 지표 숫자 자체는 그대로 유지.
  - 표 관련: `thead{display:table-header-group}`,
    `tr{page-break-inside:avoid}`로 페이지 넘김 시 헤더 유지.
    `.app{max-width:100%;padding:0}`으로 용지 폭 활용.
- file: `index.html`: `<link rel="stylesheet" href="print-styles.css"
  media="print">` 추가(기존 스타일시트 링크들 마지막). `media="print"`
  속성 덕분에 일반 화면 렌더링 시에는 이 CSS 파일 자체가 로드되지 않음.
- verification (Chromium, 모바일 430px,
  `page.emulate_media(media='print')`):
  - 활동관리: 4,529px(화면) → 2,476px(인쇄). 핵심지표 4개 + "②활동관리"
    배지 + "활동 실적·개선이력" 표(검색창 없이 전체 400건) + 팀별
    차트만 남음을 스크린샷으로 확인.
  - AI 버튼 수정 전/후 스크린샷 대조로 실제로 사라졌음을 육안 확인.
  - 대시보드/후보 목록/대상 추출/조치 목록 4개 화면 추가 스크린샷:
    154행/320건/640건 표가 전부 정상 인쇄되고 내비게이션은 제거됨.
  - `[...document.querySelectorAll('[class$=Modal],[id$=Modal]')].some(m
    =>getComputedStyle(m).display!=='none'&&...)`로 3개 화면 전부에서
    모달 비노출을 코드로 재확인(false).
  - 16개 탭을 `media='screen'` 기준으로 전체 재순회: 콘솔 오류 0건,
    scrollHeight 16개 전부 수정 전과 완전히 동일 — 일반 화면에는
    이 변경이 전혀 영향을 주지 않음을 확인.
- 잔여사항: Audit 대상 추출의 "즉시발송"·"메일"·"Outlook" 등 행 단위
  개별 실행 버튼 일부는 이번 1차 작업 범위에 포함하지 않음(핵심
  내비게이션·도구모음 제거를 우선했음) — 필요 시 후속 과제.

### `1c27f32` — feat: hide "+개선요청 등록" action on non-조치목록 subtabs
- 조사: `walk_remaining.py`로 종료평가/팀장기준정보/처리기간분석 3개
  화면의 DOM 구조를 재점검한 뒤 스크린샷을 정밀 재검토. "팀장 기준정보"
  화면에서 "+ 개선요청 등록" 버튼이 눈에 띔 → `check_awflow.py`로
  `#awAction .awActions`의 실제 내용을 조회해 "+ 개선요청 등록⇩ 현재
  Grid 추출⎙ 출력실제 데이터 기준"임을 확인, `check_amheronote.py`로
  `.awHero`의 설명문("BEFORE→...폐쇄루프로 추적합니다")은 영역 전체
  수준 컨텍스트라 문제 없음을 별도 확인(혼동 방지차 함께 검증).
- file: `hd20-subtabs.js`
  - `applyAction(sub)` 끝에 `show($('.awActions',root),sub==='manage')`
    추가(1줄). `.amRegisterFormCard`/`ensureActionVerify`는 이미
    서브탭별 조건화가 있었으나 `.awActions`만 예외적으로 빠져 있던 것.
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium, 모바일 430px):
  - 4개 서브탭 전체 확인: 조치목록 `{hidden:false,h:118}`, 처리기간
    분석/팀장기준정보/효과재발관리 전부 `{hidden:true,h:0}`.
  - 스크린샷으로 "팀장 기준정보" 화면이 버튼 없이 정리됨을 확인.
  - 16개 탭 전체 재순회: 콘솔 오류 0건. 조치 목록 6,974px(불변),
    나머지 3개 서브탭은 각 약 130px 감소, 다른 12개 탭은 직전
    검증치와 동일(종료평가는 기존에 문서화된 간헐적 race, 무관).

### `a189e3f` — fix: 조치 목록 데스크톱 와이드 화면 빈 여백 제거
- 조사 경로: 사용자 스크린샷(1792px 폭 추정)에서 표 오른쪽 넓은 빈
  공간 확인 → `check_wide_table.py`로 동일 폭(1792px) 재현, `.amGrid`
  w=1432px인데 내부 `.amCases`(실제로는 `<table>` 태그)는 732px만
  차지함을 확인 → `.amCases`가 `width:100%`가 있는데도 `min-width:
  560px`+콘텐츠 크기로만 렌더링되는 것을 보고, 표 자체보다 부모
  `.amGrid`를 의심 → `debug_amgrid.py`로 `.amGrid`의 실제 자식이
  1개(`.amCard`, 헤드="개선요청 현황")뿐임을 확인, `gridTemplateColumns:
  '540.359px 881.641px'`(2열 유지)도 함께 확인.
- `dump_dom_tree.py`로 `#awAction .amGrid`의 렌더링된 DOM 트리를 재귀
  덤프해 구조를 정밀 확인. `check_final.py`로 `.amHead` 텍스트가
  "개선요청 현황"이면서도 `#amDate`/`#amTeam`/`#amRegister`/`.amForm`
  등 신규등록 폼 필드가 `!!exists` true로 나오는 모순을 발견 →
  `trace_amdate.py`로 `#amDate`의 정확한 부모 체인을 추적해
  `INPUT#amDate → LABEL → .amForm → .amBody → .amCard.amRegisterFormCard
  → .armBody → .armBox → #hd20ActionRegisterModal`임을 확인 — 폼 카드
  전체가 모달로 이동해 있었음(삭제된 게 아니라 정상적인 모달 전환).
- file: `action-register-modal.js`
  - `setup()` 소스를 읽어 `$('.armBody',modal).appendChild(card)`가
    이 이동을 수행하는 지점임을 특정.
  - CSS에 `.amGrid.hd20AmGridSingle{grid-template-columns:1fr!important}`
    추가, 카드 이동 직후 `root.querySelector('.amGrid')`에 이 클래스
    부여 — **1차 시도**.
  - 검증 결과 `check_grid_css.py`로 클래스는 정상 부여됐으나
    computed `gridTemplateColumns`가 여전히 `'540.359px 881.641px'`
    (2열)로 안 바뀜을 확인 → `grep`으로 `workflow-area-density.css`에
    `#awAction>.amGrid{grid-template-columns:minmax(360px,.76fr)
    minmax(0,1.24fr)!important}`(ID 셀렉터 포함, 명시도 1-1-0)가 있어
    내 규칙(클래스만, 명시도 0-2-0)보다 우선함을 특정.
  - **2차 수정(최종)**: 셀렉터를 `#awAction>.amGrid.hd20AmGridSingle
    {grid-template-columns:1fr!important}`로 변경해 ID 포함, 명시도
    1-2-0으로 기존 규칙(1-1-0)을 확실히 상회하도록 함.
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium):
  - 데스크톱(1792px): `check_grid_css.py` 재실행 →
    `gridTemplateColumns:'1432px'`(전체 폭 단일 열) 확인. 스크린샷
    (`final_fixed.png`)으로 빈 공간 해소 육안 확인.
  - `test_modal_still_works.py`: "+ 개선요청 등록" 클릭 → 모달
    `classList.contains('on')` true, `#amDate`/`#amTeam` 정상 존재 —
    모달 자체 기능은 이번 수정으로 전혀 영향받지 않음을 확인.
  - 모바일(430px) 16개 탭 전체 재순회: 콘솔 오류 0건, scrollHeight
    전부 수정 전과 완전히 동일(이미 `@media(max-width:1100px)`에서
    1열 강제되어 있어 애초에 영향 없던 범위였음을 재확인).

### `e74dd3e` — fix: 활동관리 데스크톱 와이드 화면도 동일한 빈 여백 버그 수정
- 조사: `scan_wide_layout.py`로 ②③④⑤ 영역 14개 서브탭 전체를 1792px
  폭에서 자동 순회, `.awGrid/.amGrid/.awSplit/.pcGrid` 각각의 컨테이너
  폭과 마지막 자식 끝 위치를 비교해 100px 이상 차이나는 것을 자동
  플래그. 결과: "② 활동관리"의 "활동관리"·"실적분석"에서만
  `{'cls':'awGrid','containerW':1432,'containerRight':1612,
  'childCount':1,'lastChildRight':735}` 발견, 나머지 12개는 "없음".
- 원인: `activity-register-modal.js`의 `enhance()`가 조치목록
  (`action-register-modal.js`)과 동일한 패턴으로 등록 폼 카드를 모달로
  이동시키되 남은 그리드 구성을 미조정. `grep`으로 `workflow-area-
  density.css`에서 `#awActivity>.awGrid{grid-template-columns:minmax
  (360px,.78fr) minmax(0,1.22fr)!important}`(ID 포함, 명시도 1-1-0)를
  확인 — 조치목록 수정 때와 동일한 명시도 문제가 재발할 것을 예상하고
  처음부터 ID 포함 셀렉터로 작성.
- file: `activity-register-modal.js`
  - `@media(max-width:700px){...}` 블록 뒤에
    `#awActivity>.awGrid.hd20AwGridSingle{grid-template-columns:1fr!
    important}` 추가.
  - `enhance()`의 `overlay.querySelector('.awRegisterContent').append
    Child(formCard);formCard.classList.add('awRegisterFormCard');` 직후
    `grid.classList.add('hd20AwGridSingle');` 추가.
- file: `index.html`: 캐시 버전 갱신.
- verification (Chromium):
  - 데스크톱(1792px): `getComputedStyle(grid).gridTemplateColumns`가
    수정 전 2열 추정치 → 수정 후 `'1432px'`(전체 폭 단일 열) 확인.
  - `[data-aw="new"]`(+ 5S 신규등록) 클릭 → `#awRegisterModal`
    `classList.contains('on')` true, 폼 필드 정상 — 모달 기능 영향
    없음 확인.
  - `scroll_into_view_if_needed()`로 표 카드까지 스크롤 후 스크린샷 —
    일자/구분/생산팀/문제점/개선내용/상태 6개 컬럼이 전체 폭을 활용해
    여유 있게 표시됨을 확인.
  - 모바일(430px) 16개 탭 전체 재순회: 콘솔 오류 0건, scrollHeight
    전부 수정 전과 완전히 동일.

### `cf11419` — fix: remove duplicated intro/summary blocks on 후보 목록 and 활동관리 (2026-09-24 00:40, 소급 기록)
- 변경 파일(줄 수는 minified 단일행 기준): `activity-workflow.js`(+2/-2), `index.html`(+1/-1)
- 방법: 화면 스크린샷 + DOM 쿼리로 `#awWorkplace`와 `#awActivity`의 렌더링 순서를 확인하고, 상단 `#hd20OpsMetrics`/WORK PURPOSE와 값·문구가
  완전히 겹치는 블록만 제거(내용이 다른 것은 보존).
- `activity-workflow.js`
  - `renderWorkplace()` 템플릿(`#awWorkplace`): `<h2>③ 고도화·표준화</h2><p>…</p>` + `awCriteriaBanner` + "운영상태" 요약카드 삭제.
    남김: `고도화 후보 / 공식판정`(154행) 표, `조건 충족 × 적용범위`(3행) 표.
    `renderWorkplace()`가 `.awBadge`·`.awAuditLane b`를 갱신하는 코드는 요소가 없어도 `if(el)` 가드로 무해(확인).
  - `renderActivity()` 템플릿: "활동 실적·개선이력" 카드 내부 `.awKpis`(전체활동/완료확정/등록진행/고도화후보 4카드) 삭제.
    `renderActivity()`의 `[...].forEach((v,i)=>{if(ks[i])ks[i].textContent=v+'건'})`은 `ks` 빈 배열이어도 안전.
- `index.html`: 해당 스크립트 캐시 버전 갱신.
- 검증: 16개 탭 순회 콘솔 오류 0건, 기준 scrollHeight(모바일 430px) 기록 — 종합현황 3,023 / 활동관리 4,898 / 실적분석 3,396 /
  후보 목록 6,519 / 3조건 3,752 / 라인·작업장 3,541 / 확정·수평전개 3,432 / 대상 추출 6,755 / 실시·점검 7,179 / 6개월 5,912 /
  종료평가 6,259 / 조치 목록 7,478 / 처리기간 5,063 / 팀장 5,186 / 효과·재발 4,186.
- 정확한 diff는 `git show cf11419`.

### `c390ffe` — fix: 팀별 5S 유형 차트 중복 노출 제거 + 차트 겹침/잘림 수정 (2026-09-27 23:27)
- 변경 파일: `activity-dynamic-chart.js`(+2/-2), `hd20-subtabs.js`(+3/-0), `index.html`(+1/-1)
- 조사: `find_dup_chart.py`/`find_dup_chart2.py`로 활동관리의 차트성 요소(svg/canvas/`.adcCard`/`.trendBox`)를 열거하고, 탭 이동 6회+
  `hd20-kpi-source-updated` 이벤트 후에도 `.adcCard`가 1개(부모 `#awActivity`)임을 확인 → 중복은 "두 서브탭 공유"로 확정(사용자 스크린샷).
- `hd20-subtabs.js` `applyActivity(sub)` 끝에 추가:
  `show($('.adcCard',root),isAnalysis);` (isAnalysis=`sub==='analysis'`). 활동관리에서는 `hd20SubHidden`으로 숨김.
- `activity-dynamic-chart.js` (사용자 첨부 차트 스크린샷의 결함 수정)
  - 막대 높이: `height:${max?Math.max(v?3:0,v/max*215):0}px`(2곳) → `height:${v&&max?'max(3px,'+(v/max*100).toFixed(2)+'%)':'0px'}`.
  - 눈금 정렬: `.adcChart` padding `12px 12px 66px 44px`→`28px 12px 100px 44px`, `.adcY` `top:10px;bottom:66px`→`top:28px;bottom:100px`,
    `.adcChart` 높이 330→364px(모바일 300→334px).
  - 팀 이름: `transform:translateX(-50%) rotate(-42deg);transform-origin:top left` → `translateX(-100%) rotate(-42deg);transform-origin:100% 0`.
  - 열/막대: `repeat(16,minmax(42px,1fr));gap:7px;min-width:1160px` → `minmax(66px,1fr);gap:6px;min-width:1180px`, `.adcBar` 폭 7→9px, 막대 간격 2→1px,
    값 라벨 11.5→10.5px, `.adcTeamGrid .adcBar:nth-child(even) em{transform:translate(-50%,-15px)}`(짝수 막대 라벨 한 단계 위).
- `index.html`: `hd20-subtabs.js?v=20260924-chart-once-1`, `activity-dynamic-chart.js?v=20260924-chart-fix-1`.
- 검증: 활동관리 `.adcCard` 표시 0 / 실적분석 1 / 활동관리 재진입 0, 스크린샷으로 팀 이름 전부 표시·막대 비겹침, 16개 탭 콘솔 오류 0건.
  scrollHeight 활동관리 4,529→3,907, 실적분석 2,323→2,357, 나머지 동일. (회귀 스크립트 `final_regress14.py`)

### `876ad6a` — feat: hd-22 디자인 벤치마킹 (2026-09-27 23:38)
- 변경 파일: `hd20-subtabs.js`(+23/-1), `hd22-theme.css`(+90/-0), `index.html`(+1/-1)
- hd-22 분석: `hastom79-hue/hd-22`를 `--depth 1`로 clone → 로컬 서버로 렌더링 → 로그인 오버레이/블러를 화면 확인용으로만 제거해 캡처.
  구조(`.topbar`, `.category-tabs`, `.screen-tabs`, `.main .screen`), 토큰(`--navy:#14304C; --navy-2:#1E4468; --steel:#2C5F8A; --bg:#F4F6F8; --line:#DFE6EC`) 확인.
- `hd22-theme.css`(신규, 전체 `@media screen` — 인쇄 CSS와 충돌 없음)
  - 헤더: `.app>.top` 남색·`margin-left/right:0`(기존 -24px 음수 여백 해제)·버튼 반투명 테두리, `#openMaster` 강조.
  - 대메뉴: `.app>.beginnerNav` `display:flex`·알약 버튼·`small{display:none}`·활성 흰색, 활성 아이콘 색 `var(--h22-navy)`.
    업무 흐름 배너: `.app>.beginnerNav:not(:has(button[data-key="dashboard"].active))+.beginnerHint{display:none}`.
  - 하위 탭: `.app>.hd20Subnav` 칩(`.on` 남색).
  - 화면 안내: `.hd20PurposePanel` 2열 그리드, `.hd20RoleGrid/.hd20Role(.user/.admin)` 파랑/앰버 카드, `.hd20PurposeMore`(details), `.hd20Cta` 핵심 버튼.
  - 정리: `.awScreen>.hd20AreaHeader{display:none}`, `.awScreen>.awHero>div:first-child{display:none}`,
    `#awActivity>.awHero,#awAudit>.awHero,#awAction>.awHero`(ID 셀렉터로 기존 `!important` 그라디언트 우회), 히어로 안 중복 등록 버튼
    (`[data-aw="new"]`,`#hd20ActionRegisterBtn`) 숨김(클릭 연결 유지).
  - 지표: `.app:not(:has(.beginnerNav button[data-key="dashboard"].active)) #hd20OpsMetrics …` (대시보드 제외; 대시보드 지표 66px 유지 확인).
  - 900px 이하: 역할 카드 1열, 액션 가로 배치.
- `hd20-subtabs.js`
  - `const ROLES={…}` 14개 키(activity.manage/analysis, advancement.judge/analysis/detail/standard, audit.draw/inspect/ongoing/retention,
    action.manage/leadtime/master/verify)별 `user`/`admin` 문구, `cta`는 activity.manage(`sel:'[data-aw="new"]'`),
    action.manage(`sel:'#hd20ActionRegisterBtn'`), audit.draw(`text:'대상 일괄추출'`).
  - `runCta(c)`: `.awScreen.on` 안에서 선택자/텍스트로 버튼을 찾아 `scrollIntoView`+`click()`(숨겨진 버튼도 동작).
  - `renderPurpose()` 템플릿 개편(사용자/관리자 카드, `<details class="hd20PurposeMore">`에 기존 `.hd20PurposeLogic`·`.hd20FeatureChips` 보존).
  - **실수 후 제거**: audit.inspect에 `cta:{text:'Audit 실시결과 등록'}`를 넣었다가, 그 버튼이 폼 **저장** 버튼이어서 클릭 즉시
    `중형하부팀 Audit 실시결과가 등록되었습니다.`가 발생(`test_cta.py`로 발견) → 해당 cta 제거 후 재검증(`실시입력 CTA no cta`, 다이얼로그 없음).
- `index.html`: `<link rel="stylesheet" href="hd22-theme.css?v=20260928-h22-3">`(print-styles.css 앞), `hd20-subtabs.js?v=20260928-h22-2`.
- 검증: 회귀(`final_regress15.py`, 대상 폴더 `repo20`) 16개 탭 오류 0건. **첫 회귀는 예전 폴더(site18)를 가리켜 무효** → 폴더 수정 후 재실행.
  데스크톱(1440)·모바일(430) 스크린샷, CTA 클릭 시 `#awRegisterModal`/`#hd20ActionRegisterModal` `.on` 확인.

### `dc2c7c2` — fix: 대시보드 하위 탭 위치 고정 + 섹션 전환 지연 해소 (2026-09-28 00:10)
- 변경 파일: `dashboard-section-tabs.js`(+2/-2), `final-layout-polish.js`(+1/-1), `index.html`(+1/-1), `mo-throttle.js`(+23/-0)
- 측정 스크립트: `probe_tabpos.py`(섹션 순회하며 `#hd20DashboardSectionTabs` 문서 위치·scrollY·바 위 요소 높이), `probe_tabpos2.py`(수정 후 검증).
- `dashboard-section-tabs.js`
  - `ensure()`: `anchor.insertAdjacentElement('beforebegin',root)`(anchor=`#hd20DashboardPriority`/`.cards`) →
    `const fixed=document.querySelector('.beginnerHint'); if(fixed) fixed.insertAdjacentElement('afterend',root); else anchor…('beforebegin')`.
  - `apply()`: `requestAnimationFrame(()=>root.scrollIntoView({block:'start'}))` →
    `const top=root.getBoundingClientRect().top+window.scrollY; if(window.scrollY>top+2) window.scrollTo(0,top)`.
- `final-layout-polish.js`: `dashboard-section-tabs.js?v=20260928-tabpos-1`.
- 성능 조사 과정(수정 파일 아님, 방법 기록)
  - 1차 관찰: 고도화 맵 방문 후 `기준·추이` 클릭 처리 5.6초(evaluate 기준). `Profiler`로는 JS가 짧게 잡혀 오판 → `requestAnimationFrame` 2회를 기다리는 방식으로 재측정 →
    종합현황 13.9초/기준·추이 29.6초, 테마 전 빌드(site18)도 동일(13.91/29.56초).
  - `Performance.getMetrics`: `LayoutDuration 0.05` / `RecalcStyleDuration 0.28` / `ScriptDuration 13.52` / `TaskDuration 13.95`.
  - 프로파일러·추가 observer를 붙이면 더 느려져 시간 초과 → `MutationObserver` 생성자를 래핑해 생성 스택(파일:줄)별 호출 수·소요 시간을 집계(`moprof.py`).
    상위: `team-leader-excel-import.js:1:9398` 5,285ms/호출 1,002, `audit-id-integrity-guard.js:18` 1,895ms/1,479, `dashboard-subnav-single-owner-guard.js:6` 1,893ms/739,
    `action-effect-recurrence-integrity.js:22` 1,763ms/1,479, `gmes-5s-judge-flow-polish.js:19` 521ms, `table-enhance-suite.js:44` 444ms/526,
    `audit-taxonomy-guard.js:8` 418ms, `hd20-maturity-map-priority-filter-guard.js:19` 265ms, `activity-seoul-date-guard.js:5` 258ms, `hd20-maturity-id-integrity-guard.js:14` 150ms.
    변경 기록 179,447건. 변경 대상 표본(6,000건): `TR.teHidden class` 3,869, `DIV.mmtCase data-mmt-filter-hidden` 399 등(표 행 클래스 재기록 → 연쇄).
- `mo-throttle.js`(신규, index.html에서 `<meta name="viewport">` 직후·모든 스크립트보다 앞)
  - `window.MutationObserver`를 래핑. `observe()` 대상이 `document.body|documentElement|document`이면 broad 처리 → 콜백을 80ms 타이머로 묶어 records 병합(최대 4,000건 유지),
    아니면 원본처럼 즉시 실행. `takeRecords()/disconnect()`도 대응. `T.prototype=Orig.prototype`로 `instanceof` 유지.
  - 결과: 벽시계 0.5초(ScriptDuration 0.47) — 조건에 따라 종합현황 0.5~1.17초, 기준·추이 0.61초로 측정.
- 검증: 하위 탭 바 문서 위치 데스크톱 258px·모바일 409px(전 섹션 동일, 순회 11회), 16개 탭 오류 0건,
  `new_test_e2e_register.py`(960→961), `new_test_e2e_action.py`(640→641), `new_test_master_modal2.py`(순서 저장 `gmes5s_team_display_order`), `new_test_cta.py`,
  `test_after_throttle.py`(검색 400→92건, `5S_운영실적_업로드양식.csv`, `HD20_activity_manage_2026-09-28.csv`).
  (5S 등록·개선요청 시험은 접속 주소 미치환으로 첫 실행이 ERR_CONNECTION_REFUSED → 주소 수정 후 재실행.)

### `62d520b` — feat: 고도화 작업장 추이 누적 막대 1차 (2026-09-28 00:30)
- 변경 파일: `dashboard-actions.js`(+15/-1), `index.html`(+1/-1)
- 이 차트를 그리는 코드는 `dashboard-actions.js`뿐(`grep trendBox`: dashboard-actions.js / dashboard-section-tabs.js / hd20-five-area-integration.js — 뒤 둘은 표시 제어).
- `dashboard-kpi-source.js`의 `snapshot()`에서 `confirmed`/`maintained`/`newSecured`/`year` 확인, `isMaintained(x)`=확정 && 상태 문자열에 중지|부적합|해제|실패 없음 && `valid!==false`.
- `monthData()`: base=연도 이전 확정 수(6), `existing[i]`=base+전월까지 신규, `cum`, `lastMonth`(올해=현재 월). `renderTrend()`: 12열 스택 막대(연한색 `#9db8cc` 기존 / 진한색 `#1680ad` 신규),
  막대 높이 `H`(124→140px)·구간 숫자 표시 기준 높이 13→11px 조정, 요약/범례, 미래 월 "-". `monthly()`: 월/기존 유지/신규/누적 확보 표.
- `index.html`: `dashboard-actions.js`가 **버전 없이** 로드되던 것을 `?v=20260928-stackbar-1`로 변경.
- 검증: 툴팁 값 8→16→21→29→33→36→40→48→57, 데스크톱/모바일 스크린샷, `월별 상세보기` 표, 16개 탭 오류 0건. → 이탈 미반영 계산 오류(다음 커밋).

### `55f4705` — fix: 유지 이탈을 반영한 누적 막대 재계산 (2026-09-28 00:37)
- 변경 파일: `dashboard-actions.js`(+20/-14), `index.html`(+1/-1)
- 데이터 조사(`kpi_probe.py`, `maint_probe.py`): `confirmed` 57(2025: 2025-02 3·05 2·07 1 = 6, 2026: 51), `maintained` 47, `maintainState|valid` = 정상|true 47 / 중지|false 7 / 미흡|false 3,
  `maintainedInNew` 42. `maintainState`를 쓰는 곳: `demo-seed-data.js`, `web-validation-fixture.js`(`weak=chance(.15)`)뿐, 나머지 파일은 읽기 전용. 이탈 날짜 필드 없음.
- 사용자 선택(ask_user_input): "6개월 종료평가 시점(확정일+6개월)으로 추정해 반영하고, 추정임을 화면에 표시".
- `monthData()` 재작성: 행별 `{c:확정월idx, l:이탈월idx|null}`. 비유지 행의 이탈일 = `maintainLostAt||maintainEndedAt||maintainStoppedAt||lostAt||invalidatedAt`(있으면 `rec++`),
  없으면 확정일+6개월(`est++`), 현재 월 초과 시 현재로 clamp. 월 m: `existing`=확정월<m && !(이탈월≤m), `added`=확정월==m && !(이탈월≤m), `cum`=합, `lostIn`=이탈월==m,
  `base`=연도 이전 확정 수, 반환에 `maintained/confirmedAll/lostAll/est/rec` 포함.
- `renderTrend()`: 요약 "누적 확보 {confirmedAll} − 유지 이탈 {lostAll} · 현재 유지 {maintained}곳", 막대 아래 `▼당월 이탈`, 범례 추가, 추정 안내문(`est>0`),
  안내문에 "6개월이 지나지 않은 건은 이번 달 이탈로 반영" 명시. `monthly()`: 월/기존 유지/신규/유지 합계/당월 이탈 + 추정 주석.
- 결과 값: 유지 합계 7→15→20→28→32→35→39→45→47, 당월 이탈 8월 2·9월 7, 연초 base 6→5(2025-11 이탈 1). 9월 47 = `maintained.length`.
- `index.html`: `dashboard-actions.js?v=20260928-stackbar-3`.
- 검증: 16개 탭 오류 0건(`final_regress15.py`), 데스크톱/모바일 스크린샷, 상세 표 수치 확인(`test_trend.py`).

### `e182f66` — fix: 옆 카드 높이에 맞춰 늘어나 생기던 불필요한 빈 공간 제거 (2026-09-28)
- 변경 파일: `dashboard-section-tabs.js`(+1/-1), `final-layout-polish.js`(+1/-1), `hd22-theme.css`(+7/-0), `index.html`(+1/-1)
- 검출 스크립트 `scan_blank.py`: 화면별로 `.card/.awCard/.amCard/.pcPanel/.adcCard`(높이 150px↑, 폭 200px↑)의 마지막 콘텐츠 요소 하단과 카드 하단의 차이가 120px를 넘는 항목을 출력.
  대시보드 6개 섹션 + 14개 서브탭(1440px) 스캔 → `③/후보 목록`의 `5S 고도화 3대 조건`(h 875, gap 679)만 검출, 판정 기준 카드는 별도 `probe_blank.py`로 측정
  (1440px: 판정 기준 카드 내용 220px vs 카드 490px, 추이 카드 490px). `.bottomGrid` `align-items:stretch`, `.pcGrid` `align-items:normal(stretch)`가 원인.
- `dashboard-section-tabs.js`(주입 CSS에 추가): `@media(min-width:1101px){body.hd20DashboardStandardActive .bottomGrid .card:has(.criteria){display:flex!important;flex-direction:column}
  body.hd20DashboardStandardActive .bottomGrid .card:has(.criteria)>.cardBody{flex:1;display:flex;flex-direction:column}
  body.hd20DashboardStandardActive .bottomGrid .criteria{grid-template-columns:1fr!important;grid-auto-rows:1fr;flex:1}
  body.hd20DashboardStandardActive .bottomGrid .crit{align-items:center!important}}` — 기존 `repeat(3,minmax(0,1fr))!important` 규칙과 같은 명시도라 뒤에 오는 미디어 규칙이 이김.
- `hd22-theme.css`(7번 섹션 신설): `@media(min-width:1101px){.pcGrid{align-items:start!important} .pcGrid>.pcPanel:last-child{position:sticky;top:84px}}`.
  처음 `top:12px`로 두었다가 고정 메뉴 바(`.beginnerNav` sticky)에 가려져 `top:84px`로 수정.
- 캐시 버전: `dashboard-section-tabs.js?v=20260928-blank-1`(`final-layout-polish.js`), `hd22-theme.css?v=20260928-h22-4`(`index.html`).
- 검증: 판정 기준 카드 내용 474/490px(1440·1900px), `.pcGrid` 오른쪽 패널 875→218px, 1100px 이하는 미변경, 16개 탭 회귀(`final_regress16.py`) 오류 0건.
  ③ 탭 모바일 높이 후보 목록 6,108→6,290 / 3조건 3,364→3,545 / 라인 3,154→3,335 / 확정 2,993→3,174(+181px, 추이 차트 개편 영향).
  종료평가 13,534px는 기존 간헐 현상(`probe_closeeval.py`: 새로 불러오면 6/6회 3,705px, 직전 빌드 4,160px).

### `08cd94d` — feat: 대시보드 탭 정리 - 성과·운영분석을 월별 추이로 재정의, 현장참고 메뉴 숨김 (2026-09-28)
- 변경 파일: `ci-tab-keys.patch`(+39/-0), `dashboard-kpi-source.js`(+29/-1), `dashboard-ops-trend.js`(+62/-0), `dashboard-section-tabs.js`(+5/-4), `final-layout-polish.js`(+1/-1), `index.html`(+1/-1)
- 조사: `sec_cmp.py`로 섹션별 표시 블록 높이 비교 → 6번 = `#hd20DashboardPriority`(394)+`#hd20OperationalBridge`(188)+`.bottomGrid`(506). 5번 = `#hd20FieldShowcaseBootstrap`(321, 샘플 6건+외부 사진).
- `dashboard-kpi-source.js`: `monthlyOperational(n=6)` 추가(`window.HD20KPIData`에 노출, 기존 `operational()` 미변경). 월별 값+표본 수: 판정완료율(등록월 기준, 판정 범위 대비), 평균 Lead Time(판정월 기준),
  고도화 수준(확정월 기준 평균 Level), 6개월 유지율(Audit 종료월=auditDate+6개월 기준, `sixMonthRetention()`과 동일한 통과 조건), 재발률(조치 완료·효과검증 건 중 재발, 완료월 기준), 기한 내 완료율(완료월 기준).
  9월 예: 판정완료율 57.9(n=19)·Lead Time 8.2일(n=13)·수준 3.6(n=9)·유지율 34.4(n=32)·재발률 27.8(n=36)·기한 내 완료율 65.8(n=76).
- `dashboard-ops-trend.js`(신규): `#hd20OpsTrend` 6카드(현재값·전월 대비 ▲▼ 개선/악화 색·6개월 막대·월/표본 수·전체 누적값·원인 확인 → `HD20_NAV.go(route)`), 악화 지표 수 요약.
  삽입 위치 `#hd20DashboardPriority` 뒤, 삽입 후 `HD20_DASHBOARD_TABS.apply(active,{scroll:false})`. `HD20KPIData` 준비 전 렌더로 빈 화면(38px)이던 것을 `ensure()`에서 준비 여부 확인 후 재시도(150ms×80)로 수정,
  분석 탭 클릭 시 재렌더.
- `dashboard-section-tabs.js`: TABS 재정의 — analysis targets `['#hd20OpsTrend']`, field `hidden:true`, 버튼은 `TABS.filter(x=>!x.hidden)`로 번호 1~5. `final-layout-polish.js` 버전 `20260928-tabs5-1`.
- `index.html`: `dashboard-ops-trend.js?v=20260928-3`, `dashboard-kpi-source.js?v=20260928-monthly-1` 추가/갱신.
- CI(`.github/workflows`)는 push 불가(토큰에 `workflow` 권한 없음)라 `ci-tab-keys.patch`로 보관: `current-ia-smoke.yml`·`subtab-contract-grid-smoke.yml`·`browser-smoke.yml`의
  `['summary','execution','maturity','standard','field']` → `[...,'analysis']`(각 1줄, 총 39줄 패치). `dashboard-canonical-smoke`·`current-ia-smoke`의 `apply('field')` 격리 검사는 hidden 탭에도 유지되어 그대로 통과 예상.
- 검증: 탭 버튼 5개, 섹션별 표시 격리(execution/maturity/standard/analysis/field/summary) 확인, CI 기대 키 목록 일치 확인(`reg_dash.py`).

### `b76f198` — fix: 성과·운영분석 추이 영역 유출 수정 (2026-09-28)
- 변경 파일: `dashboard-ops-trend.js`(+1/-0), `index.html`(+1/-1)
- 재현: 대시보드 '성과·운영분석' 클릭 → ② 활동관리 이동 시 `.app` 자식에 `hd20OpsTrend:2314`(모바일) 표시(`leak_check3.py`). 방문 순서 없는 직접 진입은 재현 안 됨(`leak_check.py` 3,472px).
- 수정: 스타일에 `.app.awFocused #hd20OpsTrend{display:none!important}` 추가, `dashboard-ops-trend.js?v=20260928-3`. 회귀 기준치 복귀(활동관리 3,472 등).

### `40a0d33` — feat: 3조건 분석 라인·작업장 목록 재구성 (2026-09-28)
- 변경 파일: `hd20-condition-groups.js`(+61/-0), `hd20-subtabs.js`(+2/-1), `index.html`(+1/-1)
- `hd20-condition-groups.js`: `#hd20ConditionGroups`를 `#hd20MaturityConditionAnalysis` 앞에 삽입. `window.HD20MaturityConditionAnalysis.summary()`의 `one/two/three` 행(`_unit`{team,line,workplace}, `_criteria.values[3]`, `_judge`)을 작업장 키(`팀|라인|작업장`)로 중복 제거·정렬.
  비율 막대(flex 비율, 15% 미만 구간은 % 만 표시), 그룹 헤더(작업장 수·라인 수·전체 대비 %), "부족한 조건" 칩(1·2개 그룹), 표(생산팀·라인·작업장·①②③ 충족/미충족·공식판정), 8행 초과분은 `<tbody class="cgRest" hidden>` + "나머지 N곳 더 보기".
  표시 조건: `#performanceConversionAnalysis[data-subview="analysis"] #hd20ConditionGroups{display:block}`.
- 이 탭 전용 숨김 CSS: `.app[data-hd-view="advancement.analysis"] #hd20OpsMetrics`, `#performanceConversionAnalysis[data-subview="analysis|detail"]>.pcHeader`, `[data-subview="analysis"] .pcGrid`, `… #hd20MaturityConditionAnalysis .mcaLevelRail,.mcaBodyGrid`.
- `hd20-subtabs.js` `apply(area,sub)` 첫 줄: `document.querySelector('.app')?.setAttribute('data-hd-view',area+'.'+sub)`(CSS 훅).
- 모바일: `#hd20ConditionGroups tbody[hidden]{display:none!important}` 추가(카드형 표 스타일이 `[hidden]`을 덮어 183행 전개 → 영역 39,866px→5,540px). 배지에 ①②③, 팀·라인·작업장 한 줄, 배지 인라인.
- 결과 수치(시험 데이터): 1개 23곳(13%, 라인 20)/2개 19곳(10%, 라인 20)/3개 141곳(77%, 라인 48), 조건 확인 작업장 183곳, 부족한 조건 예: ①·③ 각 17곳, ② 12곳(1개 그룹).
- 검증: 데스크톱/모바일 스크린샷, 그룹 행 수 23/19/141, 16개 탭 회귀 오류 0건.

### `955d40f` — feat: 효율 병기(인당·비율 보조값) + 팀별 차트 인당 순위 (2026-09-28)
- 변경 파일: `activity-dynamic-chart.js`(+34/-2), `hd20-ops-normalized.js`(+34/-0), `index.html`(+1/-1)
- `hd20-ops-normalized.js`(신규): `#hd20OpsMetrics[data-contract]`별 규칙표 `R`(14개 화면). 각 버튼의 `<b>` 숫자를 읽어 `v[]`로 만들고 `pc(a,b)`/`f2`/`f1` 계산 → `<span class="opsSub">` 병기. 인당 분모 `HD20KPIData.headcount(rows)`(=680, 마스터 합계).
  갱신: `setInterval(700ms)`+이벤트, 값이 같으면 DOM을 쓰지 않아 깜빡임·재생성 0회(시간 샘플링으로 확인). 제외 규칙: 라인당 평균, 최근 7일 실시 %(의미 모호).
  주요 규칙: activity.manage(인당·완료율·진행 비중·고도화 전환율), action.manage(인당·전체의 %·완료율·진행 중 기한경과 %), advancement.judge(후보 대비·확정률·3조건 충족률), advancement.standard(유지율·미흡률·수평전개율),
  audit.draw(실시 대기·실시율·부적합률), audit.ongoing/retention, action.leadtime(지연/조기/정시 비중), action.master(등록·지정·미지정률), action.verify(검증률·대기·재발률).
- `activity-dynamic-chart.js` `render()` 팀 비교 분기 교체: `HD20_HEADCOUNT_MASTER`([{team,headcount}] 16팀)로 팀별 인당 계산, 내림차순, 전체 평균 기준선(`u` 요소), 평균 미만 `.low`, 토글 `window.__adcMode`(per|total),
  5S 유형 선택 시 해당 유형만. 팀 선택(else) 분기는 `adcRankMode` 해제 후 기존 6개월 추이. 스타일은 `#adcRankStyle`로 주입. 부제 문구 변경.
  결함: 행의 막대 클래스를 `.bar`로 썼다가 전역 `.bar`(폭 12px 고정)와 충돌 → `.hbar`로 변경, `.adcChart` 눈금 배경 `background:none`(랭크 모드).
- 결과(시험 데이터): 전체 평균 1.41건/인(960건÷680명), 1위 대형Att.팀 3.00건/인(60건·20명) … 16위 트러블슈팅팀 0.92건/인(60건·65명). 시험 데이터가 팀당 60건으로 균일해 인원 차이만 반영.
- 버전: `hd20-ops-normalized.js?v=20260928-2`, `activity-dynamic-chart.js?v=20260928-rank-2`, `hd20-condition-groups.js?v=20260928-5`.
- 검증: 14개 화면 보조값 출력 확인, 16개 탭 회귀 오류 0건(활동관리 3,530 / 조치 목록 6,420 등).

### `a45a372` — ui: 첫인상 정리 (2026-09-28)
- 변경 파일: `hd22-theme.css`(+14/-0), `index.html`(+1/-1)
- `#hd20ValidationBanner`(인라인 스타일 노란 배너) → `hd22-theme.css`에서 `!important`로 차분한 색·작은 글자, `.hd20DbProdHealth`(상태 표시 버튼) → 투명 배경+점(::before), `.hd20HealthGroupGrid`·`.hd20HealthKpi` 1열 목록형, `.hd20HealthKpiBody b{white-space:nowrap}`.
- `hd22-theme.css?v=20260928-h22-5`. 회귀 16개 탭 오류 0건.

### `96a7f6f` — perf: 표 행 가상화 + 썸네일 지연 로딩 (2026-09-28)
- 변경 파일: `action-field-photo-gallery.js`(+1/-1), `index.html`(+1/-1), `table-enhance-suite.js`(+19/-6), `workflow-crud.js`(+1/-1)
- 조사: `dom_why.py` — 첫 로드 시 `#awAction` 16,907·`.amCases` 8,970·`.hd20Lt` 7,703 요소, 표 행 2,471(숨김 2,046), 이미지 649·`loading=lazy` 2. `lazy_measure.py`로 전/후 기준값(DOM·행·이미지·내보내기 CSV 행 수·`.teCount`) 측정.
- `table-enhance-suite.js`: 상수 `VMIN=60`. `enhanceTable`에 `store/mo/noVirtual`(`.gmesImport,.hd20CaseTrace,.hd20ExactTable,[id$="Modal"],.modalBox` 제외) 추가, `domRows()/allRows()/updateMore()` 분리.
  `apply()`: 행이 60개 초과면 `store=rows.slice(); table.__teStore=store`, 검색 일치 행(`tr.__teT` 캐시)에서 `pageSize`만큼 `tbody.replaceChildren(...shown)`, 카운트 문구·"더 보기" 갱신, `mo.takeRecords()`로 자기 변경 기록 제거.
  정렬: 가상화 중에는 `store`만 정렬하고 전체 재부착 금지(`if(!store)rows.forEach(...)`). MutationObserver: 외부 재렌더 시 새 행이 전부 새것이면 `store=null`(재캡처), 일부만이면 병합·제거 반영. 공용 `window.HD20_TABLE_ROWS.all(table)`.
- `workflow-crud.js` `csv(screen)`: `(window.HD20_TABLE_ROWS?.all(table)||[...table.querySelectorAll('tbody tr')])`로 전체 행 내보내기 유지.
- `action-field-photo-gallery.js` `evidenceCell()`: `img.loading='lazy';img.decoding='async'`를 `src` 지정 전에 설정(640행 썸네일 즉시 요청 방지).
- 버전: `table-enhance-suite.js?v=20260928-virt-1`, `workflow-crud.js?v=20260928-virt-1`, `action-field-photo-gallery.js?v=20260928-lazy-1`.
- 결과: DOM 32,171→8,206, 행 2,471→425, 이미지 649→34, CSV 행 수 402/540/414/1,304 동일. E2E: 5S 등록 960→961, 개선요청 임시저장 640→641, 통합기준정보 저장, 핵심 버튼, 검색 92건, 더 보기 25→50→75, 16개 탭 오류 0건.
- 비교 검증(`sort_cmp.py`): 헤더 클릭 정렬은 변경 전 원본(`repo22_base`)에서도 상위 행이 바뀌지 않음 → 기존 동작.

### `faf554e` — feat: 5S 자율개선 종합 대시보드 (2026-09-28)
- 변경 파일: `ci-tab-keys.patch`(+6/-6), `dashboard-section-tabs.js`(+1/-0), `final-layout-polish.js`(+1/-1), `hd20-improve-board.js`(+118/-0), `index.html`(+1/-1)
- `hd20-improve-board.js`(신규): `#hd20ImproveBoard`(`#hd20DashboardPriority` 뒤 삽입). 상태 `S={year,month,metric,group,type,roll,team}`. 데이터 `HD20KPIData.snapshot().rows`(연도·월·유형·부서·수평전개 필터), 팀 인원 `HD20_HEADCOUNT_MASTER`, 부서 `HD20ProductionTeamMaster.groupOf/groupNames`.
  `chart()` SVG 막대 함수(그룹/누적, 축 `axis()` 눈금 1·2·2.5·5, 값 라벨, 좁은 폭 자동 회전, `data-cat` 클릭). 완료 = 상태 `완료|확정`(활동관리 카드 '완료/확정 658'과 동일 정의).
  ③ 팀 패널: 정렬(내림차순), 평균 이상 `#1f6f6b`/미만 `#e0b03c`, 당월 참여율=`Set(owner).size / 총원`. ④⑤: 선택 팀 월별(인당 또는 총 건수). 프린트=`window.print()`, 엑셀다운로드=CSV(`5S_자율개선종합_YYYY[MM].csv`, BOM 포함, 유형별·팀별·단일 팀 월별 3개 표).
  `.app.awFocused #hd20ImproveBoard{display:none!important}`, resize 250ms 디바운스 재렌더, 탭 클릭 시 재렌더.
- `dashboard-section-tabs.js`: TABS에 `{key:'improve',label:'5S 자율개선 종합',targets:['#hd20ImproveBoard']}`를 summary 다음에 추가. `final-layout-polish.js` 버전 `20260928-improve-1`, `index.html`에 `hd20-improve-board.js?v=20260928-3`.
- `ci-tab-keys.patch` 재생성(40줄, `git apply --check` 통과): 3개 워크플로의 탭 키 기대값을 `['summary','improve','execution','maturity','standard','analysis']`로.
- 검증(`ib_interact.py`): 초기 선택 팀 대형Att.팀→6번째 막대 클릭 시 중형상부1팀, 월=9월 참여율 패널, 차트집계=총 건수 전환, 유형=정리, 부서 선택 시 팀 막대 6개, CSV 35행, 프린트 호출. 섹션 격리(`reg_dash2.py`) 7개 섹션 통과, 16개 탭 회귀 오류 0건.

### `9d5f65a` — feat: 5S 개선요청 종합 대시보드 (2026-09-28)
- 변경 파일: `ci-tab-keys.patch`(+6/-6), `dashboard-kpi-source.js`(+1/-1), `dashboard-section-tabs.js`(+1/-0), `final-layout-polish.js`(+1/-1), `hd20-improve-board.js`(+6/-4), `hd20-request-board.js`(+81/-0), `index.html`(+1/-1)
- `hd20-request-board.js`(신규): `#hd20RequestBoard`(`#hd20ImproveBoard` 뒤 삽입). 상태 `S={year,month,metric,group,status,src,team}`. `prep()`: `HD20KPIData.actionCases()` → `{reg,due,dn,done,status,overdue,late,ontime,verified,audit,days}`
  (`overdue=!done&&due<seoulDateKey()`, `ontime=done&&doneDate<=due`, `audit=!!auditDrawId`, `days=doneDate-reg`). 패널: ① 처리 단계별(등록 합계/조치대기/진행중/기한경과/완료/효과검증 완료, `colorOf`),
  ② 월별(등록=등록월, 완료=완료월, 기한경과=기한 도래월·미완료), ③ 팀별 누적 막대(완료·진행·대기·기한경과, 인당은 팀 인원으로 나눔, 정렬 내림차순, `.hit` 클릭 선택),
  ④ 선택 팀 월별 등록·완료, ⑤ 선택 팀 월별 평균 처리일수(`fmt:v=>v.toFixed(1)`). CSV: `5S_개선요청종합_YYYY[MM].csv`(처리 단계별·팀별·단일 팀 월별). 스타일은 `#hd20ImproveBoardStyle` 텍스트를 ID 치환해 재사용.
  `.app.awFocused #hd20RequestBoard` 숨김은 복제 스타일에 포함, resize 250ms 재렌더, 탭 클릭 시 재렌더.
- `dashboard-kpi-source.js`: `window.HD20KPIData`에 `actionCases` 읽기 전용 노출(`seoulDateKey`는 기존 노출). `?v=20260928-monthly-2`.
- `hd20-improve-board.js`: `window.HD20_BOARD_KIT={chart,leg,esc,fx,C,axis}` 노출, `chart({...,fmt})` 옵션(`F=v=>fmt?fmt(v):fx(v,per)`), `?v=20260928-5`.
- `dashboard-section-tabs.js`: `{key:'request',label:'5S 개선요청 종합',targets:['#hd20RequestBoard']}`를 improve 다음에 추가(`?v=20260928-request-1`), `index.html`에 `hd20-request-board.js?v=20260928-2`.
- `ci-tab-keys.patch` 재생성(40줄, `git apply --check` 통과): 탭 키 `['summary','improve','request','execution','maturity','standard','analysis']`.
- 검증(`rb_check.py`): 기한경과 정의 검증(79=66+13), 팀 막대 클릭(휠로더리어팀→대형Att.팀), 년=2025(완료율 48.1%·기한경과 13), 월=9월(64.9%·12), 인당 모드, 처리상태·등록경로 필터, CSV 41행.
  섹션 격리(`reg_dash3.py`) 8개 통과, 16개 탭 회귀 오류 0건.

### `dd8f90d` — feat: 종합 대시보드 근거 데이터 보기 + 분기별 인당 목표선 (2026-09-28)
- 변경 파일: `hd20-improve-board.js`(+38/-11), `hd20-request-board.js`(+9/-6), `index.html`(+1/-1)
- `hd20-improve-board.js`: `chart({...,hline})` 옵션(축 최대값 `max(tot, hline.value*1.05)`, 빨간 점선 `stroke-dasharray="6 4"`+라벨). `quarterTarget()`: `localStorage['gmes5s_quarter_perperson_targets']`의 현재 분기(`Q1~Q4`) 값(양수만).
  `openRows({title,cols,rows,file})`: `#hd20BoardEvidence`(z-index 99991) 공용 창 — 검색(전체 컬럼)·CSV(BOM)·Esc/배경 클릭 닫기, 200건 표시 후 300건씩 더 보기, `@media print` 숨김. `window.HD20_BOARD_KIT`에 `quarterTarget,openRows` 추가.
  자율개선 ③ 팀 차트: `useT=per&&!S.month&&QT.v!==null` 일 때 목표선·`colorOf`(≥목표 진한색/미만 황색)·"목표 달성 n/N팀" 범례, 아니면 기존 평균 기준+안내 문구. 5개 패널 머리글에 `.ibEv[data-evk=a..e]` 버튼, `EV` 맵으로 패널별 원천 행 연결(팀별=팀·최신순 정렬, 선택 팀=`tr`).
  `?v=20260928-6`.
- `hd20-request-board.js`: 5개 패널 근거 버튼, 열 12개(요청번호·등록일·팀·작업장·문제점·상태·조치기한·완료일·처리일수·기한경과·효과검증·Audit 연계). `?v=20260928-3`.
- 검증(`ev_check.py`): 저장된 목표 `{"Q1":2,"Q2":3,"Q3":4,"Q4":5}`, 인당 모드 목표선 존재·"목표 달성 0/16팀 · 전체 평균 1.28건/인", 근거창 868건(200행 표시)·검색(정리 219건)·CSV 220행·Esc 닫힘, 월별 근거 868=기준 868, 개선요청 근거 563=기준 563. 섹션 격리·16개 탭 회귀 오류 0건.

### `1d22c89` — fix: 종합 대시보드 프린트 결과 개선 (2026-09-28)
- 변경 파일: `hd20-improve-board.js`(+7/-6), `hd20-request-board.js`(+6/-5), `index.html`(+1/-1)
- 재현(`print_board.py`→`print_board3.py`): `emulate_media('print')`+뷰포트 794/1123px. 수정 전 A4 세로 `svg_넘침 1`, 근거 버튼 표시. `@media print`: `.ibBar,.ibEv{display:none!important}`, `.ibBody{overflow:visible}`, `svg{width:100%!important;height:auto!important}`, `.ibPanel{break-inside:avoid}`, `.ibRow{grid-template-columns:1fr!important}`.
- 두 파일 `render()`: `W=window.__hd20BoardPrint?680:Math.max(320,clientWidth-36)`, 패널 폭 `w:(window.__hd20BoardPrint?W-8:Math.floor(W*.4)-8)` 등 5곳 치환. `beforeprint`에서 플래그 on+재렌더, `afterprint`에서 off+재렌더.
- 버전: `hd20-improve-board.js?v=20260928-8`, `hd20-request-board.js?v=20260928-4`.
- 검증(`print_board3.py`/`print_board4.py`): A4 세로·가로에서 넘침 0, 차트 폭 92~95%, 글자 크기 [11.1,11.1,9.4,11.1,11.1]px, 인쇄 후 차트 5개 복원·플래그 false. 16개 탭 회귀 오류 0건.

### `64d07c1` — feat: 자율개선 종합 Fool Proof 대체 지표(고도화 확정) + 고도화 판정 필터 (2026-09-28)
- 변경 파일: `hd20-improve-board.js`(+15/-13), `index.html`(+1/-1)
- `hd20-improve-board.js`: `S.judge` 추가, `JUDGES=['확정','판정대기','보완요청','후보','검토중','미확정']`. `cdOf(r)`=`HD20KPIData.confirmedDate(r)||confirmedAt||judgedAt||date`. `filt(D,{ignoreMonth,ignoreYear})`에 `ignoreYear`·`judge` 조건.
  ② 월별: `rowsC=filt(D,{ignoreYear:true,ignoreMonth:true}).filter(inTeams)`, `confM(a)`=확정일의 연도가 `S.year`이고 `judgeState==='확정'`인 건을 확정월별로(인당 모드는 총원으로 나눔). 시리즈 '고도화 후보 건수'→'고도화 확정 건수'.
  ⑤: 시리즈 '고도화 후보'→'고도화 확정'(선택 팀·확정일 기준), 제목 '수평전개/고도화 확정'. 조회 바 `<select data-f="judge">`. 근거 열 `['등록일','팀','5S 유형','등록자','문제점','개선내용','상태','고도화 판정','확정일','수평전개']`. `?v=20260928-9`.
- 검증(`factor_check2.py`): 월별 확정 툴팁 합 51·`snapshot().newSecured` 51·확정 판정(2026) 51, 판정 필터 근거 건수 확정 51/판정대기 31/보완요청 30, ⑤ 제목·근거 열 확인, 16개 탭 회귀 오류 0건.

### `89ef6a8` — feat: 고도화 성과는 확정 결과만 표시 (2026-09-28)
- 변경 파일: `conversion-chart.js`(+2/-2), `dashboard-actions.js`(+1/-1), `dashboard-grid-drilldown.js`(+1/-1), `dashboard-ops-trend.js`(+1/-1), `final-layout-polish.js`(+1/-1), `hd20-improve-board.js`(+2/-2), `hd20-kpi-evidence-drill.js`(+3/-3), `hd20-maturity-map-tab.js`(+3/-3), `hd20-ops-normalized.js`(+3/-3), `hd20-ops-v2.js`(+3/-3), `index.html`(+1/-1), `integrated-performance-map.js`(+2/-2), `top-kpi-drilldown.js`(+3/-2)
- 조사: `cand_scan.py` — 화면별로 보이는 텍스트 노드에서 '후보'를 수집(숫자 동반), 그 뒤 원인 코드 파일 특정(`dashboard-grid-drilldown.js`, `integrated-performance-map.js`, `hd20-maturity-map-tab.js`, `performance-conversion-analysis.js`, `hd20-kpi-evidence-drill.js`, `hd20-ops-v2.js`, `conversion-chart.js` 등).
- `top-kpi-drilldown.js`: `monthConfirmed(s)`(=`snapshot().confirmed` 중 `HD20KPIData.confirmedDate`의 연-월이 `seoulDateKey()`와 같은 것) 추가, `sets()[1]`·`cardValues()[1]`을 후보→이번 달 확정으로. parity(`audit()`의 `countParity[1]`) 유지를 위해 비율(%)이 아닌 건수로. `dashboard-grid-drilldown.js` `titles[0]`·`index.html` 카드 라벨 '이번 달 고도화 확정'.
- `hd20-ops-v2.js`(strip 정의): dashboard.summary[1] `판정 대기`(`candidates.filter(!advancementConfirmed)`), activity.manage[3]·activity.analysis[2] `고도화 확정`(`confirmed.length`). `hd20-kpi-evidence-drill.js`: `dashboard.summary.1`·`activity.manage.3`·`activity.analysis.2` 근거 행을 같은 정의로(`confirmedRows`). `hd20-ops-normalized.js`: 활동 전환율→확정률(5.9%), dashboard.summary 보조값 제거.
- `integrated-performance-map.js`: `collect().rate`=유지÷확정, 칩 4개(5S 활동·누적 공식확정·현재 유지·유지율), 표 머리 `생산팀|5S 활동|공식확정|현재유지|유지율`(`maturity-map-official-case-link.js`가 4번째 셀·마지막 앞에 열을 삽입하므로 열 수·순서 유지), 최다팀 카드 '5S 활동 최다팀', 점 클래스에서 candidate 제거, 툴팁 문구.
- `hd20-maturity-map-tab.js`: `teamStats().rate`=유지÷확정, KPI [올해 신규 공식확정(`newSecured`)·누적 공식확정·현재 유지·유지율], 팀 행 `확정|유지|유지율`, 축 라벨, 안내 문구.
- `conversion-chart.js`: 요약·표를 확정/인당/확보율 기준으로 재작성했으나, `getData()`의 `dataMap` 미정의로 데이터가 항상 비어 있음을 확인(`conv_cmp.py`로 변경 전·후 동일하게 0) → `if(!data.length||(!ti&&!ts))return;` 가드로 빈 패널 미표시. (재작성한 표는 데이터가 오는 경로가 없어 화면 검증 불가 — 죽은 경로.) 로더 `dashboard-actions.js`의 `conversion-chart.js?v=20260928-confirmed-1`.
- 그 밖: `dashboard-ops-trend.js` 판정 완료율 설명에서 '후보' 제거, `hd20-improve-board.js` 판정 필터 `S.judge`='Y'|'N'.
- 버전: `top-kpi-drilldown.js`·`hd20-ops-v2.js`·`hd20-kpi-evidence-drill.js`·`dashboard-grid-drilldown.js`·`integrated-performance-map.js`·`hd20-maturity-map-tab.js` `?v=20260928-confirmed-1`, `hd20-ops-normalized.js?v=20260928-3`, `dashboard-ops-trend.js?v=20260928-4`, `hd20-improve-board.js?v=20260928-10`, `dashboard-actions.js?v=20260928-confirmed-1`.
- 검증(`conf_check.py`): 카드 5개 `[인당 1.28, 이번 달 확정 9, 신규 51, 누적 57, 유지 47]`, `dataset.hd20KpiGridParity==='1'`, 2번 카드 클릭 근거 9행, 고도화 맵 KPI `[51,57,47,82.5%]`·팀 행, 실행·유지 칩·표 머리, 활동관리 지표 `[960,658,302,57]`+보조값, 잔여 '후보' 문구 0(안내문 제외), 5S 등록 E2E, 섹션 격리, 16개 탭 회귀 오류 0건.

### `49ed539` — feat: 자율개선 종합 ⑤ 차트를 '고도화 확보 누적 추이'로 교체 (2026-09-28)
- 변경 파일: `hd20-improve-board.js`(+11/-3), `index.html`(+1/-1)
- 검토 산출물(배포 안 함, 참고용 PNG 제공): `mock_line.py`(팀×라인 매트릭스, 시안 A/B), `render_panel5.py`(현재 ⑤ 포함 차트 후보 4종 비교, `chart()` 로직을 독립 복제해 HTML 렌더).
  조사(`line_probe.py`): 확정 57건 전부 `line` 필드 있음, 활동 기준 라인 종류 48개 중 확정 1건 이상 33개(69%), 라인당 확정 분포 {1:16,2:12,3:4,5:1}.
- `hd20-improve-board.js`: `keepSet=new Set(snapshot().maintained.map(r=>r.id))`(참조 대신 id). `teamConf=rowsC.filter(team&&judgeState==='확정')`, 행별 `{ci,li}`(확정월 인덱스·이탈월 인덱스;
  이탈일 필드 있으면 그 값, 없으면 `ci+6`(추정, `est++`), 현재 월 초과 시 clamp). 월별 `exArr`(기존 유지)·`nwArr`(신규)·`cumArr`. `E=chart({stack:true,series:[기존 유지,신규 확정]})`.
  머리글 '단일 팀에 대한 고도화 확보 누적 추이(인당) · 현재 {curKeep}곳 유지', 추정 건수 있으면 안내문(수평전개는 근거 데이터 참조 안내).
  `EV.e`=해당 팀의 올해 확정 전체(열에 수평전개 여부 포함이라 정보 유지). 버전 `?v=20260928-12`.
- 검증(`panel5_check.py`): 대형Att.팀 근거 3건, 머리글 '현재 4곳 유지', 팀 전환(프레임제작팀→'현재 2곳 유지') 정상 갱신, 최종 막대값 0.20=4/20 일치,
  16개 탭 회귀 오류 0건, 섹션 격리(`reg_dash3.py`) 통과.

### `e675362` — feat: 조치 목록 구조 필터 바 추가 (2026-09-28)
- 변경 파일: `action-mail-workflow.js`(+9/-3), `index.html`(+1/-1)
- 모듈 확인: 정적 코드만으로 activity-workflow.js의 build()를 조치 목록 렌더러로 착각(다른 #awAction 빌더가 여럿 존재: action-mail-workflow.js·action-leadtime-grid.js 등 여러 모듈이 같은 컨테이너에 다른 서브뷰를 그림) →
  `dom_action.py`로 실제 렌더된 DOM을 조회해 `.amCases`(카드 "개선요청 현황", `action-mail-workflow.js`, `a.dataset.amReady`)가 진짜 조치 목록임을 확인.
- `action-mail-workflow.js`: 상태 `F={team,status,from,to}`, `filtered(rows)` 필터 함수. `renderCases(a)` 시작부에서 `cases()` → `filtered(cases())`로 교체, `#amFilterCount`에 `N건 (전체 M건)` 표시.
  마크업: "개선요청 현황" 카드 안 `.amCasesScroll` 앞에 `.amFilterBar`(생산팀 select+상태 select+등록일 from/to+조회/초기화 버튼+카운트). `build()` 끝에서 이벤트 바인딩(`go()`가 F 갱신 후 `renderCases(a)` 재호출, 팀·상태는 `onchange`, 날짜는 `[조회]` 클릭, `[초기화]`는 값 비우고 재조회).
  CSS `.amFilterBar`(flex 배치, hd22 톤). 버전 `action-mail-workflow.js?v=20260928-filter-1`.
- 검증(`filter_check.py`~`filter_final.py`, 여러 차례 재작성): 팀 필터 40건(팀 열 전부 일치), +상태=완료 24건, 초기화 640건 복원. 구조 필터+자유 검색 조합에서 "25/25건"이 나와 버그로 의심 → 직접 상태 열을 세어보니 중형Att팀 40건 중 '완료' 정확히 25건으로 일치(정상). 개선요청 임시저장 E2E(640→641), 16개 탭 회귀 오류 0건.

### `ddd8454` — feat: 후보 목록 구조 필터 바 추가 (2026-09-28)
- 변경 파일: `activity-workflow.js`(+6/-2), `index.html`(+1/-1)
- 모듈 확인: `dom_workplace.py`로 실제 DOM 조회 → "고도화 후보 / 공식판정" 카드(`activity-workflow.js`의 `renderWorkplace()`, `#awWorkplace [data-live-workplace]`)가 진짜 후보 목록(154건)임을 확인.
- `activity-workflow.js`: `WPF={team,crit,judge}` 상태. `renderWorkplace(s)`에서 `all=s.candidates`, `rows=all.filter(팀·criteriaCount·isConfirmed 조건)`으로 교체(기존 정렬·400건 슬라이스는 필터 뒤에 그대로 적용), `#wpFilterCount`에 `N건 (전체 M건)`.
  마크업은 `card('고도화 후보 / 공식판정', ...)` 본문 앞에 `.amFilterBar`(action-mail-workflow.js가 정의한 클래스 재사용, 이 파일엔 별도 css() 함수가 없어 새 CSS를 추가하지 않고 기존 전역 클래스에 편승) 삽입. 이벤트는 `w.insertAdjacentElement('afterend',u)` 직후 바인딩. 버전 `activity-workflow.js?v=20260928-filter-1`.
- 검증(`wp_final.py`): 조건=3개 필터 117건 전부 실측 열 값 '3개' 일치, +판정=확정 51건 전부 '확정' 배지 일치, 팀=대형Att.팀 6건 전부 일치, 초기화 154건 복원. 첫 시도(`wp_check.py`)에서 `table:first-of-type` 선택자가 같은 화면의 두 표 모두에 매칭돼(각 표가 서로 다른 부모의 첫 자식) false 판정이 났던 것을 카드 단위 선택자로 교정.
- 5S 등록 E2E(960→961), 16개 탭 회귀 오류 0건. 회귀 높이가 무관 화면들에서도 동반 상승(`leak_effect.py`로 최상위 블록 목록에 낯선 블록 없음 확인) → 날짜 의존(기한경과 등) 값의 자연 증가로 판단, 코드 수정 없음.

## 회귀 확인(공통, Playwright Chromium)
- 15개 탭(대시보드 2 + 활동관리 2 + 고도화 3 + 진단유지 3 + 개선실행 3) 전체
  버튼 클릭 순회, `pageerror`/`console.error`/`dialog` 이벤트 리스너로 0건 확인.
- `?validation=1`(960/320/640), `&edge=1`(XSS/잘못된 날짜/중복 ID 포함),
  `&scale=3&edge=1`(대용량) 3가지 모드 모두 오류 0건.
- scrollHeight 실측: 개선조치 80,544→8,768px / 후보목록 6,886px / 3조건분석
  11,141px / 확정·수평전개 3,923px / 대상추출 6,965px / 실시·점검입력 7,483px /
  유지관리 21,138→8,025px / 팀장기준정보 5,435px.
- 팀장 기준정보(`action.master`) 신설 탭이 `.amMaster`만 단독 노출하고
  `.amGrid`/`.hd20LtWrap`은 숨겨짐을 스크린샷으로 확인.

## 수정 금지/보호 영역 (이번 세션 기준)
- `'retention'`(audit), `'manage'`/`'verify'`(action), `'judge'`/`'standard'`(advancement)
  서브키 문자열 — 8개 이상 외부 파일이 그대로 참조하므로 이름 변경 금지.
- Supabase 동기화 로직(`supabase-sync.js`, `hd20-db-production-health.js`) —
  `HD20_AUTH_BYPASS` 안전 no-op을 확인했으므로 이번 세션에서 별도 수정하지 않음.
- KPI 산식/데이터 계약 임의 변경 금지(계속 적용).

## 다음 코딩 순서
1. `?validation=1&scale=3` 대용량에서 7~26초 걸리는 Advancement/Audit 팀별 집계
   위젯을 프로파일링해 병목 특정.
2. 외부 리소스(뉴스 이미지 2건) 실사용 브라우저 확인.
3. 서브탭 세분화 후 남은 서브탭 간 사용자 피드백 수렴(추가 세분화 필요 여부).

## 종료조건
15개 탭 클릭 순회 + edge/scale 스트레스 모드에서 콘솔 오류 0건, scrollHeight
실측치가 모두 11,200px 이하로 수렴, GitHub Pages 재배포(`built`) 확인 후 종료.


## (2026-09-28 갱신) 회귀 기준치
- 모바일 430px scrollHeight(테마 적용 후, `final_regress15.py`): 종합현황 2,341 / 성과·운영분석 2,567 / 활동관리 3,472 / 실적분석 1,933 /
  후보 목록 6,108 / 3조건 3,364 / 라인·작업장 3,154 / 확정·수평전개 2,993 / 대상 추출 5,842 / 실시·점검 6,266 / 6개월 4,945 /
  종료평가 5,292 / 조치 목록 6,420 / 처리기간 4,005 / 팀장 4,110 / 효과·재발 3,020. 콘솔 오류 0건.
  (테마 적용 전 기준치는 위 `cf11419`·`c390ffe` 항목 참조: 활동관리 3,907 / 실적분석 2,357 등.)
- 데스크톱 폭 검사: 1200·1280·1366·1440·1536·1680·1792px에서 `.awGrid`/`.amGrid` 단일 열 전체폭, 가로 넘침 없음.
  협폭 700·768·850·900px는 지표 스트립 2열, 1000·1100px는 4열, `.awActions` `flex-wrap:wrap`.
- 기능 회귀 세트: 5S 등록(960→961), 개선요청 임시저장(640→641), 통합기준정보 순서 저장, 핵심 버튼 3종(모달 오픈), 표 검색(400→92건),
  엑셀 양식/그리드 CSV 다운로드, 인쇄 미리보기(`emulate_media('print')`), 엣지 모드(`?validation=1&edge=1` 985/333/657건) 오류 0건.
- 테스트 환경 주의: `wait_until='domcontentloaded'`, `--no-sandbox`, 서버와 테스트를 같은 프로세스에서 실행, 회귀 스크립트의 대상 폴더 확인.

## (2026-09-28 갱신) 수정 금지/보호 영역 추가
- `mo-throttle.js`: `index.html`의 `<meta name="viewport">` 직후, 모든 스크립트보다 앞에 있어야 함(순서 변경·삭제 금지). 80ms 병합이라
  guard류 보정이 즉시가 아님을 전제로 수정할 것.
- `hd22-theme.css`: `!important`·`:has()` 다수. 수정 시 대시보드가 영향받지 않는지(공통 헤더 제외 본문/지표 66px) 확인. `@media screen` 유지.
- `hd20-subtabs.js`의 `ROLES`/`runCta`: **저장·제출 버튼을 핵심 버튼(cta)에 연결 금지**(audit.inspect 사고 사례).
- `activity-register-modal.js`(`hd20AwGridSingle`)·`action-register-modal.js`(`hd20AmGridSingle`): 폼 카드를 모달로 옮긴 뒤 그리드를 단일 열로 바꾸는 CSS는
  `workflow-area-density.css`의 `#awActivity>.awGrid`/`#awAction>.amGrid` `!important`를 이기려면 **ID 셀렉터 포함**이어야 함.
- `dashboard-section-tabs.js`: 탭 바 삽입 위치(`.beginnerHint` 바로 아래)와 조건부 스크롤 유지. `HD20_SUBNAV.select()` 호출 금지(순환 → 브라우저 정지, `2322352` 기록).
- `dashboard-actions.js`(추이 차트): 이탈 추정 규칙(확정일+6개월, 현재 월 clamp)과 추정 안내문 유지. 이탈일 필드명(`maintainLostAt` 등) 변경 시 로그·화면 문구 동기화.
- KPI 산식/데이터 계약 임의 변경 금지, `web-validation-fixture.js`/`demo-seed-data.js`는 검증용 가상 데이터(실데이터 아님).

## (2026-09-28 갱신) 다음 코딩 순서 (위 "다음 코딩 순서"를 대체)
1. 사용자가 실제 사이트에서 확인한 결과 반영(빈 여백·차트 중복·하위 탭 고정·누적 막대·hd-22 1차).
2. 유지 이탈일 원천 확인 후 `maintainLostAt` 연결(추정 → 실제 값), 없으면 추정 유지.
3. hd-22 2차: 필터 바+그룹 목록+작업 툴바, 진단·유지/개선실행 본문 카드, 모바일 헤더 축약.
4. 09-23 다른 작업자의 HD-22 UI 커밋과 `hd22-theme.css` 겹침 시각 점검.
5. `mo-throttle.js` 실사용 관찰, 종료평가 race·`scale=3` 재측정.
6. 인쇄 CSS: 행 단위 버튼·"업무화면 →" 숨김.
7. 죽은 코드 정리(`applyAction` `.awKpis`), `.awAuditLane` 이중 관리 정리(회귀 확인 필수).

## (2026-09-28 갱신) 종료조건
16개 탭 순회·기능 회귀 세트 콘솔 오류 0건, 최신 GitHub Pages 빌드 `built` 확인, 실제 사이트 확인 결과 반영 후 종료.

## 부록: 이 세션 Claude 코드 커밋 대장 (git에서 자동 생성, 총 52건)
> 커밋 시각은 저장소 표기 기준. 아래 52건이 세 로그(개발일지·상세 개발일지·코딩일지)에 모두 등장하는지 스크립트로 검증함.
> (`e182f66`은 이 대화 밖의 다른 Claude 세션이 같은 계정으로 push한 커밋이라 포함됨. 대장은 `git log --since`가 날짜가 뒤섞인 이력에서 일부를 건너뛰는 것을 발견해, 커밋 날짜를 직접 비교해 생성)

| 커밋 | 시각 | 제목 | 변경 파일 |
|---|---|---|---|
| `67826a5` | 2026-09-22 00:02 | feat: remove Supabase password login step, keep company-mail gate | `index.html`, `supabase-auth.js` |
| `f253916` | 2026-09-22 05:56 | feat: split ③④⑤ overloaded subtabs into 3 each; fix pagination bugs | `action-leadtime-grid.js`, `action-subtab-dedupe-guard.js`, `advancement-subtab-dedupe-guard.js`, `audit-close-evaluation.js`, `audit-subtab-dedupe-guard.js`, `final-layout-polish.js`, `hd20-ops-v2.js`, `hd20-overhaul.css`, `hd20-subtabs.js`, `index.html`, `table-enhance-suite.js` |
| `4aee88b` | 2026-09-22 06:17 | feat: split advancement '3조건 분석' into summary + detail (라인·작업장 상세) | `advancement-subtab-dedupe-guard.js`, `final-layout-polish.js`, `hd20-ops-v2.js`, `hd20-subtabs.js`, `index.html`, `maturity-condition-analysis.js` |
| `57e264c` | 2026-09-22 06:37 | feat: split action '조치 목록' + audit '유지관리', keep legacy sub-keys intact | `action-subtab-dedupe-guard.js`, `audit-subtab-dedupe-guard.js`, `final-layout-polish.js`, `hd20-ops-v2.js`, `hd20-subtabs.js`, `index.html` |
| `c7b499e` | 2026-09-22 07:02 | fix: KPI evidence grid was empty for all 6 subtabs split today/yesterday | `hd20-kpi-evidence-drill.js`, `index.html` |
| `0e74799` | 2026-09-22 13:20 | feat: virtual data now shows by default, no ?validation=1 needed | `dashboard-kpi-source.js`, `index.html`, `supabase-sync.js`, `web-validation-fixture.js` |
| `e535a26` | 2026-09-22 23:32 | fix: distinguish active subtab visually; remove duplicate metrics across tabs | `hd20-kpi-evidence-drill.js`, `hd20-ops-v2.js`, `hd20-subtabs.css`, `index.html` |
| `44a5c3f` | 2026-09-22 23:56 | fix: reduce bubble overlap in dashboard maturity map (고도화 맵) | `hd20-maturity-map-tab.js`, `index.html` |
| `b8f75bc` | 2026-09-23 12:08 | perf: batch maturity-map DOM insertion; harden pagination re-scan timing | `action-subtab-dedupe-guard.js`, `audit-subtab-dedupe-guard.js`, `final-layout-polish.js`, `hd20-maturity-map-tab.js`, `index.html`, `table-enhance-suite.js` |
| `d4ca925` | 2026-09-23 12:27 | feat: prioritize headline KPI cards above OPERATION HEALTH on dashboard tab | `dashboard-priority-layout.js`, `final-layout-polish.js` |
| `80b1fd2` | 2026-09-23 18:33 | fix: reorder 확정·수평전개 summary-before-detail; fix missing 효과·재발관리 panel | `activity-workflow.js`, `hd20-subtabs.js`, `index.html` |
| `abc91fc` | 2026-09-23 21:41 | fix: reserve scrollbar-gutter to stop content leaning/margin shift on scroll | `index.html`, `styles.css` |
| `3f6be0f` | 2026-09-23 22:18 | fix: remove duplicate intro paragraph on 활동관리 (activity.manage) tab | `activity-workflow.js`, `index.html` |
| `cf11419` | 2026-09-24 00:40 | fix: remove duplicated intro/summary blocks on 후보 목록 and 활동관리 | `activity-workflow.js`, `index.html` |
| `7b70f79` | 2026-09-24 01:10 | feat: replace English jargon eyebrow-labels and dense descriptions with plain Korean | `dashboard-priority-layout.js`, `final-layout-polish.js`, `hd20-five-area-integration.js`, `hd20-maturity-map-tab.js`, `hd20-subtabs.js`, `index.html`, `workflow-crud.js` |
| `03ec959` | 2026-09-24 05:38 | feat: regroup 활동관리 sections by topic (context -> input -> data -> analysis) | `activity-excel-preview-import.js`, `index.html` |
| `7de480a` | 2026-09-24 07:48 | feat: regroup 고도화·표준화 - candidate list right after progress funnel | `final-layout-polish.js`, `hd20-five-area-integration.js` |
| `29f702c` | 2026-09-24 07:53 | feat: clarify funnel connects to top metric cards (reframe, not delete) | `index.html`, `performance-conversion-analysis.js` |
| `a60d61d` | 2026-09-24 08:00 | feat: regroup 6개월 관리중 - status summary before detail table | `audit-random-draw.js`, `index.html` |
| `19d2f5e` | 2026-09-24 08:04 | fix: restore amHeroNote position on 효과·재발관리 (side-effect of earlier fix) | `hd20-subtabs.js`, `index.html` |
| `b4d45e1` | 2026-09-24 10:46 | fix: show "고도화 작업장 추이" chart only on 고도화·표준화 area | `final-layout-polish.js`, `hd20-five-area-integration.js` |
| `b0d8911` | 2026-09-24 11:52 | fix: clarify "진행중" label ambiguity on 조치 목록 (relabel, not delete) | `action-mail-workflow.js`, `index.html` |
| `f151a99` | 2026-09-24 12:05 | fix: remove 3 duplicate metric cards from 효과·재발 검증현황 panel | `hd20-subtabs.js`, `index.html` |
| `d21fc0f` | 2026-09-25 00:21 | fix: remove amSummary card on 조치 목록 (3/4 items duplicated top strip) | `action-mail-workflow.js`, `index.html` |
| `2bbdcfa` | 2026-09-25 00:36 | feat: differentiate 실적분석 from 활동관리 (was showing identical content) | `hd20-subtabs.js`, `index.html` |
| `2322352` | 2026-09-25 07:29 | feat: implement dashboard "성과·운영분석" section (was defined but unreachable) | `dashboard-section-tabs.js`, `final-layout-polish.js` |
| `4d7cfa0` | 2026-09-25 08:15 | fix: restore missing "통합기준정보" modal (#masterModal never existed) | `index.html`, `master-info-modal.js` |
| `42d606a` | 2026-09-27 12:01 | feat: add print-optimized CSS (@media print) - hide chrome, keep data only | `index.html`, `print-styles.css` |
| `1c27f32` | 2026-09-27 12:42 | feat: hide "+개선요청 등록" action on non-조치목록 subtabs (info flow fix) | `hd20-subtabs.js`, `index.html` |
| `a189e3f` | 2026-09-27 22:41 | fix: 조치 목록 데스크톱 와이드 화면 - 등록카드가 모달로 빠진 뒤 남은 빈 여백 제거 | `action-register-modal.js`, `index.html` |
| `e74dd3e` | 2026-09-27 22:47 | fix: 활동관리 데스크톱 와이드 화면도 동일한 빈 여백 버그 수정 | `activity-register-modal.js`, `index.html` |
| `c390ffe` | 2026-09-27 23:27 | fix: 팀별 5S 유형 차트 중복 노출 제거 + 차트 겹침/잘림 수정 | `activity-dynamic-chart.js`, `hd20-subtabs.js`, `index.html` |
| `876ad6a` | 2026-09-27 23:38 | feat: hd-22 디자인 벤치마킹 - 대시보드 외 탭을 "할 일/관리 포인트" 중심으로 재구성 | `hd20-subtabs.js`, `hd22-theme.css`, `index.html` |
| `dc2c7c2` | 2026-09-28 00:10 | fix: 대시보드 하위 탭 위치 고정 + 섹션 전환 13~30초 지연 해소 | `dashboard-section-tabs.js`, `final-layout-polish.js`, `index.html`, `mo-throttle.js` |
| `62d520b` | 2026-09-28 00:30 | feat: 고도화 작업장 추이를 누적 막대(기존 유지 + 신규)로 변경 | `dashboard-actions.js`, `index.html` |
| `55f4705` | 2026-09-28 00:37 | fix: 고도화 작업장 추이 - 유지 이탈을 반영한 누적 막대(기존 유지+신규)로 재계산 | `dashboard-actions.js`, `index.html` |
| `e182f66` | 2026-09-28 00:50 | fix: 옆 카드 높이에 맞춰 늘어나 생기던 불필요한 빈 공간 제거 | `dashboard-section-tabs.js`, `final-layout-polish.js`, `hd22-theme.css`, `index.html` |
| `08cd94d` | 2026-09-28 04:24 | feat: 대시보드 탭 정리 - 성과·운영분석을 월별 추이로 재정의, 현장참고 메뉴 숨김 | `ci-tab-keys.patch`, `dashboard-kpi-source.js`, `dashboard-ops-trend.js`, `dashboard-section-tabs.js`, `final-layout-polish.js`, `index.html` |
| `b76f198` | 2026-09-28 04:26 | fix: 성과·운영분석 추이 영역이 다른 영역(활동관리 등)에서도 보이던 문제 수정 | `dashboard-ops-trend.js`, `index.html` |
| `40a0d33` | 2026-09-28 04:31 | feat: 3조건 분석 - 총 건수 대신 "어느 라인·작업장이 몇 개를 충족했나" 목록으로 재구성 | `hd20-condition-groups.js`, `hd20-subtabs.js`, `index.html` |
| `955d40f` | 2026-09-28 04:38 | feat: 총 건수 대신 효율 병기 - 지표 카드에 인당·비율 보조값, 팀별 차트를 인당 개선건수 순위로 재설계 | `activity-dynamic-chart.js`, `hd20-ops-normalized.js`, `index.html` |
| `a45a372` | 2026-09-28 04:43 | ui: 첫인상 정리 - 시험용처럼 보이던 배너·상태 버튼·좁은 KPI 카드 개선 | `hd22-theme.css`, `index.html` |
| `96a7f6f` | 2026-09-28 09:44 | perf: 표 행 가상화(현재 페이지 행만 DOM 유지) + 증빙 썸네일 지연 로딩 — 화면 요소 32,171 → 8,206 | `action-field-photo-gallery.js`, `index.html`, `table-enhance-suite.js`, `workflow-crud.js` |
| `faf554e` | 2026-09-28 09:49 | feat: 5S 자율개선 종합 대시보드 신설 (기존 MES 'VTB 자율개선 종합 대시보드' 구성 반영) | `ci-tab-keys.patch`, `dashboard-section-tabs.js`, `final-layout-polish.js`, `hd20-improve-board.js`, `index.html` |
| `9d5f65a` | 2026-09-28 10:00 | feat: 5S 개선요청 종합 대시보드 신설 (5S 자율개선 종합과 같은 뼈대) | `ci-tab-keys.patch`, `dashboard-kpi-source.js`, `dashboard-section-tabs.js`, `final-layout-polish.js`, `hd20-improve-board.js`, `hd20-request-board.js`, `index.html` |
| `dd8f90d` | 2026-09-28 10:19 | feat: 종합 대시보드 - 근거 데이터 보기 + 분기별 인당 목표선(목표 달성/미달) | `hd20-improve-board.js`, `hd20-request-board.js`, `index.html` |
| `1d22c89` | 2026-09-28 10:24 | fix: 종합 대시보드 [프린트] 결과 개선 — 잘림 제거·용지 폭 기준 재그리기·버튼 숨김 | `hd20-improve-board.js`, `hd20-request-board.js`, `index.html` |
| `64d07c1` | 2026-09-28 10:33 | feat: 자율개선 종합 - Fool Proof 대체 지표를 원천 데이터에서 선정(고도화 공식 확정 건수) + '고도화 판정' 필터 | `hd20-improve-board.js`, `index.html` |
| `89ef6a8` | 2026-09-28 10:46 | feat: 고도화 성과는 '확정 결과'만 표시 — 후보 건수를 성과 화면에서 제거 | `conversion-chart.js`, `dashboard-actions.js`, `dashboard-grid-drilldown.js`, `dashboard-ops-trend.js`, `final-layout-polish.js`, `hd20-improve-board.js`, `hd20-kpi-evidence-drill.js`, `hd20-maturity-map-tab.js`, `hd20-ops-normalized.js`, `hd20-ops-v2.js`, `index.html`, `integrated-performance-map.js`, `top-kpi-drilldown.js` |
| `49ed539` | 2026-09-28 21:29 | feat: 자율개선 종합 ⑤ 차트를 '고도화 확보 누적 추이'(기존 유지+신규)로 교체 | `hd20-improve-board.js`, `index.html` |
| `e675362` | 2026-09-28 21:38 | feat: 조치 목록에 hd-22식 구조 필터 바(생산팀·상태·등록일) 추가 — 2순위 착수 | `action-mail-workflow.js`, `index.html` |
| `ddd8454` | 2026-09-28 21:49 | feat: 후보 목록에 hd-22식 구조 필터 바(생산팀·조건 충족수·공식판정) 추가 | `activity-workflow.js`, `index.html` |

### 문서 커밋(43건, 로그 갱신용)
- `c661242` docs: development/coding log for validation fixture, team master, auth, subtab split (2026-09-22)
- `da246aa` docs: log advancement 4-way subtab split (4aee88b) in dev/coding logs
- `015b9b3` docs: log action/audit 4-way subtab split + metric bugfix (57e264c) in dev/coding logs
- `5cfa2e2` docs: log KPI evidence grid regression + fix (c7b499e) in dev/coding logs
- `20480c3` docs: log default-on virtual data change (0e74799) in dev/coding logs
- `3c39e09` docs: log tab-contrast and duplicate-metrics fix (e535a26) in dev/coding logs
- `7a7910e` docs: log maturity map bubble decluttering fix (44a5c3f) in dev/coding logs
- `bbed270` docs: log maturity-map perf fix + closure-eval race mitigation (b8f75bc) in dev/coding logs
- `fcd6d2e` docs: log dashboard KPI-priority reorder (d4ca925) in dev/coding logs
- `50bed25` docs: log subtab priority reorder + verify-panel fix (80b1fd2) in dev/coding logs
- `3db7954` docs: log scrollbar-gutter symmetry fix (abc91fc) in dev/coding logs
- `e0c1ac7` docs: log duplicate-intro cleanup (3f6be0f) in dev/coding logs
- `a6d5c0f` docs: log 2/3-area overhaul + plain-language conversion (cf11419, 7b70f79) in dev/coding logs
- `33c59ef` docs: log topic-based regrouping (03ec959) in dev/coding logs
- `1b18b1f` docs: log advancement regrouping (7de480a) in dev/coding logs
- `1e8f1ef` docs: log funnel connecting-note fix (29f702c) in dev/coding logs
- `e91c7c5` docs: log 6개월관리중 regrouping (a60d61d) in dev/coding logs
- `a847276` docs: log amHeroNote position fix (19d2f5e) in dev/coding logs
- `51135a5` docs: log trend chart area-gating fix (b4d45e1) in dev/coding logs
- `5589520` docs: log cross-area audit + label clarity fix (b0d8911) in dev/coding logs
- `6c99a5b` docs: log verify panel dedup (f151a99) in dev/coding logs
- `a84c0ea` docs: log amSummary removal (d21fc0f) in dev/coding logs
- `3e80cb8` docs: log 실적분석 differentiation (2bbdcfa) in dev/coding logs
- `3af0f4a` docs: log 성과운영분석 implementation (2322352) in dev/coding logs
- `0b84e18` docs: log master info modal restoration (4d7cfa0) in dev/coding logs
- `1796456` docs: log print CSS feature (42d606a) in dev/coding logs
- `d1d2762` docs: log action-flow subtab fix (1c27f32) in dev/coding logs
- `4c4aa78` docs: log 조치목록 desktop empty-space fix (a189e3f) in dev/coding logs
- `a7370f5` docs: log activity grid fix (e74dd3e) in dev/coding logs
- `32878fd` docs: log chart de-dup (c390ffe)
- `f16ef68` docs: log hd-22 benchmark phase 1 (876ad6a)
- `2f08c0d` docs: log tab-position + observer throttle
- `a5f4659` docs: 개발일지·상세 개발일지·코딩일지 전수 보완 (누락 커밋·정정·배포 상태·잔여 과제)
- `a630b4c` docs: 빈 공간 제거(e182f66) 개발일지·상세 개발일지·코딩일지 반영, 커밋 대장 36건 재생성
- `5600a85` docs: 탭 정리·3조건 분석·효율 병기·CI 실패 발견 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 40건 재생성
- `4236808` docs: 웹 완성도 측정·첫인상 정리·지연 렌더링·5S 자율개선 종합 대시보드 로그 반영, 커밋 대장 44건 재생성
- `ac875bb` docs: 5S 개선요청 종합 대시보드(9d5f65a) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
- `75f125d` docs: 종합 대시보드 근거 데이터·목표선(dd8f90d) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
- `8af7ae6` docs: 종합 대시보드 프린트 개선(1d22c89) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
- `c5bcdc0` docs: Fool Proof 대체 지표 선정(64d07c1) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
- `82d67c8` docs: 고도화 확정 결과 기준 전환(89ef6a8) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
- `f9d46c2` docs: ⑤ 차트 대체 팩터 검토·확정(49ed539) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
- `0d1b234` docs: 조치 목록 필터 바(e675362) 개발일지/상세 개발일지/코딩일지 반영, 커밋 대장 재생성
