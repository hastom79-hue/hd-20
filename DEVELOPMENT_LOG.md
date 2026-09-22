# HD-20 5S 활동관리 시스템 — 개발일지

> 목적: 반복 수정 과정에서 요구사항·구현·검증 이력이 유실되지 않도록 현재 운영본의 개발 기준과 승인된 UI/UX 원칙을 기록한다.
> 최초 기준일: 2026-08-27
> 최신 기준일: 2026-09-02
> 운영 저장소: `hastom79-hue/hd-20`

> **현재 기준 우선순위**: 아래 2026-08-26~27 기록은 당시 개발 이력으로 보존한다. `1개월 점검 → 3개월 AUDIT → 6개월 AUDIT`, 7개 업무탭, 과거 Demo/가정 KPI 등은 현재 운영기준이 아니며, 2026-09-02 이후 Change Log와 `README_OVERHAUL_20260902.md`가 충돌 시 우선한다.

## 1. 프로젝트 목적
울산캠퍼스의 5S 활동을 단순 실적 집계가 아니라 **개선활동 → 고도화 후보 → 공식 판정 → 유지·Audit → 개선조치 → 효과검증·재발관리**까지 하나의 흐름으로 관리하는 웹 기반 Prototype을 구축한다.

## 2. 최종 화면/업무 원칙
### 대시보드 정보 위계
1. 핵심 성과 및 운영현황
2. 고도화 작업장 3대 판정기준 및 조건충족 수준
3. Audit 후 6개월 지속관리
4. 개선조치·효과검증·재발
5. 상세 Raw Data

**먼저 보여줄 정보는 상단, 상세/Raw Data는 하단**에 배치한다. 승인된 첫 페이지의 정보·수치·업무구조는 개별 디자인/기능 추가 시 임의 변경하지 않는다.

### 정보 LOCK / 디자인 분리 원칙
외부 또는 참고 Dashboard 이미지는 **디자인 언어만 참고**한다. 기존 5S 시스템의 KPI, 명칭, 수치, 판정기준, 프로세스, 데이터 의미를 다른 시스템 정보와 혼합하지 않는다.

허용되는 변경 예: Dark Navy 배경, Glass/Glow 카드, Neon Accent, 숫자 강조, Hover/Click/Ripple, Mini Chart/Sparkline, Trend Badge, 카드 깊이감.

금지되는 변경 예: GMES 과제관리 KPI를 5S KPI와 혼합, 승인된 KPI 명칭 변경, 임의 수치 생성, 업무 프로세스 변경.

## 3. 고도화 작업장 관리기준
### 3대 판정/성과분석 기준
- 시각화·형적관리
- 인간공학적 Green Zone
- 정량축소·정위치 변경을 통한 공간 활용

성과분석은 **정확히 1개 조건 충족 / 정확히 2개 조건 충족 / 3개 모두 충족**으로 구분한다. `2개 이상` 누적값이 필요할 경우에만 2조건+3조건으로 별도 계산한다.

현장 등록과 공식 판정은 분리하며 공식 판정주체는 **생산혁신팀 + 5S 모듈**이다.

### 현재 Audit 유지 프로세스
과거 `후보 발굴 → 고도화 인정 → 1개월 점검 → 3개월 AUDIT → 6개월 AUDIT → 수평전개`는 Historical 기준으로만 보존한다.

현재 기준은 다음과 같다.

`Risk 가중 랜덤 Audit 대상 추출 → 실제 Audit 실시(D-Day) → 실시일 기준 6개월 지속관리 → 개선조치/효과검증 → 종료평가 → 차기 Audit Risk 반영`

## 4. 대시보드 KPI 및 Trend 표현
상단 핵심 KPI는 Canonical Source에서 계산하며 실제 원천값이 없는 경우 임의 숫자를 생성하지 않는다.

각 KPI 카드는 단일 현재값만 보여주는 카드가 아니라 값의 Trend 변화를 함께 표현할 수 있다. 현재값 + 전월/전기 대비 증감 + Mini Sparkline/Trend Chart를 조합하되, Trend 값은 실제 데이터 Source가 없는 상태에서 운영수치로 확정하지 않는다.

운영지표의 `6개월 유지율`은 **Audit 실시 후 6개월 관리 종료 대상의 유지성과**로 정의한다.

## 5. Drill-down / 상세 Grid 원칙
요약 KPI, 상단 KPI, 하단 운영 KPI, Portfolio Map, 월별 추이, Audit 요약 등 집계정보는 클릭 시 본문을 밀어내지 않고 **Modal Popup 형태의 상세 Grid**를 표시한다.

