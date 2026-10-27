# HD-20 실행검증 기록 — 2026-09-12

## 검증 범위
- Audit 관리 / 6개월 유지관리 native 화면 생산데이터 무결성
- Activity native 활동 목록 Demo/E2E 재노출 여부
- 유지관리 패널 실제 로드 여부
- 10개 서브탭 왕복 시 중복 DOM 생성 여부
- Audit 실시 → Action 연계 → 6개월 종료평가의 Canonical 실행체인
- 고도화 유지미흡의 Audit Risk 정책 연계
- GitHub Pages 최신 SHA 일치 검증

## 발견사항
1. `activity-workflow.js`
   - Activity native 활동목록과 Audit native 요약이 원천 Store를 직접 읽는 경로가 남아 있었다.
   - Demo/E2E 행이 Store에 잔존할 경우 native 목록/건수에 다시 노출될 수 있었다.

2. `audit-random-draw.js`
   - Risk 계산용 Action에는 생산데이터 필터가 적용되어 있었으나 `loadDraws()`는 Audit 원천 전체를 읽었다.
   - 최신 Batch 표시 및 추출 이력에는 Demo/E2E Audit 행이 재노출될 가능성이 있었다.
   - 기존 Risk 산식은 전월 개선요청 / 누적 개선요청 / 기한경과 / 재발 4개 항목만 사용하고 고도화 유지미흡은 직접 반영하지 않았다.

3. 6개월 유지관리
   - `audit-six-month-control.js` 파일은 존재하지만 최신 정적 index에는 직접 로드되지 않았다.
   - 이후 `final-layout-polish.js` 동적 로더가 이 파일과 구형 Closed Loop를 다시 주입하는 경로가 확인되었다.

4. 구형 Closed Loop
   - `audit-closed-loop-workflow.js`에는 `AUTO-AUDIT-*` 파생 Action 생성 로직이 남아 있었다.
   - `audit-batch-execution.js`는 이 구형 전역 `HD20AuditClosedLoop.registerAudit()`에 직접 의존하고 있었다.
   - 따라서 구형 로더만 제거하면 Audit 실시 등록이 끊기는 연쇄 의존성이 있었다.

5. Audit 종료평가 별칭 불일치
   - native 유지관리 화면과 일부 Canonical 계산은 `finalEvaluation || auditFinalState`를 사용하지만 KPI Evidence는 `finalEvaluation`만 확인하는 경로가 남아 있었다.
   - `auditFinalState`에 종료평가가 저장된 Case는 `6개월 관리중`과 `종료평가` 상세근거가 어긋날 수 있었다.

6. Audit→Action 자동기한 날짜 오차 가능성
   - `action-audit-linkage.js`의 `addDays()`가 로컬 자정 Date를 만든 뒤 `toISOString()`으로 잘라 쓰는 구조라 KST에서 하루 전 날짜로 밀릴 수 있었다.

7. 6개월 종료평가 Risk 단절
   - 종료평가 `미흡` 저장 시 `finalEvaluationRiskReference=true`까지 기록했지만 Audit Risk 계산은 이 값을 사용하지 않았다.
   - 화면 문구는 차기 Audit 판단 근거라고 설명했지만 실제 추출확률에는 연결되지 않은 상태였다.

## 반영사항
### `hd20-native-production-guard.js`
- Activity Store `hd20GMES5SAutoImproveRawV1`에서 생산행만 사용하여 native KPI/활동목록 재렌더링.
- Audit Store `hd20AuditRandomDrawsV1`에서 생산행만 사용하여 Audit lane / 원천건수 재계산.
- Audit 최신 Batch 표시 중 비생산 ID 버튼 제거.
- Audit 추출 이력 테이블을 생산 Audit 행만으로 재구성.
- 6개월 유지관리 `.audit6m` 패널을 canonical 방식으로 생성.
- 관리 시작일: 실제 Audit 실시일을 Asia/Seoul 날짜키로 변환.
- 관리 종료일: 실시일 기준 달력 +6개월.
- 종료평가 상태: `finalEvaluation || auditFinalState`를 동일한 종료평가 상태로 인정.
- Audit→Action: `auditDrawId || sourceCaseId`가 Audit ID와 정확히 일치하는 Action만 연결.
- Action 완료/효과검증/재발 판정은 기존 Canonical 규칙과 동일.
- Demo/E2E, 문자열 유사도 추정연계, AUTO-AUDIT 파생 Action 생성 없음.

### `hd20-kpi-evidence-drill.js`
- Audit 종료평가 표시와 분류에 `finalEvaluation || auditFinalState`를 사용.
- `dashboard.analysis`의 6개월 관리 Evidence와 `audit.retention`의 관리중/종료평가 Evidence가 native 유지관리 화면 및 Canonical 기준과 동일해짐.
- KPI Parity Guard가 Evidence 행 수를 KPI 값으로 사용하는 구조이므로 종료평가 별칭에 따른 KPI/근거행 불일치를 제거.

### `action-audit-linkage.js`
- Audit→Action pending 데이터는 Audit ID, 팀, 작업장, 문제, Audit일을 보존.
- Action 생성 후 `sourceCaseId`와 `auditDrawId`에 동일 Audit ID를 강제 보존.
- 자동기한 계산은 문자열 날짜를 UTC calendar date로 계산하도록 변경하여 KST 자정/UTC 변환에 의한 하루 오차를 제거.
- 검증 예시: `2026-09-12 + 7일 = 2026-09-19`, `2026-12-28 + 7일 = 2027-01-04`, 윤년 경계 정상.

