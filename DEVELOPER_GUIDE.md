# 울산캠퍼스 5S 활동관리 시스템 — 개발자 인수인계 가이드

바닐라 JS + localStorage 기반의 정적 웹앱(GitHub Pages로 배포). 빌드 도구·프레임워크 없이 `index.html`에서 130여 개의 `.js` 파일과 14개의 `.css` 파일을 직접 로드합니다. 처음 코드를 인수받는 개발자가 전체 구조를 빠르게 파악할 수 있도록 작성했습니다.

> 과거 작업 세션별 상세 로그(300여 개)는 `docs/session-logs/`로 이동해 보관 중입니다. 특정 기능이 "왜 이렇게 구현됐는지" 배경이 궁금하면 파일명으로 검색해 보세요(예: `AUDIT_ID_INTEGRITY`, `KPI_PARITY` 등).

---

## 1. 빠른 시작

- **로컬 실행**: 별도 빌드 과정 없이, 저장소 루트에서 정적 파일 서버만 띄우면 됩니다(예: `python3 -m http.server`). `index.html`을 열면 바로 동작합니다.
- **배포**: `main` 브랜치에 push하면 GitHub Pages(`https://hastom79-hue.github.io/hd-20/`)가 자동 재배포합니다.
- **데이터**: 모든 데이터는 브라우저 `localStorage`에 저장됩니다(DB 서버 없음). 첫 접속 시 `development-demo-mode.js`가 가상 데이터를 자동 채워 넣습니다. 실 운영 데이터를 쌓으려면 Supabase 연동(`supabase-auth.js`, `supabase-sync.js`)을 켜야 합니다.
- **캐시 무효화**: 모든 `<script src="파일.js?v=날짜-설명-번호">`는 쿼리스트링으로 캐시 버전을 관리합니다. 파일을 수정하면 **반드시 쿼리스트링도 함께 바꿔야** 배포 후 즉시 반영됩니다.

---

## 2. 아키텍처 핵심 개념

### 2.1 스크립트 로딩 — 정적 + 동적 2종 혼합 (★가장 먼저 알아야 할 것)

`index.html`의 `<script src>` 태그(정적 로드)만 보고 "이 파일은 안 쓰이는구나"라고 판단하면 **안 됩니다.** 이 저장소는 런타임에 스크립트를 추가로 삽입하는 동적 로더가 2곳 있습니다.

1. **`final-layout-polish.js`의 `scripts` 배열** — 약 40개 파일을 "index.html에 이미 있으면 건너뛰고, 없으면 내가 로드한다"는 폴백 방식으로 동적 로드합니다. 대부분의 `*-guard.js`, `*-bridge.js`, `*-dedupe-*.js` 계열 파일이 여기 등록되어 있습니다.
2. **`hd20-maturity-map-tab.js` / `maturity-map-drilldown.js` / `dashboard-actions.js`** — 각각 `gmes-5s-case-import.js`, `gmes-5s-judge-ui.js`, `conversion-chart.js`를 `document.createElement('script')`로 직접 삽입합니다.

**파일 삭제 전 체크리스트** (실제로 이 저장소에서 40개를 "미사용"으로 오판해 삭제했다가 404가 나서 즉시 복구한 사례가 있습니다):
```bash
# 1) index.html 정적 로드 확인
grep "파일명.js" index.html
# 2) final-layout-polish.js의 동적 배열 확인
grep "파일명.js" final-layout-polish.js
# 3) 모든 js/html/css 파일에서 문자열 참조 전수 검색
grep -rl "파일명.js" *.js *.html *.css
```
세 검사 모두 "없음"이어야 안전하게 삭제할 수 있습니다.

### 2.2 서브탭 엔진 (`hd20-subtabs.js`)

고도화·표준화, Audit·유지점검, 개선조치·완료관리 탭의 서브탭 전환, 상세 패널 렌더링, 안내 문구(`CONTRACT` 객체)를 전부 이 파일 하나가 담당합니다(가장 큰 파일 중 하나). `MAP` 객체가 각 탭의 서브탭 키·라벨 목록이고, `select(area, sub)` 함수가 실제 화면 전환을 수행합니다. 서브탭을 추가/제거할 때는 `MAP`뿐 아니라 폴백·복원 로직(특정 서브탭 키로 되돌리는 조건문이 여러 곳에 흩어져 있음)도 함께 찾아 고쳐야 합니다.

### 2.3 "guard" 파일들의 성격