Modal은 페이지 로딩 시 사용할 수 있도록 선제 준비하고, 다른 기능을 먼저 클릭해야 생성되는 의존구조를 만들지 않는다. 닫기 버튼, 배경 클릭, ESC 닫기를 지원하며 상세 Grid에서는 가능한 경우 Raw Data CSV 추출을 제공한다.

## 6. 주요 구현 기능
### 6.1 5S 활동관리
- 활동 신규등록/조회/수정/삭제
- 접속 사용자 소속팀 자동 지정 구조
- Excel/Raw Data 활용 및 추출 기능
- 6개 활동유형: 정리/정돈/청소/시각화/위험구역관리/5S 고도화

### 6.2 고도화·판정
- 후보 발굴 및 판정 현황
- 현장등록과 공식확정 분리
- 1/2/3 조건 충족 Portfolio
- 조건 충족 × 작업장/라인 적용범위 분석
- 라인 원천정보 없는 경우 임의 추정 금지

### 6.3 Audit
- Risk 가중 랜덤 대상 자동추출
- 실제 Audit 실시일 등록
- Audit 실시일 기준 달력 +6개월 지속관리
- 개선요청 발생 시 개선조치 Case 자동연결
- 종료평가 및 차기 Risk 반영

### 6.4 문제점·개선조치
- 문제점/개선요청 등록
- 등록일 기준 D+7~D+14 자동 Deadline 범위
- BEFORE 현장사진
- 생산팀장 이메일 연계
- 조치사항 등록
- AFTER 현장사진
- 효과검증
- 재발여부 및 이력 관리

### 6.5 생산팀장 정보
- 팀장 이름 및 이메일 Excel 일괄등록
- 개선조치 메일 Workflow와 연계

## 7. 시스템 운영관리 AI 챗봇
챗봇은 단순 범용 AI가 아니라 **5S 시스템 운영관리 전문가** 역할을 부여한다.

핵심 역할:
- 시스템 사용방법 가이드
- 주요 Q&A
- 일일 운영점검 가이드
- KPI 이상치 및 상태 점검 가이드
- 고도화 후보→공식판정 정체 건 확인
- Audit 6개월 지속관리 이상건 확인
- 개선조치 기한경과 확인
- 조건부/부적합 미조치 확인
- 생산팀장 개선조치 회신 지연 확인
- 기준정보/Master 누락 및 데이터 이상 원인 확인
- 오류 접수 및 오류 이력관리

UI는 사용자가 제시한 GMES Help 형태를 참고해 **우측 하단 Floating Help 버튼 → 팝업 패널 → 주요 Q&A / 오류접수 / 오류이력** 구조를 기본으로 한다. 현재 오류이력은 정적 GitHub Pages 환경 특성상 브라우저 LocalStorage 기반이다. Prototype 단계에서는 실제 서버/DB를 AI가 실시간 감시한다고 표현하지 않는다.

## 8. 디자인 승인 방향
### Dark Dashboard Design
참고 시안을 기반으로 다음 디자인 효과를 적용하는 방향을 승인한다.
- Deep Navy / Indigo 계열 Dashboard 배경
- Glassmorphism / 반투명 Panel
- Blue / Orange / Green / Purple KPI Accent
- 카드별 Glow와 Border Highlight
- KPI 숫자 대형화 및 시각적 계층 강화
- Icon Tile 입체화
- Hover 시 Lift / Glow
- Click Ripple / Feedback
- 단계별 Accent
- 하단 KPI 카드 Mini Chart / Sparkline / Trend Badge
- 상세 Grid 버튼의 명확한 Affordance

중요: **디자인만 변경하며 정보·수치·업무 의미는 LOCK한다.**

## 9. 주요 회귀문제와 대응
### 레이아웃 회귀
반복적인 기능 추가 과정에서 기존 대시보드 DOM을 숨기거나 이동시키면서 Portfolio/추이/Raw Data가 사라지는 문제가 발생했다. 이후 승인 레이아웃을 잠그고 필요한 기능만 복원하는 방향으로 변경했다.

### 클릭 기능 회귀
화면은 존재하지만 DOM 이동/숨김 또는 Modal 생성 순서 때문에 Drill-down이 작동하지 않는 문제가 있었다. Navigation/Modal Boot 구조를 회귀검증 대상으로 유지한다.

