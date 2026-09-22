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
