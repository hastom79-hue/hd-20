# HD-20 Current Status — 2026-09-02

이 문서는 2026-09-02 전면개편의 **현재 구현상태**를 빠르게 확인하기 위한 README이다. 업무기준은 `README_OVERHAUL_20260902.md`, 상세 변경이력은 `DEVELOPMENT_LOG_20260902*.md`를 함께 참조한다.

## 현재 5영역
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 상단 Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다. 과거 `⑦ 기준정보`, `⑥ 문제점·개선조치`, `1개월 점검 / 3개월 Audit / 6개월 Audit` 고정 Lifecycle은 현재 운영모델에서 사용하지 않는다.

## 상단 5개 탭 Scroll 안정화
상단 5개 화면 탭을 선택할 때 이전 화면의 스크롤 위치 또는 동적 화면의 포커스 위치를 따라 화면이 내려가 보이던 현상을 수정했다.

- 적용 모듈: `nav-scroll-stability.js`
- 대상: `.beginnerNav button[data-key]`의 5개 탭 전체
- 탭 전환 시 활성 입력요소 포커스와 URL hash를 정리하고 화면을 페이지 상단으로 복귀
- 동적 화면 생성·재렌더링 직후 브라우저가 viewport를 다시 아래로 이동시키는 경우까지 짧은 안정화 구간에서 재확인
- 탭 전환 중에는 부드러운 스크롤 애니메이션을 비활성화해 끌려 내려가는 시각효과를 방지
- 화면 내부의 정상적인 사용자 입력 포커스 기능은 유지

전용 Chromium 회귀검증 `.github/workflows/nav-scroll-smoke.yml`은 `dashboard / activity / advancement / audit / action` 각각에 대해 상단 상태와 페이지가 내려간 상태 양쪽에서 탭을 전환하고 최종 `window.scrollY === 0`을 확인한다.

## Canonical Data / Master
- 5S·고도화 원천: `hd20GMES5SAutoImproveRawV1`
- 개선조치: `hd20ActionCasesV2`
- Audit 추출·실시·종료평가: `hd20AuditRandomDrawsV1`
- 운영정책: `hd20OperatingPolicyV1`
- 팀장 기준정보: `hd20TeamLeaderMasterV1`
- 생산팀 목록: `window.HD20ProductionTeamMaster`

현재 16개 생산팀 배열은 `app.js`의 Canonical Team Master만 Source로 사용하며 다음 실행모듈이 동일 목록을 공유한다.

- `team-master-safety.js`
- `audit-random-draw.js`
- `action-mail-workflow.js`
- `activity-workflow.js`
- `activity-dynamic-chart.js`
- `performance-conversion-analysis.js`

팀장명·이메일은 팀 목록과 분리하여 실제 입력값만 `hd20TeamLeaderMasterV1`에 저장한다. 생산팀장 업로드 양식도 가상 이름·가상 이메일 없이 `생산팀 / 생산팀장 / 이메일` 헤더만 제공한다.

## 고도화 분석 / 공식판정 분리
고도화 3개 조건은 다음으로 고정한다.

1. 시각화·형적관리
2. 인간공학적 Green Zone
3. 정량축소·정위치 변경을 통한 공간 활용

성과·현상 분석은 `정확 1조건 / 정확 2조건 / 정확 3조건`으로 중복 없이 분류한다. `2개 이상`은 누적 표현이 필요할 때만 2+3을 합산한다.

조건 충족 수준은 공식판정과 별도 축이다. **조건 충족 개수만으로 공식 확정을 자동 결정하지 않는다.** 공식판정은 생산혁신팀 + 5S 모듈의 실제 판정결과 `확정 / 보완요청 / 미확정`을 사용한다.

라인 정보는 명시된 구조화 필드만 사용하며 작업장명에서 라인을 임의 추정하지 않는다. 라인 정보가 없으면 `미분류/라인 매핑 필요`로 관리한다.

`maturity-map-drilldown.js`는 실제 저장된 판정자·판정사유가 없을 때 가상 판정자/사유를 생성하지 않고 `—`로 표시한다.

## Workflow 원본 정리
`activity-workflow.js`는 현재 구조로 재작성했다.

- `② 5S 활동`: 실제 등록·GMES 원천 활동현황
- `③ 고도화·판정`: 후보·조건충족 수준·공식판정·라인/작업장 범위
- `④ 유지·Audit`: Risk 추출·Audit 실시·6개월 지속관리·종료평가
- `⑤ 개선조치`: D+7~D+14·효과검증·재발관리

구형 `awRegister` 화면은 사용하지 않는다. `register-tab-fill.js`, `audit-admin-import.js`, `crud-hotfix.js`, `action-button-hotfix.js`는 퇴역했다.

## Audit 현재 운영모델
`Risk 가중 랜덤 대상추출 → Audit 실시(D-Day) → 실시일 기준 6개월 지속관리 → 개선요청/개선조치 → 효과검증·재발 → 종료평가 → 차기 Audit 판단 근거`

