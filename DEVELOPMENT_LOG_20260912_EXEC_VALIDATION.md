# HD-20 실행검증 기록 — 2026-09-12

## 검증 범위
- Audit 관리 / 6개월 유지관리 native 화면 생산데이터 무결성
- Activity native 활동 목록 Demo/E2E 재노출 여부
- 유지관리 패널 실제 로드 여부
- 10개 서브탭 왕복 시 중복 DOM 생성 여부
- GitHub Pages 최신 SHA 일치 검증

## 발견사항
1. `activity-workflow.js`
   - Activity native 활동목록과 Audit native 요약이 원천 Store를 직접 읽는 경로가 남아 있었다.
   - Demo/E2E 행이 Store에 잔존할 경우 native 목록/건수에 다시 노출될 수 있었다.

2. `audit-random-draw.js`
   - Risk 계산용 Action에는 생산데이터 필터가 적용되어 있었으나 `loadDraws()`는 Audit 원천 전체를 읽었다.
   - 최신 Batch 표시 및 추출 이력에는 Demo/E2E Audit 행이 재노출될 가능성이 있었다.

3. 6개월 유지관리
   - `audit-six-month-control.js` 파일은 존재하지만 최신 `index.html` 로드 체인에 포함되지 않았다.
   - `hd20-subtabs.js`의 유지관리 화면은 `.audit6m` 패널을 기대하므로 기능 패널이 생성되지 않을 수 있는 상태였다.

4. 구형 Closed Loop
   - `audit-closed-loop-workflow.js`에는 `AUTO-AUDIT-*` 파생 Action 생성 로직이 남아 있다.
   - 현재 운영원칙인 Audit ID 정확연계와 충돌하므로 메인 로드 체인에 다시 넣지 않는다.

## 반영사항
### `hd20-native-production-guard.js`
- Activity Store `hd20GMES5SAutoImproveRawV1`에서 생산행만 사용하여 native KPI/활동목록 재렌더링.
- Audit Store `hd20AuditRandomDrawsV1`에서 생산행만 사용하여 Audit lane / 원천건수 재계산.
- Audit 최신 Batch 표시 중 비생산 ID 버튼 제거.
- Audit 추출 이력 테이블을 생산 Audit 행만으로 재구성.
- 6개월 유지관리 `.audit6m` 패널을 canonical 방식으로 생성.
- 관리 시작일: 실제 Audit 실시일.
- 관리 종료일: 실시일 기준 달력 +6개월.
- Audit→Action: `auditDrawId || sourceCaseId`가 Audit ID와 정확히 일치하는 Action만 연결.
- Action 완료/효과검증/재발 판정은 기존 Canonical 규칙과 동일.
- Demo/E2E, 문자열 유사도 추정연계, AUTO-AUDIT 파생 Action 생성 없음.

## 10개 탭 DOM 검증
다음 주요 UI는 기존 노드 존재 여부를 먼저 확인하고 재사용하는 singleton 구조임을 확인했다.
- `#hd20Subnav`
- `#hd20PurposePanel`
- `#hd20OpsMetrics`
- `#hd20UniversalGridModal`
- `#hd20ActionVerifyStatus`
- `.audit6m`
따라서 대분류/서브탭 왕복으로 동일 UI가 누적 생성되는 구조는 아니다.

## 캐시
- `hd20-native-production-guard.js?v=20260912-2`

## 검증 원칙
- 생산 KPI/목록/유지관리에는 Demo/E2E를 포함하지 않는다.
- Activity→Audit 직접 ID lineage는 만들지 않는다.
- Audit→Action만 정확 Audit ID로 연결한다.
- 구형 `AUTO-AUDIT-*` 파생 Action 로직은 메인 운영화하지 않는다.
- 실제 브라우저 E2E 성공은 GitHub Runner가 테스트 step을 실제 수행한 경우에만 선언한다.
