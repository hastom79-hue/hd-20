# HD-20 개발일지 — Audit 다중 랜덤 추출 연결

> 일시: 2026-09-02
> 대상: `main`
> 연계 문서: `DEVELOPMENT_LOG_20260902.md`, `README_OVERHAUL_20260902.md`

## 요구사항

`통합기준정보 > 운영정책`에서 관리하는 Audit 표본수를 실제 대상 자동 추출에 연결한다. 한 번의 추출 Batch 안에서는 동일 생산현장팀이 중복 선정되면 안 된다. Risk 가중치는 설정된 경우에만 사용하고, 미설정 상태에서는 균등 랜덤을 유지한다.

## 발견한 결함

`operating-policy-master.js`는 `auditRisk.sampleCount`를 저장하고 있었지만 `hd20-policy-config.js`의 기본 정책과 read/write 경로에서 `sampleCount`가 명시적으로 보존되지 않아 중앙 정책 API를 통한 조회가 불안정했다.

## 변경 파일

- `hd20-policy-config.js`
- `audit-random-draw.js`
- `audit-batch-execution.js`
- `final-layout-polish.js`
- `.github/workflows/runtime-smoke.yml`

## 구현 내용

- 중앙 정책 기본값에 `auditRisk.sampleCount:null` 추가.
- `HD20PolicyConfig.auditSampleCount()` 추가.
- Audit 표본수가 미설정이면 임의로 1건을 추출하지 않고 `통합기준정보 > 운영정책` 설정 필요 상태를 표시.
- `pickTeams(count)` 구현.
- 설정된 표본수만큼 하나의 Batch에서 자동 추출.
- 가중 랜덤 추출 후 선택된 팀을 후보배열에서 제거하는 방식으로 **without replacement** 구현.
- 같은 Batch에서 동일 팀 중복선정 방지.
- `batchId`, `batchIndex`, `batchSize`를 추출이력에 저장.
- 다중 선정 결과를 화면에 카드형 목록으로 표시하고 개별 팀을 선택하여 메일/Outlook/자동발송 대상으로 전환 가능.
- Risk 정책 미설정 상태에서는 모든 Eligible 팀에 동일 weight=1을 적용하여 균등 랜덤.
- 표본수가 전체 Eligible 팀 수를 초과하면 추출을 중단하고 오류 안내.

## Batch 실시결과 등록 UX

`audit-batch-execution.js`를 추가하여 기존 `audit-closed-loop-workflow.js`의 Canonical `registerAudit()`를 그대로 재사용하면서 Batch 선택 기능을 확장했다.

- 실시대기 상태의 모든 Audit 추출건을 선택 목록으로 표시.
- Batch 번호, Batch 내 순번, 생산팀, 추출일을 함께 표시.
- 선택한 팀에 대해 `Audit 실시일 / 결과 / 대상 작업장 / 실시자 / 개선요청사항`을 등록.
- 결과가 `개선요청` 또는 `부적합`이면 개선요청사항 입력을 필수로 유지.
- 저장은 기존 `HD20AuditClosedLoop.registerAudit()`를 사용하여 `hd20AuditRandomDrawsV1`에 반영.
- 기존 `syncAction()` 흐름을 그대로 사용하므로 개선요청 발생 시 `hd20ActionCasesV2`에 자동 Case가 생성됨.
- 저장 후 해당 Batch의 `실시완료건수 / 전체건수` 진행상태를 표시.
- 처리 완료된 대상은 실시대기 선택 목록에서 자동 제외.
- 별도 Store를 만들지 않아 Audit 추출/실시 데이터가 분리되지 않도록 함.

`audit-closed-loop-workflow.js` 전체 교체 방식은 보안 게이트에서 차단되어, 검증된 기존 로직을 유지하고 별도 확장 모듈을 로드하는 방식으로 구현했다.

## 자동검증 보강

Runtime Smoke에 다음 계약을 추가했다.

- `sampleCount:null` 정책 기본값 존재.
- `auditSampleCount()` 존재.
- `pickTeams()` 존재.
- 선택 후 `available.splice()`로 후보 제거하여 중복 방지.
- Batch ID 기록.
- 표본수 미설정 상태 안내.
- Master의 `data-op-sample` 입력 존재.

추가로 전체 JavaScript `node --check`가 `audit-batch-execution.js`도 자동 검사한다.

## 커밋

- `a411822034d524c2081880175c02f601febdfb79` — sampleCount 중앙 정책 보존 수정.
- `5482ac1c48e301c2facf2c2fe95e92cfebf362d0` — 표본수 기반 중복 없는 Batch 추출 구현.
- `dab4cdf28832f9d65a5d36b245489a52f1945abd` — Runtime Smoke 계약 보강.
- `3fd7b3a95dcb47a50c004b68d089c1693765881e` — Batch 실시대상 선택/등록 확장 모듈 추가.
- `2c47eafb0e7197c5eb355440c6b7f612422f4878` — Batch 실행 모듈 화면 로딩 연결.

## 검증 상태

- Runtime Smoke run #134: **success**.
- Browser Smoke run #77: **success**.
- 최신 Batch 실행 UX 변경분은 main push 후 Runtime/Browser/Pages 재검증 중이며 완료 전에는 성공으로 간주하지 않는다.

## 후속사항

- Browser Smoke에서 정책값을 LocalStorage에 주입한 뒤 실제 다중 추출 버튼을 클릭하여 선택 수와 중복 0건을 확인하는 E2E 테스트 추가.
- Batch별 Audit 실시결과 등록 E2E 테스트 추가.
- 6개월 지속관리 종료평가와 차기 Audit Risk 환류 UI를 한 화면에서 추적 가능하도록 연결.