`*-guard.js`, `*-dedupe-guard.js`, `*-integrity-guard.js`라는 이름의 파일이 30개 이상 있습니다. 이름이 비슷해 보이지만 **각각 특정 시점에 발견된 서로 다른 버그를 막기 위한 개별 패치**입니다(예: `action-subtab-dedupe-guard.js`는 개선조치 탭의 중복 표시 버그, `audit-subtab-dedupe-guard.js`는 Audit 탭의 것). 이름만 보고 "중복이니 하나로 합쳐도 되겠다"고 판단하지 말고, 반드시 각 파일의 선행 주석과 실제 DOM 대상(`classify()` 함수 등)을 비교한 뒤 결정하세요.

### 2.4 데이터 모델 (localStorage 키)

| 키 | 내용 |
|---|---|
| `hd20GMES5SAutoImproveRawV1` | 자율개선(activity) 레코드 전체 |
| `hd20ActionCasesV2` | 개선요청/개선조치(action) 레코드 전체 — 테마 점검 자동 등록 건도 여기 포함(`source:'테마Audit'`로 구분) |
| `hd20AuditRandomDrawsV1` | Audit 추출·실시 레코드 |
| `hd20TeamLeaderMasterV1` | 생산팀별 팀장·이메일 마스터 |
| `hd20OperatingPolicyV1` | Audit 표본수·Risk 가중치 등 운영정책 |
| `gmes5s_work_factor_master_v1` | 통합기준정보 ④업무/팩터(작업장·세부위치·우선순위·리스크 등) |
| `hd20ThemeAuditChecksV1` | 테마 점검 체크리스트 평가 상태·회차별 재점검 이력 (Supabase canonical payload 동기화) |

### 2.5 주요 전역 객체

- `window.HD20ProductionTeamMaster` — 19개 생산팀 마스터(`team-master-inline.js`가 설정, 다른 많은 파일이 참조)
- `window.HD20KPIData` — 대시보드 KPI 집계 함수 모음
- `window.HD20AdvPhotoGuide` — 고도화 3대 요건 평가 가이드 팝업 열기 함수

---

## 3. 메인 탭 구조 (7개)

| # | 탭 | 주요 파일 |
|---|---|---|
| 1 | 대시보드 | `dashboard-*.js`, `hd20-v3-execution.js`, `hd20-request-board.js`, `hd20-improve-board.js`, `hd20-ops-*.js`, `kpi-modal-bootstrap.js`, `top-kpi-drilldown.js` |
| 2 | 자율개선등록 / 개선조치등록 | `activity-workflow.js`, `action-mail-workflow.js`, `*-register-modal.js`, `landing-launcher.js`(통합조회) |
| 3 | Audit·유지점검 | `audit-*.js` 전체 |
| 4 | 개선조치·완료관리 | `action-leadtime-grid.js`, `action-field-photo-gallery.js`, `hd20-subtabs.js`(렌더링 일부) |
| 5 | 고도화·표준화 | `hd20-maturity-map-tab.js`, `maturity-*.js`, `hd20-adv-photo-guide.js`, `hd20-condition-groups.js`, `hd20-judge-process.js`, `gmes-5s-*.js` |
| 6 | 통합기준정보 | `integrated-master-factors.js`, `hd20-ulsan-workplace-master.js`, `operating-policy-master.js`, `master-info-modal.js`, `team-leader-*.js` |
| 7 | 테마 점검 | `theme-inspection.js` 단독 — 월별·라인별 5S 테마 체크리스트, 미흡 항목 자동으로 개선조치 등록 |

탭 전환·가시성 제어의 단일 소스는 `beginner-navigation.js`(`SCREEN_BY_KEY`, `screens` 매핑)입니다.

---

## 4. 파일 지도 (기능별)

### 진입점 · 부트스트랩
`app.js`(팀 마스터 기본값), `beginner-navigation.js`(탭 전환 엔진), `boot-watchdog.js`(로딩 멈춤 감지), `auto-user-team.js`, `team-master-inline.js`

### 인증 · 동기화
`supabase-auth.js`(사내메일 인증), `supabase-sync.js`(DB 반입/반출, demo 행 제외)

### 가상 데이터 · 검증
`development-demo-mode.js`(일반 접속 시 가상 데이터 시드), `web-validation-fixture.js`(`?validation=1` 전용 대량 검증 데이터)

