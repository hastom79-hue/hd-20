# HD-20 Operational UX Development Log — 2026-09-10

## 목적
HD-20을 단순 메뉴 모음이 아니라 실제 운영 판단과 후속조치가 이어지는 웹 시스템으로 강화한다.

## 서브탭 운영계약
- dashboard.summary: 종합현황
- dashboard.analysis: 성과·운영분석
- activity.manage: 활동관리
- activity.analysis: 실적분석
- advancement.judge: 후보·판정
- advancement.standard: 확정·수평전개
- audit.audit: Audit 관리
- audit.retention: 유지관리
- action.manage: 개선조치
- action.verify: 효과·재발관리

각 서브탭에는 목적, 판단기준, 다음 행동, 핵심 기능을 명시한다.

## 상세 데이터 그리드
- 현재 화면의 실제 표를 우선 사용
- 표가 없을 경우 Canonical localStorage 원천을 사용
- 검색, CSV 다운로드, 정렬, 행 표시 수, 행 상세팝업 제공
- 실제 데이터가 없으면 Empty State 표시
- 임의/샘플 데이터 생성 금지

원천 키:
- 5S 활동 / 고도화: `hd20GMES5SAutoImproveRawV1`
- Audit / 유지관리: `hd20AuditRandomDrawsV1`
- 개선조치 / 효과·재발: `hd20ActionCasesV2`

## Traceability
Audit → 개선조치 → 효과검증 → 재발 흐름을 `auditDrawId` / `sourceCaseId` 기준으로 정확 연결한다. 문자열 유사도나 팀명 추정으로 Case를 연결하지 않는다.

## 2026-09-10 추가 무결성 보정
- 한국 운영 기준의 기한경과 판단은 `Asia/Seoul` 날짜를 사용하도록 보정.
- 효과검증 완료 집계는 `조치 완료 + 효과검증 완료` 조건을 모두 만족한 Case만 포함.
- 재발 집계는 `조치 완료 + 효과검증 완료 + 재발 확인` Case만 포함.
- 기존 V2 본체를 임의 중복 수정하지 않고 `hd20-operational-integrity.js` 모듈로 운영기준 보정 기능을 분리.

## 2026-09-11 연속 실행검증
- Activity fallback ID 연결은 실제 비교 가능한 필드가 최소 2개 이상이고 원천데이터에서 정확히 1건만 일치할 때만 허용한다. 중복/불명확 시 `연계 ID 없음`으로 유지한다.
- 고도화 후보·판정과 공식확정을 분리했다. 공식확정은 `5S 고도화 유형 + confirmed=true + judgeState=확정` 조건을 만족하는 실제 원천데이터만 사용한다.
- 현재 고도화 Activity → Audit 사이에는 직접적인 Activity ID lineage가 없다. Audit은 Risk 가중 랜덤 팀 추출 구조이므로 생산팀/작업장 유사성을 근거로 Activity와 Audit을 임의 연결하지 않는다.
- Audit → Action은 Audit ID와 `auditDrawId` / `sourceCaseId`의 정확 일치만 허용한다. 1 Audit : N Action을 그대로 유지한다.
- Audit Risk의 기한경과는 미완료 Action 중 `due / targetDate / deadline`이 서울 기준 오늘보다 이전인 건만 집계한다.
- Audit Risk 및 대시보드 재발은 `조치 완료 + 효과검증 완료 + 재발` 폐쇄루프 조건을 동일하게 적용한다.
- 메인 우측 Action Summary의 기한경과·재발도 동일 Canonical 규칙으로 통일했다.
- 메인 우측 6개월 지속관리의 재발은 실제 Audit ID와 정확 연결된 Action 중 폐쇄루프 재발만 집계한다. 전체 Action 재발과 혼합하지 않는다.
- 6개월 지속관리는 Audit 실시일을 시작일로 사용하며, 관리 종료일 당일은 계속 `관리중`으로 유지하고 서울 기준 다음 날부터 `종료/평가`로 전환한다.
- 6개월 지속관리의 Action 범위는 더 이상 `같은 팀 + 6개월 날짜범위`로 추정하지 않고 정확 Audit ID 연결만 사용한다.
- 유지율 KPI 역시 정확 Audit ID 연결, 미완료 여부, 폐쇄루프 재발, 종료평가 결과를 같은 기준으로 사용한다.
- 알려진 Legacy Test Audit ID는 생산 KPI/동기화 대상에서 제외·격리되도록 검증했다.
- `hd20-ops-v2.js` 자체 계산을 Canonical 규칙으로 올려 후처리 보정 모듈의 실행순서와 무관하게 동일 KPI가 계산되도록 했다.
- 상세그리드에 Activity ID, Audit ID, Action ID, 원천 Audit ID, 기한, 운영상태, 효과검증, 재발 등 실제 원천 및 파생 운영상태를 노출하여 KPI → 근거 데이터 역검증이 가능하도록 했다.
- Audit Action Trace의 파생 `AUTO-AUDIT-*` fallback을 제거하고 정확 Audit ID 연계만 허용하도록 정리했다.
- `hd20-trace-exact.js`는 상세그리드에 이미 ID 열이 존재할 경우 추가 삽입을 건너뛰므로 신규 원천그리드 ID 열과 중복되지 않음을 확인했다.
- 활동 신규등록의 기본일자가 UTC 기준으로 하루 어긋날 수 있는 위험을 `activity-seoul-date-guard.js`로 보정했다. 화면 생성 시 서울 날짜를 기본값으로 교정하고, 날짜 공란 저장 시에도 등록 직전에 서울 날짜를 채운다.
- 브라우저 캐시 반영을 위해 `audit-random-draw.js`, `dashboard-kpi-source.js`, `hd20-operational-integrity.js`, `audit-six-month-control.js`, `dashboard-side-summary.js`, `final-layout-polish.js`, `hd20-subtabs.js`, `hd20-ops-v2.js`, `audit-action-case-trace.js`, `activity-seoul-date-guard.js`의 관련 버전 키를 갱신했다.

## 자동검증
- `.github/workflows/subtab-contract-grid-smoke.yml`
- `.github/workflows/ops-v2-smoke.yml`
- 기존 Runtime / Browser / Layout / IA smoke와 병행 확인

## 검증 원칙
- GitHub Pages 배포 SHA가 최신 main SHA와 일치하는지 확인한다.
- Actions 공통 실행환경 실패와 애플리케이션 코드 실패를 분리 판단한다.
- 실제 운영 데이터에 Demo/E2E fixture를 저장하거나 동기화하지 않는다.
- Non-Pages Browser/Runtime smoke가 `steps=null` 상태에서 종료되는 경우 애플리케이션 기능 실패로 판정하지 않는다.
- 실제 브라우저 DOM 클릭 기반 E2E가 실행되지 않은 상태에서는 E2E 통과를 주장하지 않는다.
