# HD-20 개발일지 — Audit → 개선조치 연결 무결성 보강

일자: 2026-09-02
대상: `main`

## 발견한 운영오류 가능성
Audit Batch에서 여러 생산팀을 추출한 뒤 Audit 점검항목의 `→ 개선요청`을 사용하는 경우, 기존 `audit-checklist-enhance.js`는 현재 선택된 Audit 대상이 아니라 `hd20AuditRandomDrawsV1`의 첫 번째 항목을 팀 기준으로 사용할 수 있었다.

이 경우 Batch 2번째/3번째 팀을 실제 Audit 중이어도 개선조치가 다른 팀으로 연결될 수 있으므로 실제 운영오류 가능성이 있었다.

또한 점검항목에서 개선조치 화면으로 넘긴 `auditDrawId`가 최종 `hd20ActionCasesV2` Case에 보존되지 않아 Audit ↔ 개선조치 Case Trace가 끊길 수 있었다.

## 조치 1 — 현재 선택된 Audit 대상 사용
`audit-checklist-enhance.js`의 Audit 대상 조회를 현재 Batch 실행 선택값 `#hd20AuditBatchExecution [data-abe-select]` 기준으로 변경했다.

선택값이 없을 경우에만 당일 추출 대상 fallback을 사용한다.

개선조치 전달 payload에는 다음을 포함한다.

- `team`
- `problem`
- `auditDrawId`
- `sourceStage: AUDIT-CHECKLIST`

관련 커밋:
- `6ecbd8cf9fae9811201e04e069cd38e7712f3500`

## 조치 2 — 가상 담당자/작업장 저장 제거
`audit-closed-loop-workflow.js`의 Audit 결과 기반 자동 개선조치 생성에서 다음 가상값 저장을 제거했다.

- `leader: 자동연결`
- `workplace: Audit 대상 현장`

현재는 `hd20TeamLeaderMasterV1`의 실제 팀장/이메일을 사용한다. 등록정보가 없으면 팀장은 `미지정`, 이메일은 빈값으로 남긴다.

Audit 작업장도 실제 입력값만 저장하며 값이 없을 때 가상 작업장명을 만들지 않는다.

관련 커밋:
- `9d22399ef21414f39d57d3d5a706a0d33a112438`

## 조치 3 — Audit 원본 Case ID와 자동기한 보존
기존 `action-mail-workflow.js`의 메일/Outlook/회신 기능을 직접 크게 수정하지 않고 후단 보강 모듈 `action-audit-linkage.js`를 추가했다.

기능:

- `hd20-audit-to-action` 전달정보 별도 보존
- 개선조치 Case 등록 직후 `sourceCaseId` / `auditDrawId` 보존
- `sourceStage = AUDIT-CHECKLIST` 보존
- `registeredAt` 보완
- 운영정책 `improvementDeadline.defaultDays`가 7~14 범위로 설정된 경우 등록일 기준 자동기한 즉시 지정
- 정책 미설정 시 임의기한을 만들지 않고 `autoDuePolicyState = 정책미설정`
- 사용자가 실제 기한을 직접 입력한 경우 `수동지정`으로 구분

`final-layout-polish.js`에서 보강 모듈을 Runtime에 로드한다.

관련 커밋:
- `60a578a26b3f304a042a178a696075dd70d21822`
- `879497f0937de4e41df0a4fa66b2653a2c5638be`

## 조치 4 — 자동검증 계약
Runtime Smoke에 다음 회귀방지 계약을 추가했다.

- `action-audit-linkage.js` 존재
- Canonical Store `hd20ActionCasesV2` 사용
- `sourceCaseId / auditDrawId` 보존
- 자동기한 `자동지정 / 정책미설정` 상태 보존
- `final-layout-polish.js` 실제 로드 확인
- Audit Checklist의 현재 Batch selector 및 `auditDrawId` 사용 확인
- `audit-closed-loop-workflow.js` 실제 팀장 Master 사용 확인
- `자동연결 / Audit 대상 현장` 가상값 재유입 금지

관련 커밋:
- `8aeb25824073191f28c6f4a89d6ce494b2a95b44`
- `3530ecfe69dcde664df9f58b94eeb822c0e73c08`

Runtime #277: **success**

## 조치 5 — Browser E2E 추가
Browser Smoke에 실제 사용자 흐름을 추가했다.

### 정책 설정 상태
`defaultDays = 7` 테스트 정책에서:

`Audit 개선요청 전달 → 개선조치 화면 → 임시등록 → sourceCaseId/auditDrawId 보존 → 등록일 D+7 자동기한`

검증 기대값:

- `sourceCaseId = E2E-LINK-1`
- `auditDrawId = E2E-LINK-1`
- 등록일 `2026-09-02`
- 자동기한 `2026-09-09`
- `autoDuePolicyState = 자동지정`
- `autoDueDays = 7`

### 정책 미설정 상태
`defaultDays = null`일 때:

- 기한을 임의 생성하지 않음
- `autoDuePolicyState = 정책미설정`

관련 커밋:
- `7b21c5b3e6b187fd0e4d6ffc8789b2dc7e4ba33d`

Browser #221: **success**
- Playwright 설치: success
- 로컬 Web server: success
- Execute browser contracts: success
- Browser evidence 업로드: success

## 검증결론
`Audit 선택대상 → 개선요청 → 개선조치 Canonical Case` 연결에서 생산팀과 원본 Audit Case ID가 보존되고, 승인된 운영정책 범위 내 자동기한 규칙이 실제 브라우저에서 동작함을 확인했다.

테스트에서 사용한 `D+7`은 운영 기본값을 의미하지 않으며 Browser E2E용 테스트 정책이다. 운영에서는 `통합기준정보 > 운영정책`의 실제 설정값을 사용하고, 미설정 상태에서는 임의기한을 생성하지 않는다.