### GitHub 반영 검증
커밋 성공 메시지만으로 배포 완료를 판단하지 않는다.

`수정 → 작업 브랜치 Commit → 코드 재조회 → Runtime Smoke → Browser Smoke → 문서기록 → 사용자 승인 → main 반영/배포`

사용자가 실제 화면에서 반영되지 않았다고 확인한 경우 GitHub Commit 성공 여부와 별개로 완료 처리하지 않는다.

## 10. 운영 파일 관리 원칙
Prototype/Hotfix/Guard 파일이 증가했으므로 파일명만 보고 삭제하지 않는다. 현재 `index.html`이 로드하거나 다른 운영 기능이 의존하는 파일은 운영파일로 간주한다.

과거 Preview/구형 Dashboard 등 미사용 파일은 즉시 삭제하기보다 `/archive/legacy/`로 이동 후 일정 기간 보존하는 것을 원칙으로 한다. 정리 전 반드시 `index.html` 및 코드 참조 여부를 확인한다.

## 11. 현재 주요 운영/개편 스크립트
- `app.js`
- `activity-workflow.js`
- `activity-dynamic-chart.js`
- `auto-user-team.js`
- `workflow-crud.js`
- `audit-admin-import.js`
- `audit-global-seed.js`
- `audit-checklist-enhance.js`
- `action-mail-workflow.js`
- `action-button-hotfix.js`
- `action-leadtime-grid.js`
- `action-field-photo-gallery.js`
- `team-leader-excel-import.js`
- `top-kpi-drilldown.js`
- `expert-chatbot-final.js`
- `approved-landing-v2.js`
- `hd20-five-area-integration.js`
- `hd20-five-area.css`
- `hd20-overhaul.css`
- `maturity-condition-analysis.js`
- `maturity-condition-analysis.css`
- `audit-random-draw.js`
- `audit-six-month-control.js`
- `audit-closed-loop-workflow.js`
- `audit-action-auto-link.js`
- `audit-action-case-trace.js`
- `dashboard-operational-bridge.js`
- `legacy-lifecycle-retire.js`
- `final-layout-polish.js`

※ 실제 운영 여부는 항상 최신 `index.html` 및 동적 Boot Loader의 로딩 상태를 최종 기준으로 판단한다.

## 12. 데이터 관련 주의사항
Canonical Store는 다음을 기준으로 한다.

- 5S/고도화: `hd20GMES5SAutoImproveRawV1`
- 개선조치: `hd20ActionCasesV2`
- Audit 추출/실시: `hd20AuditRandomDrawsV1`

실제 원천정보가 없는 Headcount/라인/성과수치는 임의 생성하지 않는다. 라인 실적은 명시된 라인 필드가 있을 때만 집계한다.

## 13. 향후 개발 시 금지사항
- 승인된 첫 페이지 전체 레이아웃을 기능 추가 때마다 재설계하지 않는다.
- 참고 이미지의 업무정보를 현재 시스템 데이터와 섞지 않는다.
- 요약정보 클릭 시 페이지 하단에 상세 Grid를 추가하지 않는다. Modal을 사용한다.
- 점수만으로 고도화 작업장 상태를 정의하지 않는다.
- 기존 기능을 삭제하거나 숨기기 전에 의존관계를 확인한다.
- 실제 근거 없는 Trend/성과 수치를 운영값으로 확정하지 않는다.
- GitHub Commit 생성만 확인하고 '배포 완료'라고 판단하지 않는다.
- `action-demo-seed.js` 등 시연 데이터가 운영 KPI/Lead Time/Grid에 자동주입되도록 두지 않는다.
- 폐기된 `1개월/3개월/6개월 Audit`을 현재 운영기준으로 복원하지 않는다.
- 승인되지 않은 Risk 가중계수나 D+7/D+10/D+14 분류규칙을 정식 업무규칙으로 고정하지 않는다.

## 14. 개발일지 기록 규칙
중요 변경은 아래 형식으로 하단에 누적한다.

```text
### YYYY-MM-DD HH:MM KST / 변경 제목
- 요구사항:
- 변경 파일:
- 구현 내용:
- 회귀검증:
- GitHub Commit:
- 잔여사항:
```

---

## Change Log

### 2026-08-26 / 대시보드 구조 및 Drill-down 안정화
- 승인된 Dashboard 정보 위계 확정
- Portfolio Map/월별 추이/Raw Data 복원
- 상단 및 하단 KPI, Map/추이 클릭 상세 Modal Grid 원칙 확정
- Raw Data CSV 추출 연결
- Modal 선제 생성 필요성 반영
- 업무 메뉴 Routing Guard 추가