- Audit 대상은 자동 랜덤 추출.
- 전월/누적 개선요청이 많은 팀은 설정된 Risk 정책이 있을 때 가중확률 적용.
- Risk 정책 미설정 시 균등 랜덤.
- 동일 Batch 내 중복 팀 없음.
- Audit 표본수는 통합기준정보의 설정값을 사용하며 임의 고정하지 않음.
- Audit 실시일부터 **달력 기준 +6개월** 지속관리.
- 고정 M+1/M+3/M+6 체크포인트를 운영규칙으로 사용하지 않음.

## Audit → 개선조치 연결 무결성
Audit 점검항목의 `→ 개선요청`은 현재 Batch에서 사용자가 선택한 Audit Case를 기준으로 연결한다. 단순히 최근 추출목록의 첫 번째 팀을 사용하는 방식은 제거했다.

개선조치 Canonical Case에는 원본 Audit 추적정보를 보존한다.

- `sourceCaseId = 원본 Audit Draw ID`
- `auditDrawId = 원본 Audit Draw ID`
- `sourceStage = AUDIT-CHECKLIST`
- 생산팀은 현재 선택된 Audit 대상팀 사용
- 생산팀장/이메일은 `hd20TeamLeaderMasterV1`의 실제 저장값 사용
- 팀장정보 미등록 시 `미지정 / 이메일 빈값`
- 작업장 미입력 시 `Audit 대상 현장` 같은 가상 작업장명을 저장하지 않음

`action-audit-linkage.js`가 기존 개선조치 메일/Outlook/회신 기능을 변경하지 않으면서 Audit 원본 ID와 기한상태를 Canonical Store `hd20ActionCasesV2`에 보존한다.

## 개선요청 Deadline
- 등록일 기준 D+7~D+14 범위.
- 정확한 자동지정 일수는 `통합기준정보 > 운영정책`에서 설정.
- 정책이 7~14 범위로 설정되어 있고 개선조치 등록 시 기한이 비어 있으면 등록일 기준 자동기한을 즉시 지정.
- 정책 미설정 시 임의 7일/10일/14일을 운영값으로 만들지 않고 `정책미설정`으로 저장.
- 사용자가 실제 기한을 직접 지정하면 `수동지정`으로 구분.
- `등록일 / 자동 완료기한 / 잔여일 / 경과일 / 상태`를 관리.

Browser E2E의 `D+7`은 **테스트 정책**일 뿐 운영 기본값이 아니다.

## 6개월 종료평가
- Audit 실시일 + 달력 기준 6개월이 지난 Case만 평가 가능.
- 종료평가 값: `유지 / 미흡`.
- 평가근거와 평가일시 저장.
- `미흡` 결과 자체에 임의 Risk 가중계수를 부여하지 않음.
- Dashboard에서 `종료평가 대기 / 유지 / 미흡`을 각각 집계.
- Audit Case Trace는 `Audit 실시 → 6개월 관리 → 개선조치 → 효과검증/재발 → 종료평가`를 연결.

## 메인 Dashboard Core
- 구형 7메뉴 Fail-safe 재생성 제거.
- 과거 임의 분기 인당목표 `0.5 / 0.6 / 0.6 / 0.7` 제거.
- 분기 목표 기본값은 `null / 미설정`, 실제 기준정보 저장값이 있을 때만 사용.
- 총 건수 차트와 `건/인` 목표선을 동일 축에 혼합하지 않음.
- 정적 `Q3 목표 55건` 제거.
- `HD20DashboardCore` 사용.
- visibility 복구만 `app-visibility-failsafe.js`가 담당.

## Demo / Seed / Prototype 퇴역
운영 Store를 가상 데이터로 채우거나 배포본에 혼동을 주던 파일은 퇴역했다.

- `demo-data-seed.js`
- `action-demo-seed.js`
- `audit-global-seed.js`
- `management.html`
- `v2-preview.html`
- 루트 및 `data/`의 가상 팀장 샘플 CSV
- `emergency-ui-stabilizer-v2.js`
- `maturity-seq-action-link.js`

Audit 체크리스트 Master는 `audit-checklist-master.js`가 `N/A / 0` 초기상태만 제공하며 실제 실적을 생성하지 않는다.

## 데이터 의미·출력 안전성
- `미발생`을 `발생` 부분문자열로 재발 오인하지 않음.
- 문제내용/상태 텍스트에 `재발`이 들어갔다는 이유만으로 재발판정하지 않음.
- `부적합`을 `적합` 부분문자열로 효과검증 성공 처리하지 않음.
- 사용자/원천값을 HTML에 삽입할 때 escape 처리 유지.
- `audit-six-month-control.js`의 생산팀 출력도 `esc()`를 적용해 저장된 과거 Audit 원천값이 HTML로 해석되지 않도록 보강함.

