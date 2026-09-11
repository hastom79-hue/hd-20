# HD-20 실행검증 기록 — 2026-09-11

## 이번 검증 범위
- 10개 서브탭 KPI ↔ 상세근거 행 수 일치
- Action Summary 4개 항목 ↔ 실제 근거 Case 일치
- Demo/E2E 비생산 데이터의 KPI/근거행 혼입 차단
- 활동 → 고도화 → Risk 기반 Audit → 개선조치 → 효과검증/재발 흐름의 화면 문구/ID 모델 일치
- GitHub Pages build/deploy SHA 검증

## 반영사항
1. `hd20-kpi-evidence-drill.js`
   - 생산데이터 필터 적용.
   - `isDemo`, `isTest`, `demo-seed`, `e2e-fixture`, `DEMO-*`, `E2E-*` 행을 KPI Evidence에서 제외.
   - KPI 계산에 사용된 실제 Case 집합만 상세근거로 표시.

2. `hd20-kpi-parity-guard.js`
   - 현재 서브탭의 4개 KPI 값을 해당 Evidence 행 수와 일치시킴.
   - KPI 숫자와 상세근거 행 수가 달라지는 문제 방지.
   - requestAnimationFrame coalescing 사용, 동일값 DOM 재기록 없음.

3. `hd20-action-summary-evidence.js`
   - 메인 우측 Action Summary 4개를 정확 근거행 Drill-down으로 연결.
   - Audit 실시 대기 → `dashboard.summary.2`
   - 개선조치 미완료 → `action.manage.1`
   - 기한경과 → `action.manage.3`
   - 재발 → `action.verify.3`
   - capture phase에서 기존 전체 Grid 이동 핸들러의 중복 실행 차단.

4. `hd20-workflow-sequence-guard.js`
   - Activity → Audit 직접 ID 연계로 오해할 수 있던 문구 제거.
   - 화면 흐름을 `5S 활동 등록 → 고도화 후보·판정 → Risk 기반 Audit → 개선조치·효과검증`으로 정리.
   - Activity와 Audit 사이에 직접 Activity ID lineage를 임의 생성하지 않음.

## ID/Traceability 검증
- Activity ID: `ACT-<timestamp>` 형태로 생성.
- Audit ID: `BATCH-<timestamp>-<index>` 형태로 생성.
- Audit → Action: 원본 Audit ID를 Action의 `sourceCaseId` / `auditDrawId`에 보존.
- Action → 효과검증/재발: 동일 Action Case에서 관리.
- Activity → Audit은 Risk 기반 팀 추출 구조이므로 직접 Activity ID lineage 없음. 팀명/작업장 문자열 유사도로 임의 연결하지 않음.

## 운영 기준
- 기한경과: 미완료 Action의 due/targetDate/deadline이 Asia/Seoul 기준 오늘보다 이전.
- 효과검증 완료: Action 완료 + 명시적 효과검증 완료.
- 재발: Action 완료 + 효과검증 완료 + 명시적 재발.
- `효과확인대기`, `미발생` 등의 부분문자열 오판정 금지.

## 배포 검증 상태
- 직전 확정 배포: `4479d7602c9278a906691bd02208068818f6cf8e` Pages 성공.
- 이후 KPI/Action Summary/Workflow Sequence 보강 커밋들이 추가됨.
- 이 기록 생성 시점의 최신 기능 반영 커밋: `5e42a3f1cecd029e9bf9637911ffec24ff4a40ad`.
- 해당 SHA의 Pages run은 생성되었고 build/deploy 완료 여부를 계속 확인 중.

## 남은 검증
- 최신 SHA의 Pages `pages_build_version` 일치 확인.
- 비-Pages Browser/Playwright workflow는 실행환경 실패와 애플리케이션 실패를 분리해 판정.
- 실제 브라우저에서 10개 서브탭 전부의 클릭-through E2E는 자동 runner가 정상화되기 전까지 성공으로 선언하지 않음.
