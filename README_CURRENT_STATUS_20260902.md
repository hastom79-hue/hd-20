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
`Risk 가중 랜덤 대상추출 → Audit 실시(D-Day) → 실시일 기준 6개월 지속관리 → 개선요청/개선조치 → 효과검증·재발 → 종료평가 → 차기 Audit 판단 근거`

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
- 통합 대시보드에서 `종료평가 대기 / 유지 / 미흡`을 각각 집계.
- Audit Case Trace에서 6개월 종료일, 종료평가 상태, 평가근거를 동일 Case 행에서 확인 가능.
- Trace 흐름은 `BEFORE → 조치 → AFTER → 효과검증 → 재발 → 종료평가`까지 연결됨.

## Legacy 제거 진행상태
- `hdps-dashboard.js`: Canonical Audit/Action Store 직접 사용.
- `hdps-dashboard-current-model.js`: 삭제.
- `maturity-seq-action-link.js`: 1M/3M/6M UI 생성 제거, 임시 Compatibility Adapter로 전환.
- `audit-summary-drilldown.js`: `Audit 실시 대기 / 6개월 관리중 / 종료평가 대기 / 종료평가 완료`로 전환.
- `dashboard-grid-drilldown.js`: `6개월 Audit 결과`, `3개월 AUDIT`, `1·3·6개월 Lifecycle` 상세 Grid 제거.
- 메인 승인 대시보드의 Legacy Audit 표현은 Current Model 보정 레이어에서 현재 상태로 치환하며, 5영역 유효성 기준도 적용.

## 최신 자동검증 결과

배포 기준 commit `a1a2f76db942bb7b9d21a22cb4599308b44e2b4b`에서 다음 검증을 완료했다.

- Runtime Smoke run #173: **success**.
- Browser Smoke run #116: **success**.
- Package HD20 source run #377: **success**.
- GitHub Pages build/deployment run #568: **success**.

Browser #116이 검증한 실제 사용자 흐름:
- 메인 5영역 Navigation과 Legacy Audit 문구 부재.
- 테스트 정책 `Audit 표본수=3` 주입.
- 실제 `대상 일괄추출` 실행.
- 같은 Batch에서 3개 팀 생성 및 3개 팀 모두 고유함 확인.
- Batch 실시대기 선택지 3건 확인.
- 첫 대상에 `Audit 실시일=2026-09-02`, `결과=적합`, 작업장/실시자를 실제 입력 후 저장.
- Canonical Audit Store에서 auditDate 저장 1건 확인.
- 실시대기 선택지가 3건 → 2건으로 감소 확인.
- `hdps-dashboard.html` 직접 진입 후 5영역, KPI 6종, Action Summary 4종, `Audit 후 6개월 유지율` 확인.

테스트에서 사용한 `개선기한 7일`은 E2E용 임시 정책값이며 실제 운영정책을 7일로 확정한 것이 아니다.

종료평가 Dashboard/Trace 연결 이후 최신 Runtime/Browser/Pages 검증은 다시 실행되며, 완료 전에는 성공으로 간주하지 않는다.

## 검증 과정에서 발견·수정한 사항
- Browser #98: `maturity-seq-action-link.js`가 1M/3M/6M UI를 실제 렌더링하던 문제 검출 → Compatibility Adapter로 전환.
- Runtime #164: `audit-close-evaluation.js` 안내문 템플릿 문자열 SyntaxError 검출 → 수정.
- Browser #109: `approved-landing-v2.js`가 메인 승인 대시보드에서 Legacy Audit 문구를 재생성하는 문제 검출 → Current Model 보정 강화.
- Browser #112: Batch `<option>` 3건이 이미 DOM에 존재했지만 Playwright가 option visibility를 기다려 timeout → `option count===3` 조건으로 수정.
- Browser #116: 전체 E2E 최종 성공.

## 데이터 의미판정
- `미발생`을 `발생` 부분문자열 때문에 재발로 오인하지 않도록 명시값 기준으로 판정.
- Audit Risk와 6개월 지속관리 모두 문제내용/상태 텍스트의 단순 `재발` 단어 포함 여부를 재발 근거로 사용하지 않음.
- `부적합`을 `적합` 부분문자열 때문에 효과검증 성공으로 오인하지 않도록 명시값 기준으로 판정.
- 사용자 입력/원천값을 HTML에 삽입하는 보정 로직은 escape 처리 유지.

## 주요 최신 개발일지
- `DEVELOPMENT_LOG_20260902.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_BATCH.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_CLOSE.md`
- `DEVELOPMENT_LOG_20260902_HDPS_CANONICAL.md`
- `DEVELOPMENT_LOG_20260902_LEGACY_ADAPTER.md`
- `DEVELOPMENT_LOG_20260902_APPROVED_LANDING_AUDIT.md`
- `DEVELOPMENT_LOG_20260902_SEMANTIC_FIX.md`

## 다음 작업
- 최신 Runtime/Browser/Pages 검증 결과 확정.
- 종료평가 표시를 Browser E2E fixture로 확장하여 `대기/유지/미흡` 회귀검증 강화.
- 남은 `HD20MaturityFollowup` 활성 참조를 Canonical Audit Store로 단계적으로 제거.
- `approved-landing-v2.js`의 장기 구조 리팩터링을 메인 배치 안정성을 해치지 않는 범위에서 진행.
- 운영정책과 Batch E2E를 계속 회귀검증에 유지.