## Canonical Runtime 정리 중 실패·교정 이력
- Runtime #260: **failure** — `performance-conversion-analysis.js` 구문 오류를 발견해 Canonical 버전으로 재작성.
- Runtime #261: **failure** — 이미 퇴역한 `awRegister`를 Runtime 계약이 계속 요구하는 검증계약 오류를 수정.
- Runtime #262: **failure** — 고도화 의미검증 문구와 grep 문자열의 불일치를 수정.
- Runtime #265: 전체 현행화 계약 **success**.

실패 Run도 삭제하거나 숨기지 않고 `DEVELOPMENT_LOG_20260902_CANONICAL_RUNTIME.md`에 원인·조치를 기록한다.

## 확정 자동검증 기준점 — Canonical Runtime / 보안
Commit `1307c42cc00d4a3c36d2ca8a752784194bd5d4c0`:
- Runtime Smoke #271: **success**
- Browser Smoke #214: **success**
- Package HD20 source #475: **success**
- Pages build and deployment #666: **success**

이 기준점에는 고도화 의미분리, Audit Batch, 종료평가, Case Trace, Dashboard, HDPS E2E, Audit 6개월 화면 HTML escape 보강이 포함된다.

## 확정 자동검증 — Audit → 개선조치 연결
Commit `7b21c5b3e6b187fd0e4d6ffc8789b2dc7e4ba33d`:
- Runtime Smoke #278: **success**
- Browser Smoke #221: **success**
- Package HD20 source #482: **success**
- Pages build and deployment #673: **cancelled** — 연속 후속 커밋으로 해당 Run이 supersede되어 취소됨. 기능 실패로 성공 처리하지 않는다.

Browser #221은 실제 브라우저에서 다음을 확인했다.

- Audit 원본 `sourceCaseId / auditDrawId`가 개선조치 Case까지 보존.
- 테스트 정책 `defaultDays=7`에서 등록일 `2026-09-02` → 자동기한 `2026-09-09`.
- `autoDuePolicyState = 자동지정`, `autoDueDays = 7`.
- `defaultDays=null`에서는 기한을 생성하지 않고 `정책미설정`.
- 기존 Audit Batch / Audit 실시 / 종료평가 / Case Trace / Dashboard / HDPS E2E도 계속 통과.

## 최신 확정 자동검증 — 상단 탭 Scroll 안정화
Commit `99c79c7cfcfd069774044ada2ab4785a6a044ee0`:
- Runtime Smoke #292: **success**
- Browser Smoke #235: **success**
- Nav Scroll Smoke #1: **success**
- Package HD20 source #496: **success**
- Pages build and deployment #687: **success**

Nav Scroll Smoke #1은 5개 상단 탭 전체에서 화면 상단 선택 및 스크롤된 상태의 화면 전환 후 모두 최종 `scrollY=0`을 확인했다. 이 Commit을 상단 탭 Scroll 오류 수정의 완전검증·실배포 기준점으로 사용한다.

## 배포본 전수점검 결과
Package Artifact를 직접 압축 해제해 검사한 활성 JS/HTML 기준 다음 잔여는 0건으로 관리한다.

- `HD20MaturityFollowup`
- `hd20WorkflowDataV1`
- `management.html` 죽은 링크
- `awRegister`
- `생산혁신팀 메인 담당자`
- `example.com / 홍길동 / 김현대`
- `1개월 점검 / 3개월 AUDIT / 6개월 AUDIT`
- 독립 16개 생산팀 배열 (`app.js`의 `CANONICAL_TEAMS`만 존재)

## 주요 최신 개발일지
- `DEVELOPMENT_LOG_20260902.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_BATCH.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_CLOSE.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_ACTION_LINK.md`
- `DEVELOPMENT_LOG_20260902_HDPS_CANONICAL.md`
- `DEVELOPMENT_LOG_20260902_SEMANTIC_FIX.md`
- `DEVELOPMENT_LOG_20260902_DEMO_RETIREMENT.md`
- `DEVELOPMENT_LOG_20260902_DASHBOARD_CORE_CLEANUP.md`
- `DEVELOPMENT_LOG_20260902_TEAM_MASTER.md`
- `DEVELOPMENT_LOG_20260902_CANONICAL_RUNTIME.md`
- `DEVELOPMENT_LOG_20260902_RUNTIME_SECURITY_CLEANUP.md`
- `DEVELOPMENT_LOG_20260902_NAV_SCROLL_FIX.md`

## 다음 작업
- Audit·개선조치·고도화 화면에서 원천/사용자 입력을 `innerHTML`에 삽입하는 나머지 경로의 escape 여부 전수점검.
- 배포 HTML/JS의 죽은 링크·가상값·폐기 Lifecycle 잔여를 계속 전수검색.
- 운영정책/표시문구가 실제 데이터 구조와 일치하는지 계속 검증.
- 상단 5개 탭의 Scroll 회귀검증을 유지하고 PC/모바일의 화면 전환 안정성을 계속 점검.
- 변경 후 Runtime / Browser / Nav Scroll / Package / Pages를 모두 확인하고 개발일지·README를 계속 현행화.
