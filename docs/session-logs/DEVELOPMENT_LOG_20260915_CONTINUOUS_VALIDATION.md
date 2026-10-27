# HD-20 개발일지 — 연속 실행·검증 2026-09-15

## 목적
사용자 요청에 따라 기존 정상기능을 유지하면서 잔여 결함을 반복 검증하고, 확인된 결함만 최소 범위로 수정한다.

## 이번 검증 범위
- Action Case → Exact Audit Trace 연결 규칙 재확인
- 고도화 맵 → Activity Grid → 원 Case 복귀 구조 확인
- 고도화 맵 Activity ID 무결성 Guard와 우선순위/필터 Guard 교차검증
- Production 데이터 보호 로직 유지 확인

## 발견 결함
`hd20-maturity-map-priority-filter-guard.js`가 Case 상태 계산 시 Activity ID를 Map key로 사용했다.

Activity ID가 정상적으로 유일하면 문제가 없지만, ID Integrity Guard가 실제로 방어하려는 "중복 Activity ID" 상태에서는 같은 ID의 뒤쪽 Case가 앞쪽 Case를 덮어쓸 수 있었다.
그 결과 중복 ID Case는 Drill-down 자체는 차단되어도, 카드의 우선순위 정렬과 `유지미흡 / 재점검 필요 / 현재 유지` 필터 판정이 다른 중복 Case의 상태를 참조할 가능성이 있었다.

## 수정
Activity ID Map lookup을 제거하고 기존 Core Map의 안정키를 그대로 사용하도록 변경했다.
- 생산팀
- `data-mmt-case` 원본 인덱스

즉 DOM 정렬 여부와 Activity ID 중복 여부에 관계없이 팀별 canonical source의 원 Case를 직접 역매핑한다.

추가로 `validate()`를 노출하여 현재 렌더링된 Case 카드 수와 canonical 원본 매핑 성공 수를 비교할 수 있게 했다.

## 변경 파일
- `hd20-maturity-map-priority-filter-guard.js`
  - commit `f3d70c7661bf06f1374dd4b3dccddf7f9a3543e1`
- `final-layout-polish.js`
  - guard cache `v=20260914-2` → `v=20260915-1`
  - commit `92ae12a4da03b100f927f5f444adea4630588e1f`
- `index.html`
  - `final-layout-polish.js?v=20260914-38` → `final-layout-polish.js?v=20260915-1`
  - commit `8f2091b782427b702f184728a6dd07f4c3c50921`
  - 재조회 결과 신규 cache key 반영 확인
- `.github/workflows/browser-smoke.yml`
  - main 기대 nav를 6영역으로 분리
  - HDPS dashboard 기대 nav는 기존 5영역 유지
  - main 왕복 smoke에 `maturitymap` 포함
  - commit `caed3325be526d616b4ae19da3511d2791b0384d`

## 회귀방지 확인
변경하지 않은 규칙:
- 공식확정 판정은 `HD20KPIData.isConfirmed()`
- 유지 판정은 운영 Guard의 `stateOf()`
- 중복/누락 Activity ID는 ID Integrity Guard에서 exact Drill-down 차단
- Audit↔Action은 `auditDrawId || sourceCaseId` exact ID 기준
- 팀명/작업장 유사도 기반 임의 lineage 생성 금지
- Supabase Production sanitize/preserve 정책 유지

## CI / 배포 기술검증
- exact SHA `8f2091b782427b702f184728a6dd07f4c3c50921`에서 Browser Smoke run `34909083051`, Nav Scroll Smoke run `34909083054` 실패를 확인했다.
- Browser Smoke raw job log는 GitHub/Azure Blob `BlobNotFound`로 회수되지 않아 이 시점에는 앱 회귀로 단정하지 않았다.
- 이후 최신 main `f7b7f16364bcc71304e63e4c13d2e36924125ffb`에서도 서로 다른 workflow가 동일 패턴으로 실패함을 확인했다.
  - Runtime Smoke run `34911473287`: job `smoke`가 failure이나 step 목록이 비어 있음.
  - Package Source run `34911473301`: job `package`가 failure이나 step 목록이 비어 있음.
  - Browser Smoke의 최근 job 역시 step 목록이 비어 있고 raw log가 생성되지 않음.
- 따라서 해당 시점 GitHub Actions 적색 상태는 특정 HD-20 JavaScript 계약 실패가 아니라 Runner/Actions 실행 전 단계의 시스템성 실패 패턴으로 분리한다. 실제 test step이 실행되기 전 실패하므로 기능 회귀 판정 근거로 사용하지 않는다.

## Browser Smoke 계약 수정
- `runtime-smoke.yml`의 canonical IA와 실제 main은 `dashboard / activity / advancement / maturitymap / audit / action` 6영역이다.
- 별도 `hdps-dashboard.html`은 `dashboard / activity / advancement / audit / action` 5영역이다.
- 기존 `browser-smoke.yml`은 하나의 5영역 `expected`를 main과 HDPS 양쪽에 재사용하여 Runner 정상화 시 main assertion이 필연적으로 실패하는 계약 드리프트가 있었다.
- 이를 `expectedMain` 6영역 / `expectedHdps` 5영역으로 분리하고 main 왕복 smoke에 `maturitymap`을 추가했다.
- 애플리케이션 로직은 변경하지 않았으며 테스트 계약만 실제 IA에 맞췄다.

## Exact lineage 재검증
- `action-audit-linkage.js`는 pending Audit ID를 `auditDrawId`로 보존하고 Action 생성 후 `sourceCaseId`와 `auditDrawId`에 동일 ID를 기록한다.
- `hd20-trace-backlink-guard.js`는 Case Detail의 `원천 Audit ID`만 읽고 Audit 유지관리 표에서 셀 텍스트가 exact ID와 동일한 행만 복귀 대상으로 선택한다.
- `hd20-maturity-map-operational-guard.js`는 고도화 Case를 팀 + `data-mmt-case` 원본 인덱스로 canonical source에 매핑하고 Activity Grid 진입/복귀는 exact Activity ID를 사용한다.

## 잔여 검증
1. 신규 Browser Smoke commit에서 Actions Runner가 실제 step 실행 단계로 복구되는지 확인
2. Browser Smoke main 6영역 / HDPS 5영역 계약 실제 실행 확인
3. Pages가 수정 SHA를 실제 배포했는지 확인
4. 실제 브라우저에서 `HD20_MATURITY_PRIORITY_FILTER_GUARD.validate()` 결과 `mappingSafe=true` 확인
5. 중복 ID Case 2건의 상태가 서로 달라도 각각의 정렬/필터가 원 Case 기준으로 유지되는지 확인
6. 고도화 맵 → Activity Grid → 원 Case 복귀 후 필터 자동복원/전체 전환 확인
7. Production canonical source의 Activity ID 중복/누락 실데이터 건수 확인
8. Supabase 인증 세션에서 sanitize push 후 remote `updated_at` 변경 및 non-production 0 확인
