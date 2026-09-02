# HD-20 Dashboard Canonicalization — 2026-09-03

## 목적
통합 대시보드가 같은 정보를 여러 레이어에서 반복 렌더링하던 구조를 제거하고, 한 개의 canonical dashboard hierarchy만 유지한다.

## 발견한 구조적 원인
`approved-landing-v2.js`가 다음 정보를 별도 첫 화면으로 다시 생성하고 있었다.

- 5개 누적/성과 KPI
- 6개 운영 건전성 KPI
- 3대 고도화 판정기준
- 고도화 수준 Map
- 월별 추이
- Audit 후 6개월 관리 대상

동시에 기존 `index.html`의 KPI/Card/Grid와 `dashboard-priority-layout.js`의 운영 KPI 6종이 계속 렌더링되어, 동일 의미의 정보가 사실상 두 벌 이상 겹쳐 있었다.

## 2026-09-03 반영
### 1. duplicate approved landing active runtime 퇴역
`index.html`에서 다음 active reference를 제거했다.

- `approved-landing-v2.css`
- `approved-landing-v2.js`

파일 자체의 과거 이력은 즉시 삭제하지 않고 active runtime에서 먼저 분리했다.

### 2. canonical dashboard 복귀 기준 통일
`beginner-navigation.js`의 dashboard 복귀 target을 기존 `.hd20ApprovedLanding` 우선 탐색에서 다음으로 변경했다.

- `#hd20DashboardPriority`
- fallback `.cards`

### 3. 폐쇄루프 상세상태 위치 고정
`dashboard-operational-bridge.js`가 더 이상 `.hd20ApprovedLanding` 존재여부에 의존하지 않는다.

현재 위치:
`운영 건전성 KPI 6종 → 5개 성과량 보조지표 → 폐쇄루프 상세 운영상태 → 팀별 실행/Audit → 판정기준/추이`

### 4. 업무 산식 보존
이번 변경은 Dashboard presentation hierarchy 정리다. 다음은 변경하지 않았다.

- `HD20KPIData.operational()`의 운영 KPI 6종 산식
- `hd20GMES5SAutoImproveRawV1`
- `hd20ActionCasesV2`
- `hd20AuditRandomDrawsV1`
- 공식판정 분리 원칙
- Audit 실시일 기준 달력 +6개월 지속관리
- 개선기한 D+7~D+14 정책 범위 및 실제 설정값 사용 원칙

## 회귀검증
`.github/workflows/dashboard-canonical-smoke.yml` 추가.

Desktop `1440×1000`, Mobile `375×812`에서 다음을 검증한다.

- `.hd20ApprovedLanding` 렌더 0개
- `#hd20DashboardPriority` 정확히 1개
- 운영 KPI `.hd20HealthKpi` 정확히 6개
- `#hd20OperationalBridge` 정확히 1개
- 기존 성과 보조 KPI `.cards .kpi` 정확히 5개
- horizontal overflow 없음
- pageerror 없음

## 관련 Commit
- `5f073f2` — duplicate approved landing runtime 제거
- `b0d3953` — dashboard navigation canonical target 전환
- `3a44671` — operational bridge canonical anchor 전환
- `526621d` — dashboard canonical smoke 추가