### 2026-08-26 / Audit 및 개선조치 Workflow 보강
- 당시 기준 Audit 1~5점 클릭 평가 및 자동판정
- Audit Excel/Admin 관리 기능 보강
- 문제점 → 생산팀장 메일 → 조치 → AFTER 사진 흐름 구현
- 생산팀장 이름/메일 Excel 일괄등록 기능 반영
- ※ 1/3/6개월 Lifecycle은 2026-09-02 기준으로 폐기됨.

### 2026-08-26 / 시스템 운영관리 AI 챗봇 고도화
- 시스템 사용 가이드 챗봇 추가
- 주요 Q&A / 오류접수 / 오류이력 UI 구성
- 시스템 운영관리 전문가 역할 부여
- 일일 운영점검, KPI 이상, Audit 기한, 미조치, Master 이상 점검 가이드 추가
- 오류 접수번호 및 LocalStorage 기반 오류이력 관리

### 2026-08-26 / Dashboard 디자인 고도화 방향 승인
- 기존 정보·수치·업무구조 LOCK
- 참고 Dashboard에서는 디자인 효과만 차용하는 원칙 확정
- Dark Navy / Glass / Glow / Neon Accent 방향 승인
- KPI 카드의 현재값과 함께 Trend 변화 표현 요구 반영
- 전월/전기 대비 증감 + Mini Sparkline/Trend Chart 구성 방향 승인
- 하단 성과 카드의 Hover/Click/Trend 시각효과 강화

### 2026-08-26 / GitHub 배포 검증 강화
- Commit 성공만으로 완료 판단 금지
- 파일 재조회 및 index.html 실제 로딩 여부 확인
- 실제 코드 존재 확인 후 완료 통보
- 가능할 경우 Pages 렌더링까지 추가 확인

### 2026-08-26 / 저장소 정리 검토
- 운영파일과 과거 Preview/Legacy 파일 혼재 확인
- 운영 의존 파일은 유지
- 미사용 구형 파일은 삭제보다 `/archive/legacy/` 이동 우선

### 2026-08-27 18:43 KST / 긴급 구동 복원 및 승인 시안 2 첫 화면 재적용
- 요구사항: HD-20이 구동되지 않는 상태를 즉시 복원하고, 이전에 승인된 2번 시안을 첫 페이지 대시보드에 다시 정확히 반영한다.
- 안전조치: 장애 상태 전체를 `backup-broken-runtime-20260827-1843` 브랜치에 보존.
- 복원 기준: 검증된 Design 2 안정화 체크포인트 `f41629693d67d01a3742aa29b5a4043e62fa5119`.
- 변경 파일: `approved-landing-v2.css`, `approved-landing-v2.js`, `beginner-navigation.js`.
- 구현 내용: 승인 첫 화면 CSS/JS 재생성, Dashboard 메뉴 복귀대상 연결, 당시 Lifecycle Source 연결 유지.
- 실행/검증: `bfc4d7f5ce0a0e34bf07bce8c527e442fa1ed061`, `58cefc1368376bea6126909ccd08f05358c27e0f`, `b8b4ab11ce4c900acffa2014367c402f2a09259e`.

### 2026-08-27 19:50 KST / 자동 Runtime Smoke 검증 도입
- 변경 파일: `.github/workflows/runtime-smoke.yml`.
- 구현 내용: 전체 JavaScript 구문검증, index 로컬 script 존재여부, 승인화면 Boot Path, 당시 7개 Navigation Contract 검증.
- 최초 실행에서 기존 `activity-dynamic-chart.js` 구문오류 검출.
- GitHub Commit: `dc4594f79c7f0cbda25e5368d5c40a441560dfab`.
- ※ Navigation Contract는 2026-09-02부터 5개 영역으로 변경됨.

### 2026-08-27 19:52 KST / 개선조치 Demo 자동주입 차단
- 변경 파일: `action-demo-seed.js`.
- 구현 내용: `hd20ActionCasesV2`가 비어 있을 때 Demo 8건 자동생성 차단, 기존 브라우저 데이터는 삭제하지 않음.
- GitHub Commit: `c63015723bcf4b6f34bda48057164133cd0593a3`.

