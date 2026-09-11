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

5. `hd20-modal-layer-guard.js`
   - ESC는 `Case Detail → 행 상세 → Trace → 상세 Grid` 순서로 최상위 레이어부터 1단계씩 닫음.
   - `hd20-subtab-changed` 발생 시 Grid/행 상세/Case Detail/Trace를 모두 닫고 검색어, KPI Evidence/Canonical Grid 상태 플래그, 행 검색 숨김 상태를 초기화.
   - 대분류 이동도 `render → apply → hd20-subtab-changed` 경로를 사용하므로 10개 서브탭 전환 모두 동일 초기화 적용.

6. `hd20-canonical-grid-guard.js`
   - 검색/페이지 표시수와 무관하게 현재 검색조건에 맞는 전체 행을 CSV로 내보냄.
   - 검색 입력 직후 CSV 클릭 시에도 현재 검색 문자열을 직접 재판정하여 이벤트 타이밍 의존 제거.

7. `hd20-trace-production-guard.js`
   - Trace API/버튼/Case Detail을 생산데이터 전용으로 제한.
   - legacy Exact Inline Trace는 화면에서 숨기고 생산데이터 전용 Inline Trace를 별도 생성.
   - 삭제/재생성 방식의 MutationObserver ping-pong 가능성 제거.

8. `hd20-action-verify-canonical-guard.js`
   - 개선조치 native 요약(`[data-am-sum]`)과 효과·재발관리 본문 카드 모두 생산 Action만 사용.
   - 완료 기준: `완료/확정/종료/종결/close/done`.
   - 기한경과: `due/targetDate/deadline` + Asia/Seoul 오늘 이전 + 미완료.
   - 효과검증/재발은 Canonical 명시 상태만 인정하며 legacy alias를 사용하지 않음.
   - Demo/E2E 행이 기존 native 카드 숫자에 다시 섞이는 경로 차단.

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
- 모든 KPI Evidence/Canonical Grid/Trace/Action native 요약은 Demo/E2E 비생산행을 제외.

## 배포 검증 상태
- `51fee7487651d94c30ce5d73735dbe29aab789d1`: Pages build/deploy/report 모두 성공, `pages_build_version` 일치 및 `Reported success!` 확인.
- 이후 Action native 요약 Canonical Guard 보강 커밋 `9416108377146d4d30b0dd0fff509cc01bfd16ce` 반영.
- 이 기록 커밋 이후 최신 main SHA 기준으로 Pages build/deploy SHA를 다시 확인한다.

## 남은 검증
- 최신 main SHA의 Pages `pages_build_version` 일치 확인.
- 비-Pages Browser/Playwright workflow는 실행환경 실패와 애플리케이션 실패를 분리해 판정.
- 실제 브라우저에서 10개 서브탭 전부의 클릭-through E2E는 자동 runner가 정상화되기 전까지 성공으로 선언하지 않음.
