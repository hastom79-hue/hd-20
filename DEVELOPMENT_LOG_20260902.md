# HD-20 전면개편 개발일지 — 2026-09-02

> 대상 브랜치: `hd20-overhaul-20260902` → `main` 배포 진행
> 목적: 2026-09-02 전면개편 작업의 요구사항, 구현, 검증, 잔여사항을 코드 변경과 동시에 누적 기록한다.
> 원칙: 과거 기준은 삭제하지 않고 Historical로 보존하되, 현재 기준과 충돌하는 경우 `README_OVERHAUL_20260902.md`와 본 일지를 우선한다.

## 현재 승인 기준 요약

- 업무영역: 통합 대시보드 / 5S 활동 / 고도화·판정 / 유지·Audit / 개선조치의 5개 영역
- 통합기준정보: 상단 Utility
- 고도화 3대 조건: 시각화·형적관리 / 인간공학적 Green Zone / 정량축소·정위치 변경을 통한 공간 활용
- 고도화 분석: 정확 1조건 / 정확 2조건 / 정확 3조건, 적용범위는 작업장·라인을 분리 분석
- Audit: Risk 가중 랜덤 추출 → 실제 Audit 실시일 D-Day → 달력 기준 6개월 지속관리 → 개선조치·효과검증 → 종료평가 → 차기 Risk
- 과거 1개월/3개월/6개월 고정 Audit Lifecycle: 폐기
- 개선요청 Deadline: 등록일 기준 최소 7일, 최대 14일
- 7~14일 중 정확한 자동지정 일수와 Audit Risk 세부 가중계수: 기준정보 정책값으로 관리, 미승인 상수 금지

---

## 2026-09-02 / 5영역 전면개편 기반 구축

- 기존 7탭 구조를 업무흐름 중심 5개 영역으로 재구성하는 Controller와 통합 레이어 추가.
- `hd20-five-area-integration.js`, `hd20-five-area.css`, `hd20-overhaul.css` 추가.
- `beginner-navigation.js`를 5영역 기준으로 개편.
- `통합기준정보`는 업무탭이 아니라 상단 Utility로 유지.
- 초기 구현은 작업 브랜치에서 진행.

## 2026-09-02 / 고도화 조건 충족 × 적용범위 분석

- `maturity-condition-analysis.js`, `maturity-condition-analysis.css` 추가.
- 고도화 3대 조건을 각각 별도 Boolean/명시값으로 판정.
- 정확 1조건 / 정확 2조건 / 정확 3조건으로 중복 없이 집계.
- 작업장과 라인 적용범위를 분리.
- 원천데이터에 라인이 명시되지 않으면 작업장명 문자열에서 라인을 추정하지 않도록 제한.
- 3번째 기준 명칭을 `정량축소·정위치 변경을 통한 공간 활용`로 정정.

## 2026-09-02 / Audit 6개월 지속관리 모델 전환

- 과거 M+1/M+3/M+6 고정 Lifecycle을 현재 운영모델에서 제거.
- `audit-six-month-control.js` 추가.
- 실제 Audit 실시일을 관리 시작일 D-Day로 사용.
- 관리 종료일은 고정 183일이 아니라 달력 기준 +6개월로 계산.
- Audit 추출일은 6개월 관리 시작일로 사용하지 않음.
- 개선요청, 미완료, 기한경과, 재발 이력을 6개월 Timeline에 연결.

## 2026-09-02 / Audit 랜덤 추출 및 개선조치 Case 연결

- `audit-random-draw.js`를 자동 랜덤 추출 구조로 개편.
- 전월·누적 개선요청, 기한경과, 재발을 Risk 입력데이터로 관리.
- `audit-closed-loop-workflow.js` 추가.
- Audit 실시결과 등록과 개선요청 생성 연결.
- `audit-action-auto-link.js`를 Audit 부적합/개선요청 자동 Case 생성 기준으로 개편.
- `audit-action-case-trace.js` 추가.
- Audit Case와 개선조치 Case를 동일 `sourceCaseId` 계열로 추적.
- 개선조치 Case에서 BEFORE / 실제 조치내용 / AFTER / 완료일 / 효과검증 / 재발여부를 관리.

## 2026-09-02 / 대시보드 폐쇄루프 연결

- `dashboard-operational-bridge.js` 추가.
- 메인 대시보드에서 고도화 조건 충족, Audit 6개월 관리중, 개선조치 미완료, 기한경과, 재발을 한 흐름으로 표시.
- 운영 KPI의 6개월 유지 개념을 `Audit 후 6개월 유지`로 전환.

## 2026-09-02 / Legacy Lifecycle 화면 표현 퇴역

- `legacy-lifecycle-retirement.js` 추가.
- 실행 화면에 남아 있던 1개월/3개월/6개월 Audit 표현을 현재 6개월 지속관리 모델 기준으로 치환.
- 기존 소스 이력은 삭제하지 않고 Historical로 보존.

## 2026-09-02 / 자동검증 계약 개편

- `.github/workflows/runtime-smoke.yml`을 5영역 기준으로 개편.
- JavaScript syntax, index script reference, 5영역 Navigation, Canonical KPI, Audit D-Day, 6개월 지속관리, 고도화 3대 조건, Demo 오염방지 계약을 검사.
- `.github/workflows/browser-smoke.yml`을 5영역 실제 클릭 전환 검증으로 개편.
- 최초 Browser Smoke 실패 원인은 시스템이 아니라 테스트 스크립트의 JavaScript SyntaxError였음.
- 테스트 스크립트 수정 후 5영역 Browser Smoke 성공 확인.
- Runtime Smoke 성공 확인.

