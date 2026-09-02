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
- `maturity-seq-action-link.js`: **Compatibility Adapter까지 완전 삭제**.
- 활성 JavaScript에서 `HD20MaturityFollowup` 전역 참조 제거.
- `audit-summary-drilldown.js`: `Audit 실시 대기 / 6개월 관리중 / 종료평가 대기 / 종료평가 완료`로 전환.
- `dashboard-grid-drilldown.js`: `6개월 Audit 결과`, `3개월 AUDIT`, `1·3·6개월 Lifecycle` 상세 Grid 제거.
- `approved-landing-v2.js`: `hd20AuditRandomDrawsV1` 직접 사용, 5영역 `navCount===5`, `Audit 후 6개월 유지율`, `Audit 후 6개월 관리 대상` 원본 적용.
- 승인 대시보드의 `3개월 AUDIT`, `실제 6개월 Audit 결과`, `AUDIT 6개월 유지율`, `navCount===7` 제거.
- `legacy-lifecycle-retirement.js`의 승인 대시보드 후처리 `patchApprovedLanding()` 제거. 이 파일은 구형 Side Card 안전 치환만 담당.

## 최신 확정 자동검증 결과
배포 기준 commit `587dd943f85942bc142b23d53fe36e30bb657b92`에서 다음 검증을 모두 완료했다.

- Runtime Smoke run #186: **success**.
- Browser Smoke run #129: **success**.
- Package HD20 source run #390: **success**.
- GitHub Pages build/deployment run #581: **success**.

Browser #129는 기존 Audit Batch E2E와 함께 6개월 종료평가 E2E까지 검증한다.
- 메인 5영역 Navigation 및 Legacy Audit 문구 부재.
- 표본수 3 → 동일 Batch 3개 고유팀 추출.
- 1건 Audit 실시등록 후 대기 3건 → 2건 감소.
- 6개월이 지난 Audit Case fixture 생성.
- 종료평가 `미흡`과 평가근거 저장.
- Canonical Audit Store의 `finalEvaluation / finalEvaluationNote / finalEvaluationAt` 확인.
- Audit Case Trace와 통합 대시보드에서 동일 종료평가 상태 확인.
- `hdps-dashboard.html` 직접 진입 후 5영역, KPI 6종, Action Summary 검증.

테스트에서 사용하는 `개선기한 7일`은 E2E용 임시 정책값이며 실제 운영정책을 7일로 확정한 것이 아니다.

## 최근 추가 변경 — 검증 재실행 중
확정 검증 commit 이후 다음 구조정리를 `main`에 추가 반영했다.

- `c8417830a710fe3b5867f02c89db0da7d99548d5`: `maturity-seq-action-link.js` 완전 삭제.
- `7af701a76c2e9b75fa8304dd733e200feec119a8`: Adapter 퇴역 Runtime 계약.
- `28406ba53ed7effe55159d07b5c8db626b74dbfb`: 승인 대시보드 원본 Canonical 전환.
- `d6cd920062fd82c3db017dbe53b75949bf79f5cf`: 승인 대시보드 후처리 의존 제거.
- `3c326202bc2357aa3cbe9f1a6aebcb1cad1b0a87`: 승인 대시보드 Canonical Runtime 계약.
- `898d1013e0d6b47c14ce8116850214f8e06a1dc8`: Adapter 퇴역 개발일지 현행화.

위 변경 이후 최신 Runtime/Browser/Package/Pages는 다시 실행되며 완료 전에는 성공으로 간주하지 않는다.

## 데이터 의미판정
- `미발생`을 `발생` 부분문자열 때문에 재발로 오인하지 않도록 명시값 기준으로 판정.
- Audit Risk와 6개월 지속관리 모두 문제내용/상태 텍스트의 단순 `재발` 단어 포함 여부를 재발 근거로 사용하지 않음.
- `부적합`을 `적합` 부분문자열 때문에 효과검증 성공으로 오인하지 않도록 명시값 기준으로 판정.
- 사용자 입력/원천값을 HTML에 삽입하는 로직은 escape 처리 유지.

## 주요 최신 개발일지
- `DEVELOPMENT_LOG_20260902.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_BATCH.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_CLOSE.md`
- `DEVELOPMENT_LOG_20260902_HDPS_CANONICAL.md`
- `DEVELOPMENT_LOG_20260902_LEGACY_ADAPTER.md`
- `DEVELOPMENT_LOG_20260902_APPROVED_LANDING_AUDIT.md`
- `DEVELOPMENT_LOG_20260902_SEMANTIC_FIX.md`

## 다음 작업
- Adapter/승인 대시보드 원본 전환 이후 최신 Runtime/Browser/Package/Pages 결과 확정 및 실패 시 즉시 교정.
- `legacy-lifecycle-retirement.js`가 실제 정적 Side Card에 계속 필요한지 확인하고 필요 없으면 파일 자체 퇴역 검토.
- 남은 구형 Audit/Lifecycle 문자열을 실행 코드 기준으로 전수검색.
- 운영정책과 Audit Batch/종료평가 Browser E2E를 계속 회귀검증에 유지.
