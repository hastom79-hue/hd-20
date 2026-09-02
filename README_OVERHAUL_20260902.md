# HD-20 전면개편 현재 기준 — 2026-09-02

> 이 문서는 HD-20의 **현재 개발·배포 기준 README**이다. 기존 `README.md`의 과거 Prototype 이력은 보존하되, 서로 충돌하는 경우 본 문서와 `DEVELOPMENT_LOG_20260902.md`의 기록을 우선한다.
> 2026-09-02 1차 전면개편은 `main`에 배포되었으며 배포 기준 Merge Commit은 `28f53aa2aceabed41eda554235dae8e429a74ee5`이다.

## 1. 현재 정보구조
HD-20은 기존 7개 업무탭을 그대로 유지하지 않고 목적과 업무흐름 기준으로 5개 영역으로 재구성한다.

1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 업무탭이 아니라 상단 공통 Utility로 유지한다. `HDPS · 5S Expert AI`는 공통 지원기능이다.

정적 `index.html` 자체도 5영역으로 전환되어 첫 렌더링부터 동일한 구조를 사용한다. 실행 후 JavaScript가 7탭을 사후 치환하는 방식에 의존하지 않는다.

## 2. 5S 활동유형
정본 6종은 다음과 같다.

- 정리
- 정돈
- 청소
- 시각화
- 위험구역관리
- 5S 고도화

기본 차트는 생산팀별 6개 유형 세로막대이며, 단일팀 선택 시 최근 월별 활동추이로 전환한다.

## 3. 고도화 3대 조건
고도화 성과분석의 조건은 다음 3개로 고정한다.

1. 시각화·형적관리
2. 인간공학적 Green Zone
3. 정량축소·정위치 변경을 통한 공간 활용

성과분석은 **정확히 1개 조건 충족 / 정확히 2개 조건 충족 / 3개 모두 충족**으로 중복 없이 분류한다. 별도 누적지표가 필요할 때만 `2개 이상 = 2조건 + 3조건`으로 계산한다.

조건 충족수와 적용범위를 분리하여 `생산팀 → 라인 → 작업장 → 사례` 관점으로 분석한다. 라인 정보가 원천데이터에 명시되지 않은 경우 작업장명 문자열을 보고 라인을 임의 추정하지 않는다.

## 4. 현장등록과 공식판정
현장 등록과 공식 고도화 확정은 분리한다.

`현장 등록 → 생산혁신팀 + 5S 모듈 판정 → 확정 / 보완요청 / 미확정`

현장 등록만으로 공식 고도화 실적에 포함하지 않는다. 공식판정 주체는 `생산혁신팀 + 5S 모듈`이다. **1/2/3개 조건 충족 분석은 성과·현상 분석축이며, 그 자체를 공식확정 판정으로 간주하지 않는다.**

## 5. Audit 운영모델
과거 `1개월 점검 → 3개월 Audit → 6개월 Audit` 고정 Lifecycle은 **폐기된 기준**이다.

현재 승인된 운영흐름은 다음과 같다.

`Risk 가중 랜덤 Audit 대상 추출 → Audit 실시(D-Day) → 실시일 기준 6개월 지속관리 → 개선조치/효과검증·재발관리 → 종료평가 → 차기 Audit 판단 근거`

Audit 기준일은 대상 추출일이나 고도화 확정일이 아니라 **실제 Audit 실시일**이다. 6개월은 고정 183일이 아니라 달력 기준 +6개월로 계산한다.

Audit 대상은 Eligible 생산현장팀 중 자동 랜덤 추출한다. 전월 또는 누적 개선요청사항이 많은 팀은 다음 Audit 추출에서 확률을 높이는 Risk 가중 방식으로 관리하되, 특정 고위험팀을 무조건 강제선정하지 않는다.

정확한 Risk 가중계수와 Audit 표본수는 Master/정책값으로 관리하며 임의 상수로 업무기준을 확정하지 않는다. 세부 가중치가 아직 설정되지 않은 동안에는 시스템이 **균등 랜덤**으로 동작하며 당시 정책적용 여부를 추출이력에 남긴다.

## 6. 개선요청 자동 Deadline
Audit 또는 운영 중 발생한 개선요청사항은 **등록일로부터 최소 7일, 최대 14일 이내** 자동 완료기한을 가져야 한다.

필수 관리필드:
- 등록일
- 자동 완료기한
- 잔여일/경과일
- 상태
- 완료일
- 효과검증
- 재발여부

기한이 지나고 완료되지 않은 건은 자동으로 기한경과 상태로 판단한다. 7~14일 중 정확히 며칠을 선택할지는 별도 정책값으로 관리하며, 승인되지 않은 긴급/일반/복잡도 임의 분류를 정식 업무규칙으로 고정하지 않는다.