### 2026-08-27 19:54 KST / 5S 활동 동적차트 구문오류 긴급수정
- 변경 파일: `activity-dynamic-chart.js`.
- 원인: `render()` 함수 종료부 중복 닫힘 괄호.
- 구현 내용: 중복 종료 괄호 제거.
- GitHub Commit: `de9667188526d715ffbe6d1a919dae784d70b1b0`.
- 회귀검증: Runtime Smoke 성공, Package workflow 성공.

### 2026-08-27 19:58 KST / 개선조치 저장원천 단일화 및 Hotfix Polling 제거
- 변경 파일: `action-button-hotfix.js`.
- 구현 내용: 저장키 `hd20ActionCasesV2` 통일, startDate/targetDate/created 기록, `hd20-action-updated` 이벤트, 100ms setInterval/무제한 MutationObserver 제거.
- GitHub Commit: `ff1817377f66d33229455bf8ca72b690d77b57a2`.
- 회귀검증: Runtime Smoke 성공, Package workflow 성공.

### 2026-08-27 20:01 KST / 개선조치 예상·실제 해결 Lead Time Grid 복원
- 변경 파일: `action-leadtime-grid.js`, `index.html`.
- 예상 LT/실제 LT/계획대비/상태 계산 복원.
- GitHub Commit: `b21e97481cf7dd303ff05334fc49535fd89d7001`, `16d62ca80a31ed9111b52e6023a207a822a0687c`.
- 회귀검증: Runtime Smoke 성공, Package workflow 성공, GitHub Pages build/deployment 성공.

### 2026-08-27 20:05 KST / 개선조치 등록·완료와 Lead Time Grid End-to-End 연결
- 변경 파일: `action-mail-workflow.js`.
- 구현 내용: 신규 등록 시 startDate/targetDate 저장, 완료회신 doneDate 유지, `hd20-action-updated` 이벤트로 Grid 재계산.
- GitHub Commit: `e84cd862948ab5304e48457f7c09d738b02dfd6b`.
- 회귀검증: Runtime Smoke 성공, Package workflow 성공.

### 2026-09-02 / HD-20 전면개편 5개 영역 IA 확정 및 구현 착수
- 요구사항: 모든 탭을 기능·구조·시각 측면에서 전면 재구성하며 필요 시 병합한다. 메인 대시보드 레이아웃은 회귀시키지 않는다.
- 현재 IA: `통합 대시보드 / 5S 활동 / 고도화·판정 / 유지·Audit / 개선조치` 5개 영역.
- `통합기준정보`는 상단 Utility로 이동.
- 변경 파일: `beginner-navigation.js`, `hd20-five-area-integration.js`, `hd20-five-area.css`, `hd20-overhaul.css`, `final-layout-polish.js`.
- 구현 내용: 기존 7탭을 5개 업무영역으로 런타임 재구성하고 구형 deep-link를 새 영역으로 매핑.
- main 상태: 개편 브랜치 `hd20-overhaul-20260902`에서만 진행, main 미병합.

### 2026-09-02 / 고도화 조건 충족 × 적용범위 분석 구현
- 요구사항: 고도화 성과를 1조건/2조건/3조건 모두 충족으로 구분하고 작업장·라인 적용범위 및 현상/분석결과를 도출한다.
- 변경 파일: `maturity-condition-analysis.js`, `maturity-condition-analysis.css`.
- 구현 내용:
  - 3대 기준 개별 Boolean 상태와 충족수 0~3 계산.
  - 정확 1/2/3조건 비중을 중복 없이 집계.
  - 명시된 라인 필드가 있을 때만 라인 실적 집계.
  - 작업장명 문자열로 라인을 임의 추정하지 않음.
  - 분석문장은 실제 집계값 기반 Deterministic Rule로 생성.
  - 3번째 기준명을 `정량축소·정위치 변경을 통한 공간 활용`으로 정정.
- 잔여사항: 공식 고도화 확정정책과 조건충족 Portfolio는 별도 개념으로 유지.

### 2026-09-02 / Audit 대상 Risk 가중 랜덤 자동추출
- 요구사항: Audit 대상 자동 랜덤 추출. 전월/누적 개선요청이 많은 생산현장팀은 선택확률을 높인다.
- 변경 파일: `audit-random-draw.js`.
- 구현 내용: Eligible 팀 대상 랜덤 추출 + 개선요청/기한경과/재발이력을 Risk 입력으로 연결.
- 중요: 정확한 Risk 가중계수는 아직 승인된 업무규칙이 아니므로 향후 Master/정책값으로 외부화 대상.

