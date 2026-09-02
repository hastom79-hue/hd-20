# HD-20 Current Status — 2026-09-02

이 문서는 2026-09-02 전면개편의 **현재 구현상태**를 빠르게 확인하기 위한 README이다. 업무기준은 `README_OVERHAUL_20260902.md`, 상세 변경이력은 `DEVELOPMENT_LOG_20260902*.md`를 함께 참조한다.

## 현재 5영역
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 상단 Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다.

## 고도화 분석
- 시각화·형적관리
- 인간공학적 Green Zone
- 정량축소·정위치 변경을 통한 공간 활용
- 정확 1조건 / 정확 2조건 / 정확 3조건으로 중복 없이 분류.
- 작업장과 라인 적용범위를 분리.
- 라인 정보가 없는 경우 작업장명에서 임의 추정하지 않음.

## Audit 현재 운영모델
`Risk 가중 랜덤 대상추출 → Audit 실시(D-Day) → 실시일 기준 6개월 지속관리 → 개선요청/개선조치 → 효과검증·재발 → 종료평가 → 차기 Risk 참고`

과거 `1개월 점검 / 3개월 Audit / 6개월 Audit` 고정 Lifecycle은 현재 운영모델에서 사용하지 않는다.

## Audit Batch
- 기준정보의 Audit 표본수를 실제 일괄추출에 연결.
- 동일 Batch 내 중복 없는 추출.
- Risk 정책 미설정 시 균등 랜덤.
- 선정된 팀별로 `Audit 실시일 / 결과 / 작업장 / 실시자 / 개선요청` 개별 등록 가능.
- 저장은 `hd20AuditRandomDrawsV1` Canonical Store 사용.
- 개선요청 발생 시 `hd20ActionCasesV2` Canonical Action Case 자동연계.

## 개선요청 Deadline
- 등록일 기준 D+7~D+14 범위.
- 정확한 자동지정 일수는 `통합기준정보 > 운영정책`에서 설정.
- 임의 긴급/일반/복잡 분류나 임의 10일 Default를 업무기준으로 사용하지 않음.

## 6개월 종료평가
- Audit 실시일 + 달력 기준 6개월이 지난 Case만 평가 가능.
- 종료평가 값: `유지 / 미흡`.
- 평가근거와 평가일시 저장.
- `미흡` 결과 자체에 임의 Risk 가중계수를 부여하지 않음.
- 기존 개선요청·기한경과·재발 이력은 차기 Audit Risk 입력으로 유지.

## Legacy 제거 진행상태
- `hdps-dashboard.js`: Canonical Audit/Action Store 직접 사용.
- `hdps-dashboard-current-model.js`: 삭제.
- `maturity-seq-action-link.js`: 1M/3M/6M UI 생성 제거, 임시 Compatibility Adapter로 전환.
- `audit-summary-drilldown.js`: `Audit 실시 대기 / 6개월 관리중 / 종료평가 대기 / 종료평가 완료`로 전환.
- `dashboard-grid-drilldown.js`: `6개월 Audit 결과`, `3개월 AUDIT`, `1·3·6개월 Lifecycle` 상세 Grid 제거.

## 검증
자동검증은 다음을 수행한다.
- 전체 JavaScript syntax check.
- 정적 5영역 Navigation.
- Canonical KPI/Audit/Action Store 계약.
- Audit 표본수 및 Batch 무중복 추출.
- Browser E2E에서 표본수 3 주입 → 3개 고유팀 추출 → 1건 Audit 실시등록 → 대기 2건 감소 검증.
- HDPS 대시보드 직접 진입 및 KPI/Action Summary 검증.

### 최근 검증 이슈
- Browser Smoke run #98은 Batch 기능 검증 전에 메인 화면의 구형 Lifecycle UI를 감지하여 실패함.
- 원인: `maturity-seq-action-link.js`가 1M/3M/6M UI를 실제 렌더링하고 있었음.
- 해당 파일을 Canonical Audit Compatibility Adapter로 교체함.
- Runtime Smoke run #164는 `audit-close-evaluation.js` 안내문 내 백틱으로 인한 JavaScript SyntaxError를 감지하여 실패함.
- SyntaxError는 커밋 `18c8e2397c6706ac165cdc473c2ffe522c1a525d`에서 수정함.
- 수정 후 Runtime/Browser/Pages 검증은 재실행되며, 완료 전에는 성공으로 간주하지 않는다.

## 주요 최신 개발일지
- `DEVELOPMENT_LOG_20260902.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_BATCH.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_CLOSE.md`
- `DEVELOPMENT_LOG_20260902_HDPS_CANONICAL.md`
- `DEVELOPMENT_LOG_20260902_LEGACY_ADAPTER.md`

## 다음 작업
- 최신 Runtime/Browser/Pages 검증 결과 확정 및 실패 시 즉시 교정.
- 남은 `HD20MaturityFollowup` 참조를 Canonical Audit Store로 단계적 제거.
- 종료평가 결과를 Dashboard/Case Trace 상세 Grid에 노출.
- 운영정책과 Batch E2E를 계속 회귀검증에 유지.
