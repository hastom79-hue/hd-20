# HD-20 전면개편 현재 기준 — 2026-09-02

> 이 문서는 HD-20의 **현재 개발·배포 기준 README**이다. 기존 `README.md`의 과거 Prototype 이력은 보존하되, 서로 충돌하는 경우 본 문서와 `README_CURRENT_STATUS_20260902.md`, `DEVELOPMENT_LOG_20260902*.md`의 현재 기록을 우선한다.

## 1. 현재 정보구조
HD-20은 다음 5개 운영영역을 사용한다.

1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 상단 공통 Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다. 정적 `index.html`도 첫 렌더링부터 5영역 구조를 사용한다.

## 2. 5S 활동유형
정본 6종은 `정리 / 정돈 / 청소 / 시각화 / 위험구역관리 / 5S 고도화`이다. 기본 차트는 생산팀별 6개 유형 세로막대이며 단일팀 선택 시 월별 활동추이로 전환한다.

## 3. 고도화 3대 조건
1. 시각화·형적관리
2. 인간공학적 Green Zone
3. 정량축소·정위치 변경을 통한 공간 활용

성과분석은 **정확히 1개 / 정확히 2개 / 3개 모두 충족**으로 중복 없이 분류한다. 필요 시에만 `2개 이상 = 정확 2 + 정확 3`의 별도 누적분석을 사용한다.

조건 충족수와 적용범위를 분리하여 `생산팀 → 라인 → 작업장 → 사례`로 분석한다. 라인이 원천데이터에 명시되지 않으면 작업장명에서 임의 추정하지 않는다.

## 4. 공식판정과 조건분석 분리
현장등록과 공식확정은 분리한다.

`현장 등록 → 생산혁신팀 + 5S 모듈 판정 → 확정 / 보완요청 / 미확정`

1/2/3개 조건 충족은 성과·현상 분석축이며 그 자체를 공식확정으로 간주하지 않는다. 메인 승인 대시보드의 최근 확정 사례도 **공식 판정 완료 사례**만 의미하도록 문구를 분리했다.

## 5. Audit 운영모델
폐기된 모델: `1개월 점검 → 3개월 Audit → 6개월 Audit`.

현재 모델:
`Risk 가중 랜덤 Audit 대상추출 → Audit 실시(D-Day) → 실제 실시일 기준 달력 +6개월 지속관리 → 개선요청/개선조치 → 효과검증·재발 → 종료평가 → 차기 Audit 판단 근거`

Audit 기준일은 추출일이나 고도화 확정일이 아니라 **실제 Audit 실시일**이다. 6개월은 고정 183일이 아니라 달력 +6개월이다.

Audit 대상은 Eligible 생산현장팀에서 랜덤 추출하며 Risk 정책이 설정된 경우에만 가중치를 적용한다. 세부 가중치가 없으면 균등 랜덤이다. 특정 고위험팀을 강제선정하지 않는다. Audit 표본수 역시 `통합기준정보 > 운영정책`에서 관리하며 한 Batch 안에서 같은 팀을 중복 선정하지 않는다.

## 6. 개선요청 Deadline
개선요청은 등록일 기준 **D+7~D+14 범위**의 자동 완료기한을 사용한다. 정확한 지정일수는 정책값으로 관리한다. 승인되지 않은 `긴급/일반/복잡 = 7/10/14일` 같은 분류는 사용하지 않는다.

정책 Store는 `hd20OperatingPolicyV1`이며 기본은 `minDays=7`, `maxDays=14`, `defaultDays=null`이다. 세부 일수가 미설정이면 신규 Case는 임의 일수를 부여하지 않고 `정책미설정`으로 표시한다.

## 7. Canonical Store
- 5S/고도화: `hd20GMES5SAutoImproveRawV1`
- Audit 추출/실시: `hd20AuditRandomDrawsV1`
- 개선조치: `hd20ActionCasesV2`
- 운영정책: `hd20OperatingPolicyV1`
- Audit Checklist Master: `hd20AuditChecklistV1`

별도 Split Store나 Demo 운영 Store를 새로 만들지 않는다.

## 8. Audit ↔ 개선조치 ↔ 종료평가
동일 Case 흐름:
`Audit Case → 개선조치 Case → BEFORE → 조치내용 → AFTER → 효과검증 → 재발여부 → 6개월 종료평가`

6개월 종료 후 `유지 / 미흡`을 저장하며 `finalEvaluation`, `finalEvaluationNote`, `finalEvaluationAt`을 동일 Audit Case에 기록한다. `미흡` 결과 자체에 임의 Risk 계수를 부여하지 않는다.

Audit Case Trace와 통합 대시보드에서 `종료평가 대기 / 유지 / 미흡`을 직접 확인할 수 있다.

## 9. 운영 KPI 6종
1. 공식 판정 완료율
2. 평균 판정 Lead Time
3. 고도화 수준
4. Audit 후 6개월 유지율
5. Audit 부적합 재발률
6. 기한 내 개선조치 완료율

`Audit 후 6개월 유지율`은 과거 특정 6개월 Audit 합격률이 아니라 실제 Audit 실시 후 6개월 관리가 종료된 대상의 유지상태를 의미한다.