### 2026-09-02 / 고정 M+1/M+3/M+6 폐기 및 Audit 실시일 기준 6개월 지속관리
- 요구사항: Audit 실시 후부터 6개월간 지속점검.
- 변경 파일: `audit-six-month-control.js`, `audit-closed-loop-workflow.js`, `master-context-final.js`, `dashboard-kpi-source.js`, `health-grid-practical-final.js`.
- 구현 내용:
  - 기준일을 실제 Audit 실시일(D-Day)로 통일.
  - 기존 추출일/고도화 확정일 기준 사용 금지.
  - 183일 고정값 대신 달력 기준 +6개월 계산.
  - `1개월 점검/3개월 Audit/6개월 Audit` 고정 Lifecycle을 폐기.
  - KPI `6개월 유지율`을 `Audit 후 6개월 유지율` 의미로 변경.
- 회귀검증: 새 Runtime Smoke 계약에 반영.

### 2026-09-02 / 개선요청 등록일 기준 D+7~D+14 자동기한
- 요구사항: 개선요청은 등록일로부터 최소 1주, 최대 2주 안에 보완되도록 자동 Deadline 지정.
- 변경 파일: `audit-action-auto-link.js`, `audit-six-month-control.js`, `audit-closed-loop-workflow.js`.
- 구현 내용: 등록일/자동기한/잔여·경과/상태를 Canonical Action Case에 연결.
- 중요: 7~14일 중 정확한 일수 선정 로직은 별도 승인 전 임의 업무정책으로 고정하지 않는다.

### 2026-09-02 / Audit ↔ 개선조치 동일 Case 폐쇄루프 연결
- 요구사항: Audit 개선요청과 개선조치를 같은 Case로 추적하고 BEFORE→조치→AFTER→효과검증→재발을 양 화면에서 동일하게 본다.
- 변경 파일: `audit-action-case-trace.js`, `audit-closed-loop-workflow.js`, `action-field-photo-gallery.js`, `final-layout-polish.js`.
- 구현 내용:
  - Audit `sourceCaseId` 기반 개선조치 Case 1:1 연결.
  - BEFORE/AFTER Evidence, 실제 조치내용, 완료일, 효과검증, 재발여부를 동일 Store에 저장.
  - 효과검증 전 단순 종결하지 않고 효과확인 대기로 구분.

### 2026-09-02 / 메인 대시보드 운영 폐쇄루프 연결
- 변경 파일: `dashboard-operational-bridge.js`, `final-layout-polish.js`.
- 구현 내용: 3조건 모두 충족 작업장, 2조건 충족 라인, Audit 6개월 관리중, 개선조치 미완료, 기한경과, 재발을 동일 화면에서 확인하도록 연결.
- 데이터 원칙: 실제 Canonical Store만 사용하며 임의 KPI 생성 금지.

### 2026-09-02 / 5개 영역 Runtime/Browser Smoke 재정의
- 변경 파일: `.github/workflows/runtime-smoke.yml`, `.github/workflows/browser-smoke.yml`.
- 구현 내용:
  - 기존 7탭 계약 제거, 5개 영역 Navigation Contract 적용.
  - 고정 1M/3M/6M Lifecycle 검증 제거.
  - Audit 실시일 + 달력 6개월 + D+7~D+14 + 3대 조건 정확명칭 검증 추가.
  - Browser Smoke에서 5개 영역 실제 순차 Click 전환 검증.
- 1차 Browser 실패 원인: HD-20 화면 오류가 아니라 테스트 스크립트 자체의 JavaScript 문법오류.
- 수정 Commit: `1b3a5be0c2fc29ef9075afdedb5cd0fa2857ccd8`.
- 검증결과: Runtime Smoke 성공, 수정 후 Browser Smoke **성공**.

### 2026-09-02 / 구형 Lifecycle 화면표현 Retirement
- 변경 파일: `legacy-lifecycle-retire.js`, `final-layout-polish.js`.
- 구현 내용: 대시보드에 남은 `1개월/3개월/6개월 AUDIT` 표현을 현재 기준인 `Audit 후 6개월 관리중/관리종료/재발`, `Audit 실시대기/개선조치 미완료/기한경과/재발`로 치환.
- 목적: 과거 정적 마크업이 남아 있어도 사용자 화면에서 폐기된 운영기준을 다시 노출하지 않도록 보호.

