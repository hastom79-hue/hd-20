# HD-20 작업일지 — 2026-08-28 (Claude 세션)

> 저장소: `hastom79-hue/hd-20`
> 인계 시점 기준 HEAD: `7129fd41a0604c5f075eb0b9f9d1a9c57760594e`
> 원칙: 요구사항 → 변경 파일 → 구현 → 실행/검증 → Commit → 잔여사항 순서로 기록한다.
> 완료조건: Commit 생성만으로 완료 처리하지 않고, 헤드리스 브라우저 실측 검증 및 실제 GitHub Actions 결과를 확인한다.

이 문서는 `README_WORKLOG_20260828.md`, `WORKLOG_20260827_KPI_CANONICAL.md`,
`WORKLOG_20260828_MOCK_REMOVAL_AND_RUNTIME.md`(이전 작업자 기록) 이후,
같은 저장소에서 이어서 진행한 별도 세션의 기록이다. 기존 문서를 덮어쓰지 않고
병기한다.

## 0. 인계 시점 문제 상황

사용자가 최초로 전달한 문제: "웹 메인 대시보드가 실제 사용자 브라우저에서
정상 구동되지 않는다." `HANDOFF_README.md`/`KNOWN_ISSUES.md`에 따르면
CI(Runtime Smoke, Chromium Smoke)는 이미 성공 상태였음에도 실사용자
브라우저에서는 재현되는 상황이었다 — 즉 기존 자동검증이 실제 문제를
못 잡고 있었다.

## 1. 메인 대시보드 무한루프(CPU Livelock) 근본원인 규명 및 수정

### 요구사항
정적 검증(CI green)과 실제 브라우저 동작이 불일치하는 원인을 실측으로
찾아낸다.

### 진단
- 로컬 sandbox에 헤드리스 Chromium(Playwright, puppeteer 캐시의
  chrome-linux64 바이너리 재사용)을 구성해 실제 렌더링을 관찰.
- `page.evaluate()`가 영구히 응답하지 않는 현상 확인 → 렌더러 프로세스
  CPU 사용률을 `ps aux`로 직접 샘플링 → 66%에서 15초간 계속 상승해
  90.8%까지 수렴하지 않고 증가하는 것을 확인 (진짜 무한루프의 증거).
- 원인: `audit-taxonomy-guard.js`의 `fix()` 함수가 `document.body`를
  `MutationObserver(childList:true, subtree:true)`로 감시하면서, 콜백
  내부에서 조건 없이 `select.innerHTML`을 매번 재작성 → 그 자체가
  `childList` mutation이 되어 자기 자신의 observer를 무한 재트리거.

### 변경 파일
- `audit-taxonomy-guard.js`

### 구현
- `optionsMatch()` 함수 추가: select의 현재 옵션 목록 + 선택값이 이미
  올바르면 `innerHTML` 재작성을 건너뛰도록 idempotent하게 변경.
  기능(카테고리 정규화)은 동일하게 유지.

### 실행/검증
- Before: 66% → 90.8% (15초, 수렴 안 됨)
- After: 23% → 1.2% (36초 관찰, 정상 유휴상태로 수렴)
- 이후 나머지 `document.body` 전역 감시 MutationObserver 스크립트
  6개(`audit-action-auto-link.js`, `crud-hotfix.js`,
  `gmes-5s-judge-flow-polish.js`, `health-grid-practical-final.js`,
  `modal-safety.js`, `team-leader-excel-import.js`)도 개별 코드 리뷰 +
  전체 스크립트 세트 재생 테스트로 동일 문제 없음 확인.

### Commit
`d5a8be1` fix(audit-taxonomy-guard): stop MutationObserver livelock pegging CPU

## 2. 배포 파이프라인 확보 (GitHub 인증)

로컬 sandbox에는 `github.com` push 인증정보가 없어 사용자로부터
fine-grained PAT(Contents: Read/Write 권한)를 발급받아 `git push`
가능하도록 구성. 이후 모든 커밋은 실제로 `origin/main`에 반영하고
`git fetch` + `git log origin/main`으로 반영 여부를 매번 재확인하는
방식으로 진행.

