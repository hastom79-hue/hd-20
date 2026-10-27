# HD-20 개발일지 — HDPS 대시보드 Canonical 재작성

일자: 2026-09-02
대상: `main`

## 목적
상단 `HDPS 대시보드` 화면 내부에 남아 있던 과거 `1개월 점검 / 3개월 Audit / 6개월 Audit` Lifecycle 직접 참조를 제거하고, 별도 보정 스크립트 없이 원본 `hdps-dashboard.js`가 현재 승인된 Audit 운영모델과 Canonical Store를 직접 사용하도록 전환한다.

## 변경 내용

### 1. `hdps-dashboard.js` 원본 재작성
- Audit Store: `hd20AuditRandomDrawsV1`
- 개선조치 Store: `hd20ActionCasesV2`
- KPI/고도화 데이터: `window.HD20KPIData`
- 과거 `window.HD20MaturityFollowup` 의존 제거.
- `audit6Result`, `audit6mResult`, `sixMonthAuditResult` 직접 참조 제거.
- `1개월 점검 / 3개월 Audit / 6개월 Audit / 1·3·6개월 Lifecycle` 로직 제거.
- 실제 Audit 실시일 `auditDate`를 D-Day로 사용.
- 관리 종료일은 달력 기준 +6개월로 계산.
- Action Summary를 `Audit 실시 대기 / Audit 후 6개월 관리중 / 개선조치 미완료 / 개선조치 기한경과`로 구성.
- 운영 KPI의 명칭을 `Audit 후 6개월 유지율`로 통일.
- 개선조치 재발 판정은 `미발생`을 재발로 오인하지 않도록 명시값 기준으로 처리.

### 2. `hdps-dashboard.html` 정리
- 5영역 메뉴를 정적 원본으로 유지.
- 더 이상 필요 없는 `maturity-seq-action-link.js` 로딩 제거.
- 임시 보정 스크립트 `hdps-dashboard-current-model.js` 로딩 제거.
- Canonical `dashboard-kpi-source.js` + `hdps-dashboard.js`만 사용하도록 단순화.

### 3. 임시 보정 파일 제거
- `hdps-dashboard-current-model.js` 삭제.
- 동일 기능이 원본 `hdps-dashboard.js`로 흡수되었기 때문에 별도 Patch Layer를 유지하지 않음.

### 4. Runtime Smoke 계약 강화
`.github/workflows/runtime-smoke.yml`에서 다음을 검사하도록 변경.
- `hdps-dashboard.html`이 5영역 메뉴인지 확인.
- `maturity-seq-action-link.js`와 `hdps-dashboard-current-model.js`를 로드하지 않는지 확인.
- `hdps-dashboard.js`가 `hd20AuditRandomDrawsV1`, `hd20ActionCasesV2`를 직접 사용하는지 확인.
- `Audit 후 6개월 유지율`, `Audit 실시 대기`, `Audit 후 6개월 관리중` 문구 존재 확인.
- `HD20MaturityFollowup`, `audit6Result` 계열, 1/3/6개월 Lifecycle 문구가 다시 들어오면 실패하도록 설정.

### 5. Browser Smoke 직접 진입 계약 추가
- `hdps-dashboard.html`을 Chromium에서 직접 연다.
- 5영역 메뉴 순서가 `dashboard / activity / advancement / audit / action`인지 확인한다.
- KPI 카드가 6개인지 확인한다.
- `Audit 후 6개월 유지율` KPI 명칭을 확인한다.
- Action Summary 4개 항목 `Audit 실시 대기 / Audit 후 6개월 관리중 / 개선조치 미완료 / 개선조치 기한경과`를 확인한다.
- 화면에 과거 `1개월 점검 / 3개월 Audit / 6개월 Audit / 1·3·6개월` 문구가 렌더링되면 실패한다.
- 메인 대시보드와 HDPS 대시보드 스크린샷 및 diagnostics JSON을 CI Artifact로 남긴다.

## 주요 커밋
- `4671aafbabc4e2dfb2a194241a457376ba0a1e26` — HDPS dashboard Canonical rewrite
- `cf855c64f35b918ad0720919ff6892d49e1d3616` — legacy lifecycle/bridge script loading removal
- `5cbcd5cc20b74825ca28c17a63af4fcb1293a7a7` — Runtime Smoke canonical contract
- `4a985c18f065586e77a12465b91566358fa9e5c5` — obsolete bridge file deletion
- `b73803d15a543158a2041f99249dc9861be4925b` — direct HDPS dashboard browser smoke

## 검증 상태
최신 `main` 변경으로 Runtime/Browser/Pages 워크플로우가 재실행된다. 완료 결과 확인 전에는 성공으로 간주하지 않는다.

## 후속 작업
- Audit Batch 다중선정 건에 대해 개별 `Audit 실시일 / 결과 / 개선요청` 입력 UX 연결.
- Browser Smoke에 운영정책 주입 → 실제 다중추출 → 선택수/중복 0건 검증 추가.
- README와 메인 개발일지에서 본 Canonical 전환을 현재 기준으로 계속 유지.
