# HD-20 Current Status — 2026-09-02

이 문서는 2026-09-02 전면개편의 **현재 구현상태**를 빠르게 확인하기 위한 README이다. 업무기준은 `README_OVERHAUL_20260902.md`, 상세 변경이력은 `DEVELOPMENT_LOG_20260902*.md`를 함께 참조한다.

## 현재 5영역
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 상단 Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다.

## 고도화 분석 / 공식판정 분리
- 시각화·형적관리
- 인간공학적 Green Zone
- 정량축소·정위치 변경을 통한 공간 활용
- 정확 1조건 / 정확 2조건 / 정확 3조건으로 중복 없이 분류.
- 작업장과 라인 적용범위를 분리.
- 라인 정보가 없는 경우 작업장명에서 임의 추정하지 않음.
- 조건충족 분석은 성과·현상 분석축이며 공식확정 판정 자체와 동일시하지 않음.
- 공식판정은 생산혁신팀 + 5S 모듈의 판정결과를 사용.

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
- 통합 대시보드에서 `종료평가 대기 / 유지 / 미흡`을 각각 집계.
- Audit Case Trace에서 6개월 종료일, 종료평가 상태, 평가근거를 동일 Case 행에서 확인 가능.
- Trace 흐름은 `BEFORE → 조치 → AFTER → 효과검증 → 재발 → 종료평가`까지 연결됨.

## Canonical 구조정리 완료사항
- `hdps-dashboard.js`: Canonical Audit/Action Store 직접 사용.
- `hdps-dashboard-current-model.js`: 삭제.
- `maturity-seq-action-link.js`: Compatibility Adapter까지 완전 삭제.
- 활성 JavaScript에서 `HD20MaturityFollowup` 전역 참조 제거.
- `approved-landing-v2.js`: Canonical Audit Store 직접 사용, 5영역 `navCount===5`, `Audit 후 6개월 유지율`, `Audit 후 6개월 관리 대상` 원본 적용.
- 승인 대시보드의 `3개월 AUDIT`, `실제 6개월 Audit 결과`, `AUDIT 6개월 유지율`, `navCount===7` 제거.
- 공식확정 사례 영역에서 `2개 이상 조건 충족=공식확정`처럼 읽히는 문구 제거.
- `legacy-lifecycle-retirement.js`: 삭제.
- Side Card 갱신은 역할이 명확한 `dashboard-side-summary.js`로 분리.
- 정적 `index.html`에서 삭제된 Adapter script reference 제거.

## Demo / Seed 운영데이터 오염 방지
### Canonical Demo Seed
`demo-data-seed.js`가 Canonical Store가 비었을 때 5S 활동 120건, 개선조치 26건, 가상 팀장/이메일을 자동 생성하던 구조를 발견해 완전히 퇴역했다.

- `index.html`, `hdps-dashboard.html` 로딩 제거.
- `demo-data-seed.js` 삭제.
- `source:'demo-seed'` 재유입을 Runtime Smoke에서 차단.

### Action Demo Guard
`action-demo-seed.js`는 실제 Seed 기능 없이 `HD20_DEMO_ACTIONS`, `HD20_ACTION_DEMO_SEED_DISABLED` 두 전역만 설정하던 고립 파일이었다. 다른 활성 코드의 의존이 없음을 확인하고 로딩과 파일을 모두 삭제했다.

### Audit Checklist Master
과거 `audit-global-seed.js`는 현재 실적을 생성하지 않고 체크리스트 Master를 `result:'N/A'`, `score:0`으로 초기화하는 역할만 하고 있었다. 역할을 명확히 하기 위해 `audit-checklist-master.js`로 전환하고 구형 파일을 삭제했다.

- 체크리스트 결과 초기값은 계속 `N/A / 0`.
- 폐기된 `1·3·6개월 Audit` 문구를 `Audit 실시 후 6개월 지속관리 기간 동안 유지되는가?`로 교정.
- 실제 원천데이터가 없으면 임의 샘플로 운영 KPI를 채우지 않고 `0 / — / 데이터 없음`으로 표현.

상세 기록: `DEVELOPMENT_LOG_20260902_DEMO_RETIREMENT.md`.

## 데이터 의미판정
- `미발생`을 `발생` 부분문자열 때문에 재발로 오인하지 않도록 명시값 기준으로 판정.
- Audit Risk와 6개월 지속관리 모두 문제내용/상태 텍스트의 단순 `재발` 단어 포함 여부를 재발 근거로 사용하지 않음.
- `부적합`을 `적합` 부분문자열 때문에 효과검증 성공으로 오인하지 않도록 명시값 기준으로 판정.
- 사용자 입력/원천값을 HTML에 삽입하는 로직은 escape 처리 유지.

## 최근 확정 자동검증
Commit `587dd943f85942bc142b23d53fe36e30bb657b92`:
- Runtime Smoke #186: **success**
- Browser Smoke #129: **success**
- Package #390: **success**
- Pages #581: **success**

Commit `cd2ba4cabb7198bcdf538be628d854755a1fcfb5` 구조정리 기준:
- Runtime Smoke #198: **success**
- Browser Smoke #141: **success**
- Package #402: **success**

그 이후 공식판정 문구 분리, Demo seed 퇴역, Audit Checklist Master 전환, Action Demo Guard 삭제까지 추가 반영되었다. 최신 HEAD의 Runtime/Browser/Package/Pages는 다시 검증하며 완료 전에는 성공으로 간주하지 않는다.

## 주요 최신 개발일지
- `DEVELOPMENT_LOG_20260902.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_BATCH.md`
- `DEVELOPMENT_LOG_20260902_AUDIT_CLOSE.md`
- `DEVELOPMENT_LOG_20260902_HDPS_CANONICAL.md`
- `DEVELOPMENT_LOG_20260902_LEGACY_ADAPTER.md`
- `DEVELOPMENT_LOG_20260902_APPROVED_LANDING_AUDIT.md`
- `DEVELOPMENT_LOG_20260902_SEMANTIC_FIX.md`
- `DEVELOPMENT_LOG_20260902_DEMO_RETIREMENT.md`

## 다음 작업
- 최신 HEAD의 Runtime/Browser/Package/Pages 결과 확정 및 실패 시 즉시 교정.
- 실행 코드 전체에서 다른 Prototype/mock/seed가 Canonical 운영 Store에 자동 데이터를 넣는지 계속 전수검색.
- 남은 구형 Audit/Lifecycle 문자열을 실행 코드 기준으로 전수검색.
- Side Summary를 6개월 종료평가 상태와 더 직접 연결할 필요가 있는지 운영 관점에서 점검.