## 3. 신규 대시보드 화면 추가 (HDPS 5S)

### 요구사항
사용자가 제공한 참조 이미지(HD HYUNDAI 브랜딩, 6개 메뉴, KPI 6개 상단
배치, 우측 사이드바 구성)를 별도 화면으로 구현. 기존 `index.html`은
그대로 유지, 두 화면을 당분간 병존.

### 변경 파일
`hdps-dashboard.html`, `hdps-dashboard.css`, `hdps-dashboard.js` (신규)

### 구현
- `index.html`과 동일한 canonical 데이터 소스(`HD20KPIData`,
  `HD20MaturityFollowup`, `hd20ActionCasesV2`) 사용 — 두 화면이 서로
  다른 숫자를 보여줄 수 없도록 단일 진실 공급원 유지.
- 운영지표 6종 계산 로직은 `approved-landing-v2.js`의 `operational()`을
  그대로 이식해 두 화면이 동일 공식을 사용.
- 실데이터 없을 시 전부 "—" 표시 (가짜 수치 생성 금지 원칙 유지).

### 실행/검증
- CPU 안정성(무한루프 없음), 스크린샷 비교로 레이아웃 확인.
- 시드 데이터 주입 테스트로 두 대시보드가 동일 입력에 대해 정확히
  동일한 KPI 값을 계산하는 것을 확인(운영지표 6종 값 100% 일치).

### Commit
`a46fd9f` feat: add second dashboard screen (HDPS 5S, HD HYUNDAI reference)
`e2a01ba` fix(hdps-dashboard): avoid label overlap on maturity-level scatter map

## 4. 강제 데이터 생성(샘플 시드) 및 탭 보완

### 요구사항
"필요한 정보들을 찾아서 탭을 생성하고 보완, 데이터도 강제 생성하여
인풋, 모든 탭에 데이터 추출·출력 기능."

### 변경 파일
`demo-data-seed.js`(신규), `register-tab-fill.js`(신규),
`beginner-navigation.js`, `hdps-dashboard.js`, `workflow-crud.js`,
`index.html`, `hdps-dashboard.html`

### 구현
- `demo-data-seed.js`: 캐노니컬 저장소 3종(활동/팀장/개선조치)이
  비어있을 때만 채우는 idempotent 시더. 실데이터 있으면 절대 덮어쓰지
  않음. 화면 상단에 "⚠ 샘플 데이터 표시 중" 배너를 상시 노출해 실운영
  데이터와 혼동되지 않게 함.
- `beginner-navigation.js`에 `?tab=` 쿼리 파라미터 딥링크 지원 추가 →
  HDPS 대시보드의 5개 비어있던 메뉴를 `index.html`의 실제 작동하는
  화면으로 연결.
- `register-tab-fill.js`: "⑦ 기준정보" 탭이 안내문구 한 줄뿐이던 것을
  실제 팀/팀장/이메일/분기목표 테이블로 채움.
- `workflow-crud.js`의 CSV 추출 + 인쇄 툴바를 기존 4개 탭에서 기준정보·
  성과전환분석까지 6개 탭 전체로 확장. `.pcHeader` 앵커 폴백 추가.
- 두 대시보드 메인 화면에 인쇄 버튼 추가.

### 실행/검증
- 시드 자동 주입 확인, 7탭 콘솔 에러 0건, 팀명 오타(트리블슈팅팀 ↔
  트러블슈팅팀 — 4개 파일에 흩어져 있던 것) 발견해 통일, 기준정보
  탭이 정확히 16개 팀으로 렌더링되는 것 확인.

### Commit
`44ac3de` feat: demo data seed, deep-linked HDPS tabs, export/print on every tab

## 5. 전체 클릭 요소 → 실데이터 그리드 팝업

### 요구사항
"대시보드에 모든 것은 선택 클릭 시 상세 그리드가 팝업형태로 로데이터가
보여져야 한다."

