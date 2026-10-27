# HD-20 Risk / 종료평가 실행검증 보완 — 2026-09-12~13

## 검증 범위
- Audit Risk 중복계상 여부
- 과거 6개월 종료평가 `미흡`의 누적정책
- 1 Audit : N Action 구조에서 종료평가 `유지` 판정 정확성
- 6개월 관리 KPI의 실제 달력기간 반영 여부
- 종료평가 저장 후 Dashboard / KPI Evidence / Canonical Grid / Trace 즉시 갱신
- 과거 Audit Batch Risk Snapshot 보존과 차기 Batch Risk 재계산
- Audit→Action Pending 오염 방지 및 1 Audit:N Action 추가등록 경로
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

### 4. `6개월 관리중` KPI 달력기간 정합성 보정
`hd20-retention-evidence-guard.js`를 통해 다음 두 Evidence에 동일 기준을 적용한다.
- `dashboard.analysis`의 `6개월 관리`
- `audit.retention`의 `6개월 관리중`

판정기준:
- 종료평가 완료 건은 관리중에서 제외
- Audit 실시일 기준 달력 +6개월 종료일 `>= Asia/Seoul 오늘` → 관리중
- 종료일 다음 날부터 → 관리중 제외, 종료평가 대상/대기 영역

KPI Parity Guard가 Evidence 행 수를 최종 KPI 값으로 사용하므로 사용자 KPI와 상세근거 행 수가 동일 기준으로 계산된다.

### 5. 열린 상세화면의 stale 데이터 제거
`hd20-live-data-refresh-guard.js`를 추가했다.

데이터 변경 이벤트 발생 시:
- 열린 KPI Evidence → 동일 KPI를 최신 원천으로 재조회
- 열린 Canonical Grid → 현재 탭 기준 최신 원천으로 재조회
- 검색어, 페이지 크기, 정렬 상태 복원
- 열린 Production Trace → 최신 Audit / Action 원천으로 재렌더링
- 이미 열려 있던 Row Detail / Case Detail → 오래된 값을 보여주지 않도록 닫음

대상 이벤트:
- `hd20-audit-updated`
- `hd20-audit-draw`
- `hd20-audit-performed`
- `hd20-action-updated`
- `hd20-gmes-5s-imported`
- `hd20-gmes-5s-judged`
- `hd20-refresh-requested`
- 생산 LocalStorage 3종 변경

### 6. Risk Snapshot 보존 / 차기 Batch 재계산 원칙 검증
Audit 추출 시 Batch 행에 당시 계산값을 Snapshot으로 저장한다.
- `riskPrev`
- `riskCumulative`
- `riskOverdue`
- `riskRecurrence`
- `riskMaturityWeak`
- `riskMaturityWeakAdvancement`
- `riskRetentionWeak`
- `riskRetentionState`
- `riskRetentionAuditId`
- `riskRetentionRecurrenceCovered`
- `riskWeight`
- `riskPolicyApplied`

종료평가 저장은 `finalEvaluation*` 필드만 갱신하고 과거 `risk*` Snapshot을 덮어쓰지 않는다. 따라서 과거 Batch는 당시 선정근거를 유지한다.

차기 Batch 생성은 `riskTable()` → `teamRisk()`를 매번 다시 계산하므로, 최신 종료평가가 `유지`로 바뀌면 다음 추출부터 `riskRetentionWeak=0`이 적용된다. 과거 Batch의 당시 `riskRetentionWeak=1`은 변경하지 않는다.

### 7. Audit→Action Pending 오염 차단
`action-audit-linkage.js`와 `hd20-audit-action-pending-guard.js`를 보완했다.
- Audit 개선요청에서 Action 등록 진입 시 exact Audit ID를 Pending으로 저장
- Action 생성 성공 후 Pending 삭제
- 모달 닫기/ESC/배경 클릭 시 Pending 삭제
- 일반 `+ 개선요청 등록` 진입 시 기존 Audit Pending 삭제
- legacy `hd20AuditToActionPending` 키는 1회 마이그레이션 후 제거
- 정상 Audit→Action 라우팅 중 서브탭 변경은 Pending을 임의 삭제하지 않음

따라서 취소한 Audit ID가 이후 일반 Action에 잘못 붙는 교차오염 경로를 차단한다.

