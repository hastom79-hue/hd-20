# HD-20 Risk / 종료평가 실행검증 보완 — 2026-09-12

## 검증 범위
- Audit Risk 중복계상 여부
- 과거 6개월 종료평가 `미흡`의 누적정책
- 1 Audit : N Action 구조에서 종료평가 `유지` 판정 정확성
- 6개월 관리 KPI의 실제 달력기간 반영 여부
- 최신 브라우저 캐시 및 Pages 배포 SHA 검증

## 발견 및 수정

### 1. 과거 `미흡` 종료평가 영구 누적 제거
기존 `retentionWeakCount(team)`은 해당 팀의 과거 `미흡` 종료평가를 전부 누적했다. 이후 더 최신 Audit가 `유지`로 정상 종료되어도 과거 미흡이 계속 Risk에 남을 수 있었다.

수정 후에는 팀별 종료평가 완료 Audit 중 `finalEvaluationAt || auditDate || date` 기준 가장 최신 1건만 현재 6개월 종료평가 Risk 상태로 인정한다.
- 최신 종료평가=`미흡` → 유지미흡 Risk 1
- 최신 종료평가=`유지` → 유지미흡 Risk 0
- 더 오래된 과거 `미흡`은 현재 Risk에서 자동 해제

### 2. `재발`과 종료평가 `미흡`의 동일 원인 이중가중 제거
최신 종료평가가 `미흡`이고 같은 Audit ID에 정확 연결된 Action이 완료+효과검증+재발 상태이면, 동일 원인이 `재발` Risk와 종료평가 `미흡` Risk에 동시에 반영될 수 있었다.

수정 후:
- 정확 Audit ID로 연결된 재발 Action이 있으면 재발 Risk에만 반영
- 같은 Audit의 종료평가 미흡은 `maturityWeak` 추가가중에서 제외
- Audit Batch 원천에 `riskRetentionRecurrenceCovered`를 저장해 중복제외 여부를 역추적 가능

### 3. 1 Audit : N Action 종료평가 `유지` 판정 Guard
`audit-close-evaluation.js`에서 종료평가 전에 정확 Audit ID로 연결된 생산 Action을 전부 조회한다.

개선요청/부적합 Audit의 `유지` 판정 조건:
1. 정확 Audit ID 연계 Action이 최소 1건 존재
2. 연결 Action 전체 완료
3. 완료 Action 전체 효과검증 완료
4. 재발 Action 0건

하나라도 미충족이면 `유지` 저장을 차단한다. `미흡`은 문제 잔존 상태를 기록할 수 있도록 허용한다.

종료평가 저장 시 다음 근거도 Audit 원천에 보존한다.
- `finalEvaluationLinkedActions`
- `finalEvaluationOpenActions`
- `finalEvaluationUnverifiedActions`
- `finalEvaluationRecurrenceActions`

종료평가 화면에도 Action 연계 건수와 `미완료 / 효과미검증 / 재발 / 폐쇄완료` 상태를 표시한다.

### 4. `6개월 관리중` KPI 달력기간 정합성 보정
기존 KPI Evidence는 `Audit 실시일 존재 + 종료평가 없음`만으로 `6개월 관리중`을 계산했다. 따라서 실제 Audit 실시일 기준 달력 +6개월이 이미 지난 종료평가 대기 Case도 관리중으로 포함될 수 있었다.

`hd20-retention-evidence-guard.js`를 추가해 다음 두 Evidence에 동일한 날짜 기준을 적용했다.
- `dashboard.analysis`의 `6개월 관리`
- `audit.retention`의 `6개월 관리중`

판정기준:
- Audit 실시일 기준 달력 +6개월 종료일 `>= Asia/Seoul 오늘` → 관리중
- 종료일 다음 날부터 → 관리중 제외, 종료평가 대상/대기 영역

KPI Parity Guard가 Evidence 행 수를 최종 KPI 값으로 사용하므로, 이 보정은 사용자 표시 KPI와 상세근거 행 수에 동시에 반영된다. 기존 `hd20-ops-v2.js`의 구형 내부 계산을 대규모 재작성하지 않고 사용자 경로를 Canonical Evidence로 고정했다.

## 결정적 fixture 검증
- Fixture A: 과거 `미흡` → 최신 `유지` ⇒ 종료평가 유지미흡 Risk = 0
- Fixture B: 최신 `미흡` + 동일 Audit ID 재발 Action ⇒ 종료평가 유지미흡 Risk = 0, 재발 Risk에서만 반영
- Fixture C: 1 Audit에 Action 3건, 그중 1건 미완료 ⇒ `유지` 저장 차단
- Fixture D: Action 3건 모두 완료, 1건 효과 미검증 ⇒ `유지` 저장 차단
- Fixture E: Action 3건 모두 완료·효과검증, 1건 재발 ⇒ `유지` 저장 차단
- Fixture F: Action 3건 모두 완료·효과검증·미재발 ⇒ `유지` 저장 허용
- Fixture G: Audit 실시일 +6개월 종료일이 오늘 ⇒ `6개월 관리중` 포함
- Fixture H: Audit 실시일 +6개월 종료일이 어제 ⇒ `6개월 관리중` 제외

## 현재 캐시 기준
- `audit-random-draw.js?v=20260912-maturity-7`
- `final-layout-polish.js?v=20260912-13`
- 동적 `operating-policy-master.js?v=20260912-4`
- 동적 `audit-close-evaluation.js?v=20260912-3`
- 동적 `hd20-retention-evidence-guard.js?v=20260912-1`
- `action-audit-linkage.js?v=20260912-3`

## 회귀 방지
- `index.html`의 `고도화 작업장 추이` 카드 내 `<div class="cardBody"><div class="trendBox"></div></div>` 보존 확인.
- Demo/E2E는 생산 Risk/종료평가/KPI Evidence 계산에서 제외.
- Activity→Audit 임의 lineage는 생성하지 않음.
- Audit→Action은 `auditDrawId || sourceCaseId`와 Audit ID 정확일치만 사용.
- 선택형 `maturityWeak` 가중치가 0/미설정이면 신규 유지미흡 로직이 추출확률을 변경하지 않음.
- 실제 브라우저 E2E 성공은 Runner가 테스트 step을 실제 수행한 경우에만 선언한다.