### 변경 파일
`top-kpi-drilldown.js`, `dashboard-grid-drilldown.js`(신규),
`hdps-dashboard.js/css/html`

### 구현
- `top-kpi-drilldown.js`의 내부 팝업 렌더러(`show`/`showCustom`/`modal`/
  `esc`)를 `window.HD20TopKPIGrid`에 export해 다른 스크립트가 재사용
  가능하도록 함.
- `index.html`: 운영지표 6개 카드, Level Map 5단계, 최근 고도화
  작업장, 기한임박 점검 대상, 월별 추이 5개 카드를 전부 실데이터
  필터링 팝업에 연결.
- `hdps-dashboard.html`: 독자 팝업 컴포넌트(`hpGridModal`)를 새로
  구현해 KPI 6개, 활동유형 6개, Map의 점 하나하나, 분포표 행, Action
  Summary 행, Portfolio/GMES 카드까지 연결.
- 날짜 표시가 ISO 타임스탬프 원본으로 나오던 것을 `dateOnly()`
  헬퍼로 정리(양쪽 파일 공통 적용).

### 실행/검증
- Playwright 실제 클릭으로 팝업 오픈 여부·필터링된 행 수까지 확인
  (예: Level 3 클릭 → 정확히 9건).

### Commit
`aa35c49` feat: every clickable dashboard element opens a raw-data grid popup

## 6. 나머지 탭 검색/정렬/페이지네이션/행 상세팝업

### 변경 파일
`table-enhance-suite.js`(신규), `tab-polish.css`(신규),
`activity-workflow.js`

### 구현
- 모든 `.awTable`/`.amCases`에 공통 적용되는 범용 애드온: 검색창,
  헤더 클릭 정렬(숫자/한글 로케일 자동 판별), "더 보기" 25건 단위
  페이지네이션, 행 클릭 → 상세정보 팝업(테이블 자체 데이터를
  읽어 재구성, 원본 스크립트 로직 비침습).
- `.amCases`는 자체 ID클릭→회신패널 열기 기능이 있어 행 클릭 상세팝업만
  제외, 검색/정렬/페이지네이션은 동일 적용.
- `activity-workflow.js`의 테이블 렌더 상한을 80~100건 → 400건으로
  올려 검색이 실질적으로 전체 데이터를 대상으로 하게 함.

### Commit
`a36aec2` feat: search, sort, pagination, and row-detail popup on every data table

## 7. 모달/팝업 디자인 통일

### 요구사항
서로 다른 헤더 색/그림자/버튼 스타일을 쓰던 팝업 9종(rgModal, abModal,
hfModal, gmesJudgeModal, criteriaFinalModal, maturityMapModal,
masterModal, dashModal, hd20AiPanel, pcModal)을 하나의 navy 그라데이션
톤으로 통일.

### 변경 파일
`modal-chrome-unify.css`(신규), `index.html`

### 특기사항 — CSS 특이도 함정
다른 파일들이 런타임에 `document.head.appendChild(style)`로 같은
selector에 `!important` 오버라이드를 주입하고 있어(예:
`dashboard-download-final.js`, `modal-safety.js`), 동일 specificity에서
"나중에 삽입된 쪽이 이긴다"는 원칙 때문에 정적 `<link>` 스타일시트가
매번 패배함. 모든 selector에 `html body` 접두사를 붙여 element-level
specificity를 2점 추가로 확보해 삽입 순서와 무관하게 항상 이기도록 함.
이 과정에서 `masterModal`(통합기준정보) 헤더가 흰 배경에 흰 글씨로
사실상 안 보이던 **실제 버그**를 우연히 발견해 같이 수정.

### Commit
`f2452d7` feat: unify visual chrome across every modal/popup on index.html

## 8. 저장소 정리 — 죽은 파일/가짜 데이터/중복 로딩 제거

### 요구사항
"챗지피티가 다 망쳐놓았다, 정리해달라" / "동적기반의 대시보드를
부탁한다."