### `audit-random-draw.js`
- 생산 Audit만 `latestBatch`/이력에 사용.
- 고도화 유지미흡과 6개월 종료평가 미흡을 각각 집계.
- `maturityWeak = 고도화 유지미흡 + 6개월 종료평가 미흡`으로 계산.
- 기존 선택형 `maturityWeak` 가중치가 0 또는 미설정이면 추출확률 변화 없음.
- 가중치가 설정된 경우에만 두 유지미흡 원천이 차기 Audit 추출확률에 반영됨.
- 신규 Audit 행에 `riskMaturityWeakAdvancement`, `riskRetentionWeak`, 총 `riskMaturityWeak`를 함께 저장하여 추출 근거 역추적 가능.
- `hd20-audit-updated` 발생 시 Risk 화면도 재렌더링.

### `operating-policy-master.js`
- 기존 `maturityWeak` 정책 의미를 화면상 `유지미흡(고도화·6개월 종료평가)`로 명확화.
- 새 가중치는 만들지 않고 기존 선택형 `maturityWeak` 하나만 사용.

### `final-layout-polish.js`
- 구형 `audit-six-month-control.js` 동적 로드를 제거.
- 구형 `audit-closed-loop-workflow.js` 동적 로드를 제거.
- 정책 설정 `hd20-policy-config.js` 유지.
- `operating-policy-master.js?v=20260912-3`, `action-audit-linkage.js?v=20260912-3`로 갱신.
- `audit-canonical-execution.js?v=20260912-2` 유지.

### `audit-canonical-execution.js`
- 기존 호환 전역명 `HD20AuditClosedLoop.registerAudit()`는 유지하되 동작을 Canonical 방식으로 교체.
- Audit 실시결과는 기존 실제 Audit ID 행만 갱신.
- 개선요청/부적합 발생 시 Action을 즉시 자동 생성하지 않음.
- 대신 `hd20-audit-to-action` 이벤트와 `HD20ActionAuditLinkage.setPending()`으로 원본 Audit ID를 다음 Action 등록 흐름에 전달.
- 생성되는 Action은 기존 Action 등록 로직을 통해 `sourceCaseId` / `auditDrawId`에 정확 Audit ID를 보존.

### `audit-close-evaluation.js`
- Demo/E2E 제외.
- Asia/Seoul 날짜 기준 + 달력 6개월 종료일 적용.
- 종료일 당일까지 관리중, 다음 날부터 종료평가 대상.
- Audit ID 정확키로 종료평가 저장.
- `미흡`일 때 `finalEvaluationRiskReference=true` 저장.

## 폐쇄루프 검증
- 고도화 유지미흡/6개월 종료평가 미흡 → 선택형 유지미흡 Risk → Audit Batch 선정근거 저장.
- Audit 실시 → 개선요청 발생 → pending에 정확 Audit ID 저장.
- Action 등록 → 동일 Audit ID를 `sourceCaseId/auditDrawId`에 보존.
- Action 완료/효과검증/재발은 동일 Action ID에서 관리.
- Traceability는 Audit ID → Action source Audit ID 정확일치만 사용.
- Activity→Audit 직접 ID lineage는 생성하지 않음.

## 10개 탭 DOM 검증
다음 주요 UI는 기존 노드 존재 여부를 먼저 확인하고 재사용하는 singleton 구조임을 확인했다.
- `#hd20Subnav`
- `#hd20PurposePanel`
- `#hd20OpsMetrics`
- `#hd20UniversalGridModal`
- `#hd20ActionVerifyStatus`
- `.audit6m`
따라서 대분류/서브탭 왕복으로 동일 UI가 누적 생성되는 구조는 아니다.

## 현재 캐시 기준
- `audit-random-draw.js?v=20260912-maturity-6`
- `final-layout-polish.js?v=20260912-11`
- `hd20-native-production-guard.js?v=20260912-4`
- `hd20-kpi-evidence-drill.js?v=20260911-6`
- 동적 정책 로더: `hd20-policy-config.js?v=20260912-2`, `operating-policy-master.js?v=20260912-3`
- Audit→Action linkage: `action-audit-linkage.js?v=20260912-3`
- Canonical Audit 실행: `audit-canonical-execution.js?v=20260912-2`
- Batch: `audit-batch-execution.js?v=20260912-2`
- 종료평가: `audit-close-evaluation.js?v=20260912-2`

## 검증 원칙
- 생산 KPI/목록/유지관리에는 Demo/E2E를 포함하지 않는다.
- Activity→Audit 직접 ID lineage는 만들지 않는다.
- Audit→Action만 정확 Audit ID로 연결한다.
- 구형 `AUTO-AUDIT-*` 파생 Action 로직은 운영 로드 체인에서 제거한다.
- 유지미흡 Risk는 사용자가 가중치를 명시한 경우에만 추출확률에 반영한다. 기본값은 0이다.
- 실제 브라우저 E2E 성공은 GitHub Runner가 테스트 step을 실제 수행한 경우에만 선언한다.