### 2026-09-02 / 전면개편 README 기준문서 생성 및 문서관리 규칙 강화
- 요구사항: 시스템에 실제 반영하면서 작업하고 개발일지/README를 누락 없이 남긴다.
- 변경 파일: `README_OVERHAUL_20260902.md`, `DEVELOPMENT_LOG.md`.
- 구현 내용:
  - 기존 README의 Historical 이력을 삭제하지 않고 현재 개편 기준 README를 별도 생성.
  - 개발일지 상단에 현재 우선기준과 과거 1/3/6개월 기준의 폐기상태 명시.
  - 이후 모든 변경은 코드 구현/검증/문서 기록을 한 세트로 관리.
- README Commit: `11d5b13d75aa156061b1fbfeaf52f444f073434b`.
- 잔여사항: 정적 `index.html` 원본의 7탭/구형 Lifecycle 마크업 자체를 안전하게 5개 영역 기준으로 정리한 뒤 Runtime/Browser Smoke 재검증.

### 2026-09-22 / 가상데이터 검증 파이프라인·팀마스터 개편·인증 간소화·서브탭 세분화
- 요구사항: 오프라인 검증용 가상데이터 제공, 실제 화면오류 재현·수정, 사용자 지정
  순서로 팀 마스터 재구성, Supabase 비밀번호 로그인 단계 삭제(사내메일 인증은 유지),
  정보과잉으로 지목된 서브탭 세분화.
- 변경 파일: `web-validation-fixture.js`, `hd20-native-production-guard.js`,
  `dashboard-kpi-source.js`, `app.js`, `index.html`, `supabase-auth.js`,
  `hd20-overhaul.css`, `hd20-subtabs.js`, `hd20-ops-v2.js`,
  `{audit,advancement,action}-subtab-dedupe-guard.js`, `audit-close-evaluation.js`,
  `action-leadtime-grid.js`, `table-enhance-suite.js`, `final-layout-polish.js`.
- 구현 내용:
  - `?validation=1`(960/320/640건, `&scale=1~5`, `&edge=1`) 가상데이터, 원본
    자동 백업/복구, Supabase 동기화 격리.
  - Audit 실시일 없는 건이 "관리중"으로 오분류되던 버그와, 검증데이터가
    `isNonProdRow` 필터에 걸려 화면에 안 보이던 버그 수정.
  - `<html>`의 `hd20-auth-pending` 클래스 누락으로 로그인 게이트가 대시보드를
    뒤늦게 덮던 FOUC 버그 수정.
  - 팀 마스터를 순서+조립1팀/2팀 그룹 구조로 재정의(`groupNames/groupOf/teamsOf`
    API 추가). 팀 이름 불변이라 기존 데이터 마이그레이션 불필요.
  - Supabase 비밀번호 로그인 제거, 사내메일 인증 통과 시 기존 localhost 우회와
    동일한 `HD20_AUTH_BYPASS` 경로로 즉시 진입. DB 동기화는 세션이 생기지
    않으므로 자동 비활성.
  - ③④⑤ 영역을 2서브탭→3서브탭으로 재구성(3조건 분석/실시·점검 입력/팀장
    기준정보 신설). 근본 원인은 서브탭 분리 로직 미배정 위젯 1건과 페이지네이션
    누락 2건(CSS 선택자 누락, 클래스 누락)이었음. 개선조치 탭 80,544→8,768px,
    유지관리 21,138→8,025px.
- 검증: Playwright(Chromium)로 15개 서브탭 전체 클릭 순회 + edge/scale 스트레스
  모드에서 콘솔 오류 0건. Node harness로 KPI 스냅샷·팀 마스터 API 단정 통과.
  가짜 프로덕션 도메인(`--host-resolver-rules`)으로 non-localhost 인증/FOUC
  시나리오 재현·검증.
- 추가 요구사항(같은 날 후속): "조금 더 세분화 해도 된다" → 16개 서브탭 실측 중
  최대치였던 advancement.analysis(3조건 분석, 11,141px)를 요약(3조건 분석)과
  상세표(라인·작업장 상세, 신규)로 재분리. 원인은 동일 패턴의 페이지네이션 클래스
  누락. 11,141→3,523px(요약)+3,246px(상세). advancement 3탭→4탭, 전체 서브탭
  5영역 16개로 확장, 전부 8,768px 이하로 수렴.