### 대시보드
`dashboard-actions.js`, `dashboard-download-final.js`, `dashboard-grid-drilldown.js`, `dashboard-kpi-formula-legend.js`, `dashboard-kpi-source.js`, `dashboard-operational-bridge.js`, `dashboard-ops-trend.js`, `dashboard-priority-layout.js`, `dashboard-section-tabs.js`, `dashboard-side-summary.js`, `dashboard-subnav-single-owner-guard.js`, `dashboard-work-kpi-migration.js`, `hd20-v3-execution.js`(4번 섹션), `hd20-request-board.js`(3번 섹션), `hd20-improve-board.js`(2번 섹션), `hd20-ops-normalized.js`, `hd20-ops-v2.js`, `hd20-ops-production-filter-guard.js`, `hd20-kpi-evidence-drill.js`, `hd20-kpi-parity-guard.js`, `hd20-canonical-grid-guard.js`, `kpi-modal-bootstrap.js`, `top-kpi-drilldown.js`, `maturity-dashboard-panel-bridge.js`, `conversion-chart.js`(동적 로드), `integrated-performance-map.js`

### 자율개선 / 개선조치 등록
`activity-workflow.js`(등록 폼 본체), `action-mail-workflow.js`(등록 폼 본체 + 메일 발송), `activity-register-modal.js` / `action-register-modal.js`(모달 뼈대), `activity-excel-preview-import.js` / `team-leader-excel-import.js`(엑셀 가져오기), `activity-import-analysis-mail-preview.js`, `activity-import-db-readiness-guard.js`, `activity-seoul-date-guard.js`, `activity-dynamic-chart.js`, `landing-launcher.js`(초기 팝업·통합조회), `workflow-crud.js`, `table-enhance-suite.js`(모든 표 공용 검색·정렬·페이지네이션), `action-leadtime-grid.js`, `action-field-photo-gallery.js`, `hd20-action-summary-evidence.js`, `hd20-action-verify-canonical-guard.js`

### Audit · 유지점검
`audit-random-draw.js`(표본 추출), `audit-batch-execution.js` / `audit-canonical-execution.js`(실시), `audit-checklist-master.js` / `audit-checklist-enhance.js` / `audit-taxonomy-guard.js`(점검항목), `audit-closed-loop-workflow.js`(실시·이력), `audit-six-month-control.js`(6개월 유지관리), `audit-close-evaluation.js`(종료평가), `audit-summary-drilldown.js`, `audit-action-auto-link.js`(RETIRED — 호환 쉼), `hd20-audit-action-pending-guard.js`

### 고도화 · 표준화 / 테마 점검
`hd20-subtabs.js`(서브탭 엔진 겸 대부분의 렌더링), `hd20-maturity-map-tab.js`, `maturity-map-drilldown.js`, `maturity-map-official-case-link.js`, `maturity-team-case-drilldown.js`, `maturity-popup-sync-final.js`, `maturity-condition-analysis.js`(현재 미로드·보존 중, 7절 참고), `hd20-condition-groups.js`, `hd20-judge-process.js`, `hd20-adv-photo-guide.js`(3대 요건 평가 가이드 팝업), `hd20-direct-criteria.js`, `hd20-master-access.js`, `criteria-hover.js`, `criteria-popup-final-repair.js`, `gmes-5s-case-import.js` / `gmes-5s-judge-ui.js`(동적 로드), `gmes-5s-judge-flow-polish.js`, `advancement-owner-visibility-guard.js`, `advancement-subtab-dedupe-guard.js`, `theme-inspection.js`(테마 점검 탭 전체)

### 통합기준정보
`integrated-master-factors.js`(조직/팀·인당목표·요청그룹·발굴출처·업무팩터), `hd20-ulsan-workplace-master.js`, `operating-policy-master.js`, `hd20-policy-config.js`, `master-info-modal.js`, `master-context-final.js`, `team-leader-master.js`, `team-master-safety.js`, `request-source-order-master.js`