현재 중앙 정책 Store는 `hd20OperatingPolicyV1`이며 `improvementDeadline.minDays=7`, `maxDays=14`, `defaultDays=null`을 기본으로 한다. `defaultDays`가 기준정보에서 확정되기 전에는 신규 Case에 임의 10일을 부여하지 않고 `정책미설정`으로 명시한다.

## 7. Audit ↔ 개선조치 ↔ 종료평가 Case 연결
Audit 개선요청과 개선조치는 동일 Case 흐름으로 연결한다.

`Audit Case → 개선조치 Case → BEFORE → 조치내용 → AFTER → 효과검증 → 재발여부 → 6개월 종료평가`

Audit 화면과 개선조치 화면은 동일 Canonical Store를 사용하여 같은 Case의 상태가 서로 다르게 보이지 않도록 한다.

- 개선조치 Canonical Store: `hd20ActionCasesV2`
- Audit 추출/실시 Store: `hd20AuditRandomDrawsV1`
- 고도화/5S Canonical Store: `hd20GMES5SAutoImproveRawV1`
- 운영정책 Store: `hd20OperatingPolicyV1`

6개월 종료평가는 달력 기준 관리종료 후 `유지 / 미흡`으로 저장하며, `finalEvaluation`, `finalEvaluationNote`, `finalEvaluationAt`을 같은 Audit Case에 기록한다. `미흡` 결과 자체에 임의 Risk 가중치를 추가하지 않는다.

## 8. 대시보드 운영 폐쇄루프
메인 대시보드는 단순 KPI 표시가 아니라 다음 흐름을 한 화면에서 판단할 수 있어야 한다.

`고도화 조건 충족 수준 → 적용범위 → Risk 랜덤 Audit → 실제 실시일 기준 6개월 관리 → 개선조치 미완료/기한경과 → 효과검증 → 재발 → 종료평가 → 차기 Audit 판단 근거`

운영지표의 `6개월 유지율`은 과거 특정 6개월 Audit 합격률이 아니라 **Audit 실시 후 6개월 관리가 종료된 대상 중 요구수준을 유지한 비율**로 해석한다. 사용자 화면 명칭은 `Audit 후 6개월 유지율`로 통일한다.

상단 `HDPS 대시보드`는 별도 Patch Layer 없이 `hdps-dashboard.js` 원본이 `hd20AuditRandomDrawsV1`과 `hd20ActionCasesV2`를 직접 읽는다. 과거 `HD20MaturityFollowup`, `audit6Result` 계열, 1/3/6개월 Lifecycle 직접 참조는 제거했다.

메인 승인 대시보드 `approved-landing-v2.js`도 `hd20AuditRandomDrawsV1`을 직접 읽으며 5영역 `navCount===5`, `Audit 후 6개월 유지율`, `Audit 후 6개월 관리 대상`을 원본 기준으로 사용한다. 조건충족 분석과 공식판정은 화면 문구에서도 분리한다.

## 9. 주요 개편 스크립트
- `hd20-five-area-integration.js`
- `hd20-five-area.css`
- `hd20-overhaul.css`
- `hd20-policy-config.js`
- `operating-policy-master.js`
- `maturity-condition-analysis.js`
- `maturity-condition-analysis.css`
- `audit-random-draw.js`
- `audit-six-month-control.js`
- `audit-closed-loop-workflow.js`
- `audit-batch-execution.js`
- `audit-close-evaluation.js`
- `audit-action-auto-link.js`
- `audit-action-case-trace.js`
- `dashboard-operational-bridge.js`
- `dashboard-side-summary.js`
- `approved-landing-v2.js`
- `hdps-dashboard.js`
- `final-layout-polish.js`

퇴역 완료:
- `hdps-dashboard-current-model.js`
- `maturity-seq-action-link.js`
- `legacy-lifecycle-retirement.js`

## 10. 검증 계약
다음 자동검증을 `main`에서 지속 사용한다.

- 전체 JavaScript `node --check`
- index script reference 존재여부
- 정적 `index.html` 5개 영역 Navigation contract
- 삭제된 `maturity-seq-action-link.js` 참조 재유입 방지
- Canonical KPI source 연결
- Audit D-Day + 달력 6개월 관리
- D+7~D+14 개선기한 범위
- 고도화 3대 조건 정확한 명칭
- 라인 임의추정 금지
- Demo 데이터 운영 KPI 자동주입 금지
- Audit 표본수 정책 보존 및 Batch 무중복 추출 계약
- `HD20MaturityFollowup` 전역 재유입 방지
- 승인 대시보드 `navCount===5` 및 Canonical Audit Store 직접 사용
- `dashboard-side-summary.js` Canonical Store 연결 및 구형 retirement 파일 부재
- HDPS 대시보드 Canonical Audit/Action Store 직접 연결
- Browser Smoke에서 5개 영역 실제 클릭전환
- Browser E2E에서 표본수 3 → 고유팀 3개 추출 → 1건 실시등록 → 대기 2건 확인
- Browser E2E에서 6개월 종료평가 `미흡` 저장 → Dashboard/Case Trace 반영 확인