### 구현
- 정적/동적 로딩 어디서도 참조되지 않는 진짜 고아 파일 21개(JS 17 +
  CSS 4) 삭제. 파일당 개별로 정적 `<script src>` 참조와
  `document.head.appendChild` 동적 참조를 모두 확인한 뒤 삭제 —
  실제로는 여전히 동적 로드되던 3개(`conversion-chart.js`,
  `gmes-5s-case-import.js`, `gmes-5s-judge-ui.js`)는 보존.
- `criteria-hover.js`가 이미 정적으로 로드된 `dashboard-actions.js`/
  `trend-analytics.js`를 또 동적으로 불러오던 중복 로딩 버그 수정.
- "동적기반" 요청에 대응: 로드는 되지만 대상 DOM(`.approvedSummary`,
  `.cards .kpi`, `.trendBox`)이 전부 `display:none`이거나 존재하지
  않는 구버전 화면이라 실제로는 죽은 코드였던 4개 파일
  (`operating-health-kpi.js`, `dashboard-premium-effects.js`,
  `trend-analytics.js`, `operating-health-context-final.js`) 내부에
  팀명·날짜·점수가 소스코드에 통째로 하드코딩된 fake 배열이 있던 것을
  발견해 전부 삭제. 이후 화면에 표시되는 모든 KPI성 숫자는 예외 없이
  `HD20KPIData`/`HD20MaturityFollowup`/`hd20ActionCasesV2` 하나의
  canonical 소스로 귀결됨.

### Commit
`0dea298` chore: remove 21 dead files, fix duplicate script loading
`462e80e` chore: remove the last hardcoded-data files, complete dynamic-source migration

## 9. GitHub Actions/Pages 실인프라 교차검증

로컬 sandbox 렌더링뿐 아니라 실제 GitHub 인프라 결과를 API로 직접
조회해 교차검증:
- `runtime-smoke.yml`, `browser-smoke.yml`(Playwright 기반 실제
  pageErrors/DOM assertion 포함), `package-source.yml`,
  `pages build and deployment` 4개 워크플로우 전부 최신 커밋 기준
  success 확인.
- `nav-polish.js` 삭제가 `runtime-smoke.yml`의 `grep ... nav-polish.js`
  체크를 깨뜨릴 것으로 우려했으나, `if grep -q ...; then` 구문이
  `set -e`에 걸리지 않는 bash 특성상 실제로는 안전함을 실제 로그로
  재확인.
- `*.github.io`, Azure Blob(CI 아티팩트 다운로드 링크)는 sandbox
  네트워크 allowlist 밖이라 직접 fetch 불가 — 사용자에게 직접 확인
  요청.
- 정적/동적 참조 무결성 전수 재검사: `index.html` 58개, `hdps-
  dashboard.html` 5개 참조 전부 실존 파일, 동적 로드 참조 0건 누락.

## 10. Level Map 가독성 재설계

### 문제
사용자 피드백 "1-5레벨 표현한 맵에서 잘 눈에 안 들어온다."
- `index.html`: 레벨명("기본"/"관리" 등)이 폭이 안 맞는 좁은 막대
  안에 그대로 삽입되어 "기\n본"처럼 한 글자씩 줄바꿈되던 실제 버그.
- `hdps-dashboard.html`: 점마다 팀명 라벨이 상시 표시되어 팀이 많을 때
  서로 겹쳐 뭉개짐.

### 변경 파일
`approved-landing-v2.js/css`, `mobile-runtime-restore.css`,
`hdps-dashboard.js/css/html`

### 구현
- `index.html`: 세로 5칸 → 가로 막대 5줄로 재설계. 라벨 고정폭 칸,
  막대는 실제 비율로 채움, 수치 우측 정렬.
- `hdps-dashboard.html`: 점의 상시 라벨 제거 → 레벨별 색상 코딩(5색,
  index.html 막대와 동일 팔레트) + 호버/포커스 시에만 툴팁, 범례 추가.

### Commit
`e146879` fix: rebuild both dashboards' Level Map for legibility

## 11. 모바일 반응형 전수 검증