- 추가 요구사항(같은 날 3차): "더 나눠줘" → 최대치였던 action.manage(조치 목록,
  8,768px)와 audit.retention(유지관리, 내부적으로 진행중+종료평가 혼재)을 재분리.
  'retention'/'manage' 키 자체는 외부 4개 파일이 참조하므로 유지하고, 새로
  분리해낸 콘텐츠만 신규 키('ongoing','leadtime')로 이동. audit 3탭→4탭,
  action 3탭→4탭. 조치 목록 8,768→7,728px. 구현 중 발견한 계산 버그(기한 내
  완료 지표가 완료와 동일 값)도 같은 커밋에서 수정.
- 추가 발견(같은 날 "계속 실행 검증" 반복 요청 중): 어제·오늘 새로 만든 6개
  서브탭(audit.draw/inspect/ongoing, action.leadtime, advancement.analysis/
  detail) 모두 "상세 데이터 그리드" 버튼이 빈 화면("0개 데이터셋")을 표시하는
  회귀를 발견. 원인은 hd20-kpi-evidence-drill.js가 `${area}.${sub}.${index}`
  조합 문자열 switch-case로 그리드 데이터를 별도 제공하고 있었는데, 이 패턴은
  기존 `sub===` 전수검색으로 걸리지 않는 사각지대였음. 6개 서브탭 전부에
  case를 추가해 정상화(외부 참조가 있는 기존 case는 변경하지 않음).
- 추가 요구사항(같은 날 4차): "벨리데이션 접속말고 내 깃허브에 직접 반영해라"
  → "파라미터 없이 그냥 사이트에 들어가만 해도 자동으로 가상데이터가 보이게"로
  확정. web-validation-fixture.js의 시드 조건을 반전(`validation=0`/`off`일
  때만 끄고 그 외엔 기본 시드)하고, 같은 규칙 불일치로 재발한 KPI 표시 회귀
  (dashboard-kpi-source.js의 validationMode())를 함께 발견·수정. "원본 복구"
  클릭 후 즉시 재시딩되지 않도록 리다이렉트 대상도 수정. 이제
  `hastom79-hue.github.io/hd-20/`에 파라미터 없이 접속해도 검증 데이터가
  자동으로 보이고, 끄려면 `?validation=0`.
- 추가 요구사항(같은 날 5차, 실사용 피드백): "1) 세부탭 구분 명확히 어렵고,
  2) 탭별 중복정보 있는거 같음". 스크린샷으로 직접 재현해 둘 다 확인.
  탭 구분은 활성 탭 배경색을 앱 공통 강조색(#0b5b83)의 진한 배경+하단
  포인터로 강화. 중복정보는 4개 탭 쌍(audit.draw/inspect 4/4, advancement.
  analysis/detail 3/4, action.manage/leadtime 3/4, action.manage/master 3/4)
  에서 확인해 각 탭 고유 지표로 재설계. 재설계 중 parity guard가 메트릭을
  "근거 행 개수"로 강제 일치시킨다는 제약을 다시 확인해 평균값 지표 시도가
  실패하는 것을 실측으로 잡아내고 count 기반으로 재작성. action.master의
  그리드 버튼이 항상 비어 있던 것(evidence case 누락)도 함께 발견·수정.
- Commit: `8c5129c`(Audit 오분류·isNonProdRow·팀마스터·fixture v10),
  `260b0a4`(FOUC 가드 복원), `67826a5`(비밀번호 로그인 제거),
  `f253916`(서브탭 3-way 분리·페이지네이션 버그 2건 수정),
  `4aee88b`(advancement 4-way 추가 분리·페이지네이션 버그 1건 수정),
  `57e264c`(action/audit 4-way 추가 분리·지표 계산 버그 1건 수정),
  `c7b499e`(KPI 근거 그리드 전면 회귀 수정),
  `0e74799`(가상데이터 기본값 ON 전환·KPI 표시 회귀 수정),
  `e535a26`(탭 구분 강화·중복 지표 4건 재설계),
  `44a5c3f`(고도화 맵 버블 겹침 개선).
- 상세: `DEVELOPMENT_LOG_20260922_CLAUDE_SESSION_VALIDATION_TEAMMASTER_AUTH_SUBTAB.md`,
  `CODING_LOG_20260922_CLAUDE_SESSION_VALIDATION_TEAMMASTER_AUTH_SUBTAB.md`.
- 잔여사항: `scale=3` 대용량에서 일부 뷰 8~33초 소요(성능 후속 과제), 외부 뉴스
  이미지 리소스 2건 실사용 브라우저 미확인, 페이지 전체 DOM 노드가 항상 약
  3만 개(비활성 영역도 DOM 유지)인 구조적 특성은 이번 세션 범위 밖으로 기록만
  남김.