### 최근 확정 배포 검증
Commit `587dd943f85942bc142b23d53fe36e30bb657b92`:
- Runtime Smoke run #186: **success**
- Browser Smoke run #129: **success**
- Package HD20 source run #390: **success**
- GitHub Pages build/deployment run #581: **success**

Commit `cd2ba4cabb7198bcdf538be628d854755a1fcfb5` 구조정리 기준:
- Runtime Smoke run #198: **success**
- Browser Smoke run #141: **success**
- Package HD20 source run #402: **success**
- Pages run #593은 확인 시점 배포 대기 상태였으며 완료 전에는 성공으로 간주하지 않는다.

## 11. 개발/반영 규칙
코드 변경은 다음 순서를 따른다.

`요구사항 확인 → 구현 → 자동검증 → 개발일지 기록 → README 현재기준 갱신 → main 반영 → GitHub Pages 배포 검증`

후속 변경도 `main`과 GitHub Pages에 순차 반영하며 개발일지/README를 함께 유지한다.

과거 코드/문서에 `1개월/3개월/6개월 Audit`, 7개 탭, 임의 Demo KPI, 임의 Risk 계수 등 현재 기준과 충돌하는 표현이 남아 있으면 **Historical/Legacy로 취급**하고 현재 운영기준으로 다시 사용하지 않는다.

## 12. 통합기준정보 운영정책
`통합기준정보 > 운영정책`에서 다음 값을 관리한다.

- 개선요청 자동 완료기한 기본일수: 7~14 범위 정수
- Audit Risk 가중 적용 여부
- Risk 가중치: 전월 개선요청 / 누적 개선요청 / 기한경과 / 재발
- Audit 표본수

`operating-policy-master.js`가 입력값을 검증하고 `hd20OperatingPolicyV1`에 저장한다. `hd20-policy-config.js`가 `sampleCount`를 포함한 정책값을 중앙에서 보존·조회한다. 정책 저장 시 `hd20-policy-updated` 이벤트를 발생시켜 Audit/개선조치 화면이 즉시 새 정책을 사용한다.

Audit 표본수가 미설정이면 시스템이 임의로 1건을 추출하지 않고 설정 필요 상태를 표시한다. 표본수가 설정되면 `audit-random-draw.js`가 해당 수만큼 하나의 Batch로 추출하며, 각 선정 후 후보군에서 제거하여 **동일 Batch 내 중복선정을 방지**한다. Risk 가중치가 설정되지 않은 경우에는 동일 구조에서 균등 랜덤을 사용한다.

세부 구현 이력은 `DEVELOPMENT_LOG_20260902_AUDIT_BATCH.md`에 기록한다.

## 13. HDPS/메인 대시보드 Canonical 전환
- `hdps-dashboard.js`가 Audit/Action Canonical Store를 직접 사용하도록 재작성되었다.
- `hdps-dashboard.html`에서 과거 Lifecycle 로딩을 제거했다.
- `maturity-seq-action-link.js` Compatibility Adapter까지 완전히 삭제했다.
- `approved-landing-v2.js`에서 `HD20MaturityFollowup`, 3개월 Audit 표현, `navCount===7`을 제거했다.
- `legacy-lifecycle-retirement.js`의 후처리 역할을 제거하고 파일을 삭제했다.
- Side Card 동적 집계는 역할이 명확한 `dashboard-side-summary.js`로 분리했다.
- Action Summary 및 운영 폐쇄루프는 Canonical Audit/Action Store를 기준으로 한다.
- 상세 이력은 `DEVELOPMENT_LOG_20260902_HDPS_CANONICAL.md`, `DEVELOPMENT_LOG_20260902_LEGACY_ADAPTER.md`에 기록한다.

## 14. 현재 후속개발 우선순위
1. 최신 구조정리 및 공식판정 문구 분리 이후 Runtime/Browser/Package/Pages를 재검증한다.
2. 실행 코드 전체에서 구형 Audit/Lifecycle 문자열을 계속 전수 점검한다.
3. `demo-data-seed.js` 등 초기 Prototype seed가 Canonical 운영데이터를 오염시키지 않는지 재검증한다.
4. Side Summary를 6개월 종료평가 상태와 더 직접 연결할 필요가 있는지 실제 운영정보 관점에서 점검한다.
5. 각 변경마다 자동검증과 개발일지/README 기록을 반복한다.
