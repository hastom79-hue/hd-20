# HD-20 전면개편 현재 기준 — 2026-09-02

> 이 문서는 `hd20-overhaul-20260902` 브랜치의 **현재 개발 기준 README**이다. 기존 `README.md`의 과거 Prototype 이력은 보존하되, 서로 충돌하는 경우 본 문서와 `DEVELOPMENT_LOG_20260902.md`의 기록을 우선한다.

## 1. 현재 정보구조
HD-20은 기존 7개 업무탭을 그대로 유지하지 않고 목적과 업무흐름 기준으로 5개 영역으로 재구성한다.

1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 업무탭이 아니라 상단 공통 Utility로 유지한다. `HDPS · 5S Expert AI`는 공통 지원기능이다.

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

현장 등록만으로 공식 고도화 실적에 포함하지 않는다. 공식판정 주체는 `생산혁신팀 + 5S 모듈`이다.

## 5. Audit 운영모델
과거 `1개월 점검 → 3개월 Audit → 6개월 Audit` 고정 Lifecycle은 **폐기된 기준**이다.

현재 승인된 운영흐름은 다음과 같다.

`Risk 가중 랜덤 Audit 대상 추출 → Audit 실시(D-Day) → 실시일 기준 6개월 지속관리 → 개선조치/효과검증 → 종료평가 → 차기 Audit Risk 반영`

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

## 7. Audit ↔ 개선조치 Case 연결
Audit 개선요청과 개선조치는 동일 Case로 연결한다.

`Audit Case → 개선조치 Case → BEFORE → 조치내용 → AFTER → 효과검증 → 재발여부`

Audit 화면과 개선조치 화면은 동일 Canonical Store를 사용하여 같은 Case의 상태가 서로 다르게 보이지 않도록 한다.

개선조치 Canonical Store: `hd20ActionCasesV2`
Audit 추출/실시 Store: `hd20AuditRandomDrawsV1`
고도화/5S Canonical Store: `hd20GMES5SAutoImproveRawV1`
운영정책 Store: `hd20OperatingPolicyV1`

## 8. 대시보드 운영 폐쇄루프
메인 대시보드는 단순 KPI 표시가 아니라 다음 흐름을 한 화면에서 판단할 수 있어야 한다.

`고도화 조건 충족 수준 → 적용범위 → Audit 6개월 관리 → 개선조치 미완료/기한경과 → 효과검증 → 재발 → 차기 Risk`

운영지표의 `6개월 유지율`은 과거 특정 6개월 Audit 합격률이 아니라 **Audit 실시 후 6개월 관리가 종료된 대상 중 요구수준을 유지한 비율**로 해석한다.

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
- `audit-action-auto-link.js`
- `audit-action-case-trace.js`
- `dashboard-operational-bridge.js`
- `legacy-lifecycle-retirement.js`
- `final-layout-polish.js`

## 10. 검증 계약
작업 브랜치에서도 다음 자동검증을 실행한다.

- 전체 JavaScript `node --check`
- index script reference 존재여부
- 5개 영역 Navigation contract
- Canonical KPI source 연결
- Audit D-Day + 달력 6개월 관리
- D+7~D+14 개선기한 범위
- 고도화 3대 조건 정확한 명칭
- 라인 임의추정 금지
- Demo 데이터 운영 KPI 자동주입 금지
- Browser Smoke에서 5개 영역 실제 클릭전환

2026-09-02 기준 Runtime Smoke와 Browser Smoke의 5영역 전환 검증이 성공한 이력이 있다. 이후 변경도 같은 검증을 통과해야 완료로 판단한다.

## 11. 개발/반영 규칙
코드 변경은 다음 순서를 따른다.

`요구사항 확인 → 작업 브랜치 구현 → 자동검증 → DEVELOPMENT_LOG_20260902 기록 → README 현재기준 갱신 → 사용자 확인 → main 반영/배포`

`main`은 사용자 승인 없이 개편 브랜치 변경을 병합하지 않는다.

과거 코드/문서에 `1개월/3개월/6개월 Audit`, 7개 탭, 임의 Demo KPI, 임의 Risk 계수 등 현재 기준과 충돌하는 표현이 남아 있으면 **Historical/Legacy로 취급**하고 현재 운영기준으로 다시 사용하지 않는다.

## 12. 통합기준정보 운영정책

`통합기준정보 > 운영정책`에서 다음 값을 관리한다.

- 개선요청 자동 완료기한 기본일수: 7~14 범위 정수
- Audit Risk 가중 적용 여부
- Risk 가중치: 전월 개선요청 / 누적 개선요청 / 기한경과 / 재발
- Audit 표본수

`operating-policy-master.js`가 입력값을 검증하고 `hd20OperatingPolicyV1`에 저장한다. 정책 저장 시 `hd20-policy-updated` 이벤트를 발생시켜 Audit/개선조치 화면이 즉시 새 정책을 사용한다.

세부 정책이 설정되지 않은 상태는 화면에서 숨기지 않고 `정책미설정` 또는 `균등 랜덤`으로 명확히 표시한다. Audit 표본수는 현재 Master 저장까지 연결되었으며 다중 추출 로직 연결은 후속 구현 대상이다.