## 2026-09-02 / 문서관리 체계 전환

- `README_OVERHAUL_20260902.md` 생성.
- 기존 `README.md` 최상단에서 현재 전면개편 기준문서를 우선 참조하도록 연결.
- 기존 `DEVELOPMENT_LOG.md`에서 과거 1/3/6 Audit 기준이 현재 기준으로 오인되지 않도록 현재 개편 이력을 추가.
- 이후 작업은 코드 변경 → 검증 → 개발일지 → README 갱신을 한 세트로 수행.

## 2026-09-02 / 미승인 세부 정책 상수 제거

### 요구사항
- 개선요청은 등록일 기준 D+7~D+14 범위에서 자동기한을 가져야 함.
- Audit 대상은 Risk 가중 랜덤 방식으로 자동 추출.
- 단, 정확한 7/10/14 분류기준이나 Risk 가중계수는 사용자 승인되지 않았으므로 업무규칙으로 하드코딩하지 않음.

### 변경 파일
- `hd20-policy-config.js` 신규
- `final-layout-polish.js`
- `audit-six-month-control.js`
- `audit-action-auto-link.js`
- `audit-closed-loop-workflow.js`
- `audit-random-draw.js`

### 구현 내용
- 중앙 정책 Store `hd20OperatingPolicyV1` 추가.
- 개선요청 Deadline 정책은 `minDays=7`, `maxDays=14`, `defaultDays=null` 상태로 시작.
- 정확한 자동지정 일수가 기준정보에서 설정되기 전에는 신규 Case에 임의 10일을 부여하지 않고 `정책미설정`으로 명시.
- 기존 코드의 `긴급·단순=7일 / 일반=10일 / 공정·구조변경=14일` 임의 분류 제거.
- 기존 `기한임박 <=3일` 임의 경계 제거.
- Audit Risk 기존 하드코딩 계수 `prev*2 + cumulative*0.35 + overdue*1.5 + recurrence*2` 제거.
- Risk 가중치 정책이 설정되지 않은 동안에는 모든 Eligible 생산현장팀을 동일 확률로 랜덤 추출.
- 정책이 설정되면 전월/누적/기한경과/재발 가중치를 기준정보 값으로 계산.
- Audit 추출이력에 `riskPolicyApplied` 상태를 저장하여 당시 균등/가중 여부를 추적.

### 검증 포인트
- 미승인 7/10/14 분류 문구가 Audit 입력 UI에서 제거되었는지 확인.
- 미승인 고정 Risk 계수가 코드에서 제거되었는지 확인.
- 기존 `due` 값이 있는 Case는 변경하지 않음.
- 정책 미설정 상태가 사용자 화면에서 명확하게 표시되는지 확인.

## 2026-09-02 / 통합기준정보 운영정책 편집기 추가

### 요구사항
- 세부 정책값을 소스코드가 아니라 기준정보에서 관리한다.
- 정확한 자동기한 일수, Risk 가중치, Audit 표본수는 사용자/운영자가 설정할 수 있어야 한다.

### 변경 파일
- `operating-policy-master.js` 신규
- `final-layout-polish.js`

### 구현 내용
- 통합기준정보 Modal에 `운영정책` 탭을 동적으로 추가.
- 개선요청 자동기한 기본일수는 7~14 정수만 저장 가능.
- Audit Risk 가중 적용 여부와 전월 개선요청 / 누적 개선요청 / 기한경과 / 재발의 4개 가중치를 편집 가능.
- Risk 적용 체크 시 4개 값이 모두 0 이상 숫자인지 검증.
- Audit 표본수는 1 이상의 정수만 입력 가능하며 미설정 상태도 허용.
- 정책 저장 시 `hd20OperatingPolicyV1`에 저장하고 `hd20-policy-updated` 이벤트를 발생시켜 Audit/개선조치 화면에 즉시 반영.
- 정책 미설정 상태를 숨기지 않고 화면에 `정책미설정` 또는 `균등 랜덤`으로 표시.

## 2026-09-02 11:33 KST / 전면개편 1차 main 배포

### 반영 방식
- 작업 브랜치 `hd20-overhaul-20260902`에서 Runtime Smoke 및 Browser Smoke 성공 확인 후 Pull Request #1 생성.
- PR #1 `HD-20 2026-09-02 전면개편 배포`를 `main`에 병합.
- main 배포 기준 Merge Commit: `28f53aa2aceabed41eda554235dae8e429a74ee5`.

### main 배포 검증
- Runtime Smoke run #129: **success**.
- Browser Smoke run #72: **success**. 5개 영역 실제 클릭 전환 포함.
- Package HD20 source run #333: **success**.
- GitHub Pages build/deployment run #524: **success**.

### 배포된 주요 범위
- 5영역 Navigation 및 통합 레이어.
- 고도화 1/2/3조건 × 작업장/라인 분석.
- 실제 Audit 실시일 기준 6개월 지속관리.
- Risk 랜덤 Audit 정책 구조.
- Audit ↔ 개선조치 Case 연계 및 효과/재발 추적.
- 개선요청 D+7~D+14 정책 구조 및 운영정책 Master.
- 운영 폐쇄루프 Dashboard Bridge.
- Runtime/Browser 회귀검증 체계.

### 다음 작업
- 정적 `index.html`에 남은 7탭 및 1/3/6 Audit Legacy 문구를 실제 소스에서 제거.
- Audit 표본수 설정을 중복 없는 다중 랜덤 추출에 연결.
- 다중 Audit 선정 건의 통지/실시/6개월 관리 UX 정리.
- 각 변경 후 main 배포 및 개발일지/README 갱신을 반복.