## 10. 데이터 의미판정
- 재발은 `recurrence=true` 또는 명시적인 `recurrenceState=재발/발생`만 인정한다.
- `미발생`, `없음`, `false`, `0`은 비재발이다.
- 문제내용이나 상태 문자열에 단순히 `재발`이라는 단어가 있다는 이유로 재발로 집계하지 않는다.
- `부적합`을 `적합` 부분문자열로 오인하지 않는다.
- 사용자/원천값의 HTML 출력은 escape를 유지한다.

## 11. Demo / Mock 운영데이터 금지
실제 원천데이터가 없으면 `0 / — / 데이터 없음`으로 표현한다. 화면을 채우기 위한 자동 Demo 데이터는 Canonical Store에 주입하지 않는다.

퇴역 완료:
- `demo-data-seed.js`: 120개 가짜 활동, 26개 가짜 개선조치, 가상 팀장/이메일 자동주입 기능 삭제.
- `action-demo-seed.js`: 실제 의존 없는 Demo Action 전역 Guard까지 삭제.
- `audit-global-seed.js`: 역할을 `audit-checklist-master.js`로 전환하고 구형 파일 삭제.

Audit Checklist Master는 결과를 `result:'N/A'`, `score:0`으로 시작하며 운영 실적을 만들어내지 않는다. 구형 `1·3·6개월 Audit` 체크리스트 문구도 `Audit 실시 후 6개월 지속관리 기간 동안 유지되는가?`로 교정했다.

## 12. 메인 대시보드 목표·복구 기준
- `app.js`는 5영역 Navigation을 재생성하지 않는다. Navigation 정본은 정적 `index.html` + `beginner-navigation.js`이다.
- 과거 `Q1=0.5 / Q2=0.6 / Q3=0.6 / Q4=0.7` 임의 기본 목표는 삭제했다.
- 분기별 인당 5S 목표 기본값은 `null / 미설정`이며 `통합기준정보`에 실제 값이 저장된 경우에만 사용한다.
- 팀별 메인 차트의 막대는 총 활동/후보/확보 건수이므로 단위가 다른 `건/인` 목표선을 차트 높이 기준으로 겹쳐 그리지 않는다.
- 정적 `Q3 목표 55건` Prototype 문구를 제거했다.
- 구형 `emergency-ui-stabilizer-v2.js`는 삭제하고 화면 visibility fail-safe만 `app-visibility-failsafe.js`로 분리했다.

## 13. 주요 현재 모듈
- `app.js`
- `app-visibility-failsafe.js`
- `hd20-five-area-integration.js`
- `hd20-policy-config.js`
- `operating-policy-master.js`
- `maturity-condition-analysis.js`
- `audit-checklist-master.js`
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

퇴역 완료 모듈:
- `hdps-dashboard-current-model.js`
- `maturity-seq-action-link.js`
- `legacy-lifecycle-retirement.js`
- `demo-data-seed.js`
- `action-demo-seed.js`
- `audit-global-seed.js`
- `emergency-ui-stabilizer-v2.js`

## 14. 검증 계약
`main`에서 다음을 자동검증한다.

- 전체 JavaScript syntax check
- index의 모든 로컬 script reference 존재 확인
- 정확한 메인 제목 `울산캠퍼스 5S 활동관리 시스템`
- 정적 5영역 Navigation
- 1/3/6개월 Legacy 문구 재유입 금지
- `HD20MaturityFollowup` 재유입 금지
- Canonical KPI/Audit/Action/Policy 연결
- Audit 실제 실시일 + 달력 6개월
- D+7~D+14 개선기한 범위
- 고도화 3대 조건 정확한 명칭
- 라인 임의추정 금지
- Audit 표본수 및 Batch 무중복 추출
- 종료평가 `유지/미흡` 및 Dashboard/Case Trace 연결
- Demo seed 파일/참조/전역 재유입 금지
- Audit Checklist Master `N/A / 0` 초기값 및 현재 6개월 지속관리 문구
- `app.js` 임의 분기목표 및 7메뉴 복구코드 재유입 금지
- 정적 `Q3 목표 55건` 재유입 금지
- 구형 emergency stabilizer 재유입 금지
- Browser E2E: 표본수 3 → 고유팀 3개 → 1건 Audit 실시 → 대기 2건
- Browser E2E: 6개월 종료 Case → `미흡` 저장 → Dashboard/Case Trace 반영

## 15. 최근 확정 검증
Commit `587dd943f85942bc142b23d53fe36e30bb657b92`:
- Runtime #186 success
- Browser #129 success
- Package #390 success
- Pages #581 success

Commit `cd2ba4cabb7198bcdf538be628d854755a1fcfb5` 구조정리:
- Runtime #198 success
- Browser #141 success
- Package #402 success

Commit `b52122d...` Demo/Seed 퇴역 + Audit Checklist Master 전환:
- Runtime #218 success
- Browser #161 success
- Package #422 success
- Pages #613 success

그 이후 메인 대시보드 목표/복구 레거시 제거까지 추가 반영했다. 최신 HEAD 결과는 완료 후에만 성공으로 기록한다.

## 16. 개발/기록 규칙
작업 순서는 다음 기준을 유지한다.

`요구사항 확인 → main 구현 → Runtime/Browser/Package/Pages 검증 → 개발일지 기록 → README 현행화 → 다음 작업`