### 8. 1 Audit : N Action 추가등록 공식 경로
`hd20-retention-action-bridge.js`를 추가했다.
- 6개월 유지관리 화면에서 종료평가 전 개선요청/부적합 Audit만 후보 노출
- Demo/E2E 제외
- 선택 Audit의 exact ID를 `sourceCaseId / auditDrawId`로 다시 전달
- 기존 Action은 수정하지 않고 신규 Action만 추가
- 현재 연계 Action 건수를 후보에서 표시
- Action 등록 후 `hd20-action-updated`로 유지관리/종료평가 화면 즉시 재계산
- 종료평가 완료 Audit은 추가등록 후보에서 제외

## 결정적 fixture 검증
- Fixture A: 과거 `미흡` → 최신 `유지` ⇒ 현재 종료평가 유지미흡 Risk = 0
- Fixture B: 최신 `미흡` + 동일 Audit ID 재발 Action ⇒ 종료평가 유지미흡 Risk = 0, 재발 Risk에서만 반영
- Fixture C: 1 Audit에 Action 3건, 그중 1건 미완료 ⇒ `유지` 저장 차단
- Fixture D: Action 3건 모두 완료, 1건 효과 미검증 ⇒ `유지` 저장 차단
- Fixture E: Action 3건 모두 완료·효과검증, 1건 재발 ⇒ `유지` 저장 차단
- Fixture F: Action 3건 모두 완료·효과검증·미재발 ⇒ `유지` 저장 허용
- Fixture G: Audit 실시일 +6개월 종료일이 오늘 ⇒ `6개월 관리중` 포함
- Fixture H: Audit 실시일 +6개월 종료일이 어제 ⇒ `6개월 관리중` 제외
- Fixture I: 이전 최신 종료평가 `미흡` 상태에서 Risk=1 → 다음 Audit 최신 종료평가 `유지` 저장 후 현재 Risk=0
- Fixture J: Fixture I 이후에도 과거 Batch의 `riskRetentionWeak=1`, `riskMaturityWeak=1` Snapshot은 그대로 보존
- Fixture K: Audit A Pending 상태에서 등록 취소 후 일반 Action 등록 ⇒ Audit A ID 미연계
- Fixture L: Audit A에 Action 1건 등록 후 유지관리 Bridge로 Action 2·3 추가 ⇒ 세 Action 모두 Audit A exact ID 유지
- Fixture M: Audit A에 3 Action 중 1 미완료/1 효과미검증/1 재발 각각 존재 시 `유지` 차단, 전부 완료+효과검증+미재발 시 허용

## 현재 캐시 기준
- `audit-random-draw.js?v=20260912-maturity-7`
- `final-layout-polish.js?v=20260913-19`
- 동적 `operating-policy-master.js?v=20260912-4`
- 동적 `audit-close-evaluation.js?v=20260912-3`
- 동적 `hd20-retention-evidence-guard.js?v=20260912-2`
- 동적 `hd20-live-data-refresh-guard.js?v=20260913-1`
- 동적 `hd20-batch-snapshot-guard.js?v=20260913-2`
- 동적 `action-audit-linkage.js?v=20260913-5`
- 동적 `hd20-audit-action-pending-guard.js?v=20260913-1`
- 동적 `hd20-retention-action-bridge.js?v=20260913-1`
- 동적 `dashboard-side-summary.js?v=20260912-4`

## 최신 배포 확인
- 기능 소스 main SHA: `dd1dfad729dc82c5a54ab621055debeba7298079`
- Pages build / report / deploy: success
- `pages_build_version`: `dd1dfad729dc82c5a54ab621055debeba7298079`
- 배포 결과: `Reported success!`

## 회귀 방지
- `index.html`의 `고도화 작업장 추이` 카드 내 `<div class="cardBody"><div class="trendBox"></div></div>` 보존 확인.
- `final-layout-polish.js`의 retired stylesheet 제거 MutationObserver 원형 보존 확인.
- Demo/E2E는 생산 Risk/종료평가/KPI Evidence/추가 Action 후보 계산에서 제외.
- Activity→Audit 임의 lineage는 생성하지 않음.
- Audit→Action은 `auditDrawId || sourceCaseId`와 Audit ID 정확일치만 사용.
- 선택형 `maturityWeak` 가중치가 0/미설정이면 유지미흡 로직이 추출확률을 변경하지 않음.
- 실제 브라우저 E2E 성공은 Runner가 테스트 step을 실제 수행한 경우에만 선언한다.