이번 세션 전까지 전혀 검증되지 않았던 영역. `document.body.scrollWidth`
직접 측정(스크린샷 육안 판단에 의존하지 않음) 방식으로 390px 뷰포트
기준 전수 조사.

### 발견/수정
- `index.html` 첫 화면: "알림" 배지, "더보기" 버튼 글자 단위 줄바꿈
  (Level Map과 동일한 원인 패턴) → `white-space:nowrap` 추가.
- AI 챗봇 플로팅 버튼이 실제 스크롤 위치 0에서 "더보기" 기능 버튼을
  물리적으로 가리는 것을 뷰포트 전용 스크린샷으로 확인 → 모바일에서만
  좌측으로 이동.
- `hdps-dashboard.html` 헤더가 552px로 고정되어 페이지 전체가
  572px까지 가로로 밀려나던 것 → 모바일에서 세로 스택 + 비필수 요소
  숨김 처리로 정확히 390px 확보.
- `hdps-dashboard.html`의 KPI 섹션 헤더도 동일 패턴의 줄바꿈 버그.
- 문제점·개선조치 탭: `.amCases`/`.amMaster table`에 가로 스크롤
  컨테이너가 없어 셀마다 글자 단위 줄바꿈 → 탭 전체 높이가 20000px까지
  폭증. 다른 탭처럼 `.amCasesScroll` 컨테이너로 감싸 해결(16500px로
  정상화, 이는 콘텐츠가 많아서 나오는 정상 높이).

### Commit
`892f0f7` fix: mobile-only text wrap and FAB collision, first real mobile QA pass
`0a2dedb` fix: hdps-dashboard.html had zero mobile handling for its own header
`51f059d` fix: 문제점·개선조치 tab caused severe mobile cell text-wrap explosion

## 12. 두 대시보드 테마 통일

### 결정
헤더/메뉴는 이미 양쪽 다 동일 navy 톤이라 통일 대상에서 제외. 실제
갈라지는 지점은 KPI 카드(`index.html` 흰 배경 vs `hdps-dashboard.html`
진한 navy) — `index.html`을 승인된 기준(HANDOFF_README/
CURRENT_BASELINE) 삼아 HDPS 쪽을 흰 카드+색상 포인트로 통일. HDPS
고유 브랜딩(navy 헤더, HD HYUNDAI 로고)은 유지.

### Commit
`9974a60` feat: unify KPI/AI card theme across both dashboards (light, not dark)

## 13. 보안 감사 — 저장형 XSS 3건

### 발견
GMES 업로드 파일이나 등록 폼에서 온 자유 텍스트(workplace/title/
judgeOwner/judgeReason)가 `innerHTML`에 이스케이프 없이 삽입되던 파일
3개:
- `maturity-popup-sync-final.js`
- `maturity-team-case-drilldown.js`
- `maturity-seq-action-link.js`

각 파일에 로컬 `esc()` 헬퍼 추가 후 해당 interpolation 전부 래핑.
오탐 판정한 것: `integrated-performance-map.js`의 팀명(고정 16개 배열만
가능하도록 엄격 검증됨), `action-mail-workflow.js`의 팀명/작업장/문제점
(mailto: 링크 생성용으로 `encodeURIComponent` 처리되어 애초에 HTML
컨텍스트에 들어가지 않음).

### 검증
실제 `<img src=x onerror="window.__xss=true">` 페이로드를 canonical
저장소에 직접 주입 → 해당 팝업을 열어 `window.__xss`가 설정되지 않고
다이얼로그도 뜨지 않음을 확인. DOM에는 이스케이프된 리터럴 텍스트로만
표시됨을 확인.

### Commit
`f475df6` fix(security): stored XSS via unescaped workplace/title/judgeReason fields

## 14. Outlook Web 연동

### 요구사항
"아웃룩 메일과 연동 필요 구현해줘."