### 공용 안전장치 · 유틸리티
`modal-safety.js`(패널 가시성 강제 숨김/표시 규칙), `mo-throttle.js`(MutationObserver 호출 묶음), `nav-scroll-stability.js`, `app-visibility-failsafe.js`, `new-entry-emphasis.js`, `final-layout-polish.js`(동적 스크립트 로더 + 레거시 정리), `hd20-cross-tab-sync.js`, `hd20-workflow-sequence-guard.js`, `hd20-modal-layer-guard.js`, `hd20-trace-exact.js` / `hd20-trace-production-guard.js` / `hd20-trace-backlink-guard.js`, `hd20-native-production-guard.js`, `hd20-operational-integrity.js`, `hd20-db-production-health.js`, `hd20-live-data-refresh-guard.js`, `hd20-batch-snapshot-guard.js`, `hd20-retention-*.js`(5개, 유지관리 추적), `action-audit-linkage.js`, `action-*-integrity-guard.js`(3개), `audit-id-integrity-guard.js`, `*-subtab-dedupe-guard.js`(4개, 2.3절 참고), `hd20-five-area-integration.js`, `performance-conversion-analysis.js`, `expert-chatbot-final.js`, `health-grid-practical-final.js`, `print-handler.js`, `emailjs-config.js`

### 독립 페이지
`hdps-dashboard.html` / `hdps-dashboard.js` / `hdps-dashboard.css` — `index.html`과 무관하게 존재하는 별도 대시보드 페이지. 메인 앱 어디서도 링크되지 않음(용도·필요 여부 확인 후 정리 권장).

---

## 5. CSS 파일

| 파일 | 범위 |
|---|---|
| `styles.css` | 기본 전역 스타일 |
| `hd22-theme.css` | 색상·타이포그래피 토큰 |
| `hd20-subtabs.css` | 서브탭 공용 레이아웃 |
| `hd20-overhaul.css`, `integrated-master-redesign.css`, `workflow-area-density.css`, `dashboard-priority-groups.css`, `new-entry-emphasis.css` | 특정 화면 재설계분 |
| `hd20-five-area.css` | 고도화 맵 관련 |
| `hd20-ops-v2.css` | 대시보드 KPI 카드 |
| `activity-detail-dialog.css` | 상세조회 모달 |
| `print-styles.css` | 인쇄 전용 |
| `supabase-auth.css` | 인증 게이트 화면(압축된 한 줄 CSS) |
| `hdps-dashboard.css` | 독립 페이지 전용 |

---

## 6. 문서 구조

- `README.md` / `README_OVERHAUL_20260902.md` — 과거 프로토타입 이력 + 전면개편 기준. **업무 로직 배경을 찾을 때 참고.**
- `ARCHITECTURE.md`, `DEVELOPMENT_LOG.md` — 아키텍처·개발 이력 핵심 문서(계속 유지).
- `DEVELOPER_GUIDE.md`(본 문서) — 파일 지도와 로딩 아키텍처 중심의 신규 인수인계 가이드.
- `docs/session-logs/`(303개) — 과거 각 작업 세션의 상세 변경 기록. 특정 버그가 "왜 이 파일에서 이렇게 고쳐졌는지" 찾을 때 파일명으로 검색(예: `grep -l "KPI_PARITY" docs/session-logs/*.md`).

---

## 7. 알려진 정리 대상 · 주의사항

- `maturity-condition-analysis.js`: `hd20-condition-groups.js`가 이 파일의 전역 함수를 호출하지만 파일 자체는 어디서도 로드되지 않는 "끊어진 링크" 가능성 — 의도적으로 로드를 빼먹은 것인지, 애초에 미완성 기능인지 확인 필요.
- `hdps-dashboard.*` 3종: 독립 페이지의 용도(실제 사용 중인지, 보존해야 하는지) 확인 필요.
- `*-guard.js` 계열 30여 개: 대부분 과거 특정 버그에 대한 점 패치. 상당수가 더 포괄적인 후속 수정(`hd20-subtabs.js` 등)으로 사실상 무력화됐을 가능성이 있으나, 코드 레벨 전수 분석 없이는 단정할 수 없어 보존 중. 리팩토링 시 우선순위 후보.
- 루트의 `CODING_LOG_*.md`·`DEVELOPMENT_LOG_날짜_*.md`·`WORKLOG_*.md` 등 300여 개 세션 로그는 `docs/session-logs/`로 이동 완료(이 정리 작업 자체의 변경 이력).

### 고도화 최종 채택 자동 선택
- 고도화 등록 화면의 3대 요건 중 1개 이상을 선택하면, 마스터 권한 사용자의 최종 채택 체크박스가 자동 선택됩니다.
- 3개 요건이 모두 미선택이면 최종 채택은 자동 해제됩니다. 비마스터 권한 제한은 유지됩니다.
- 공통 판정 로직은 \`hd20-direct-criteria.js\`의 \`bind()\`에서 처리합니다.