### 제약사항 (사용자에게 고지)
정적 GitHub Pages 사이트는 백엔드가 없어 Microsoft Graph API를 통한
실제 자동발송(사용자 대신 메일 전송)은 구현 불가 — OAuth client
secret을 안전하게 보관할 서버가 없고, Azure AD 앱 등록 및 테넌트 관리자
동의도 별도로 필요함. 대신 클라이언트만으로 구현 가능한 Outlook Web
compose 딥링크(`https://outlook.office.com/mail/deeplink/compose`)를
적용 — 기존 `mailto:`와 동일한 신뢰 모델(사용자가 직접 검토 후 전송
버튼을 눌러야 함, 자동발송 없음)을 유지하면서 Outlook 앱/웹으로 바로
연결됨.

### 변경 파일
`action-mail-workflow.js`

### 구현
- `mailFields(c)`로 제목/본문 생성 로직을 공통화해 `openMail()`
  (mailto:)과 `openOutlookWeb()`(Outlook 딥링크)이 동일 내용을 사용.
- 개선요청 현황 테이블의 각 행에 "메일"/"Outlook" 버튼 병기.
- 신규 등록 폼에 "등록 + 메일알림"/"등록 + Outlook 알림" 버튼 병기.
- `register(a, via)`가 `'mailto' | 'outlook' | false`를 받아 라우팅.

### 실행/검증
`window.open()`을 가로채는 방식으로 실제 클릭 시 열리는 URL을 캡처:
`host=outlook.office.com`, `path=/mail/deeplink/compose`, to/subject/
body 파라미터가 정확히 URL 인코딩되어 포함됨을 확인. 7탭 콘솔 에러
0건, CPU 안정성 확인.

### Commit
`a1e7a22` feat: Outlook Web deep-link integration for team-leader notifications

## 15. 검증 방법론 요약

이번 세션 전체에서 일관되게 적용한 원칙:
1. **정적 코드 리뷰로 끝내지 않는다** — 헤드리스 Chromium으로 실제
   렌더링 후 `page.evaluate()`/`getBoundingClientRect()`/
   `document.body.scrollWidth` 등으로 직접 측정.
2. **CPU 프로파일링** — `ps aux`로 렌더러 프로세스 CPU%를 시계열
   샘플링해 무한루프 재발 여부를 숫자로 확인 (스크린샷만으로는
   무한루프를 못 잡음).
3. **실제 페이로드/클릭 테스트** — XSS는 실제 스크립트 페이로드 주입,
   Outlook 연동은 `window.open` 가로채기로 실제 URL 캡처, 팝업은
   Playwright로 실제 클릭 후 행 수/내용 검증.
4. **로컬 sandbox와 실제 GitHub 인프라 이중 검증** — CI 로그와 Pages
   배포 상태를 API로 직접 조회해 로컬 결과와 교차확인.
5. **커밋마다 `git fetch` + `git log origin/main`으로 실제 반영 여부
   재확인** — "커밋했다"와 "반영됐다"를 혼동하지 않음.

## 16. 잔여사항 (다음 세션 후보)

1. 두 대시보드를 계속 별도로 둘지, 최종적으로 통합할지 — 사용자 결정
   대기 중 (현재는 "나중에 검토" 상태 유지).
2. `index.html` 헤더의 실제 기능 컨트롤(기간/공장 선택, 통합기준정보,
   다운로드) vs 참조 이미지의 단순 뱃지 스타일 — 기능을 유지하며
   비주얼만 더 다듬을지 여부.
3. `management.html`, `v2-preview.html` — 독립된 참고용 페이지로 남아
   있음, 정리 대상 포함 여부 미결정.
4. `integrated-performance-map.js`의 팀명 interpolation에 낮은
   우선순위였지만 `esc()` 방어적 적용은 아직 안 함(현재 위험도 낮음,
   원한다면 일관성 차원에서 마저 처리 가능).
5. Outlook 연동은 딥링크 수준까지만 구현됨 — 만약 실제 자동발송이
   꼭 필요하다면 별도 백엔드(Azure Functions 등)와 OAuth 플로우를
   새로 설계해야 하며, 이는 현재 정적 사이트 아키텍처를 벗어나는
   별도 프로젝트 범위임.
