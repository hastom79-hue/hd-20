# HD-20 업무 KPI 대시보드 이관 — 2026-10-27

## 요청 및 적용 범위
- 사용자 승인: Audit·유지점검, 개선조치·완료관리, 고도화·표준화 3개 업무 탭 상단 지표카드를 대시보드로 이관.
- 업무 탭은 등록·조회·판정·점검·처리 기능에 집중.
- 자율개선등록/개선조치등록 탭의 기존 KPI는 이번 이관 대상에서 제외.

## 구현
1. `hd20-ops-v2.js`: `renderMetrics()`에서 audit/action/advancement 상단 `#hd20OpsMetrics`를 제거. Audit·Action의 연계 흐름 버튼은 유지.
2. `dashboard-work-kpi-migration.js` 신규: 대시보드의 3개 업무그룹 × 4개 KPI(총 12개 동시 표시) 통합 패널.
3. 그룹별 세부업무 선택으로 기존 하위탭별 지표 정의를 모두 조회 가능. `HD20_SUBNAV.map`을 그대로 사용해 세부업무 변경과 동기화.
4. 수치·산식은 `HD20_OPS_V2.metrics(area,sub)` 재사용. 별도 데이터 복사·산식 변경·가상값 생성 없음. 클릭 시 `HD20_KPI_EVIDENCE.openEvidence`로 원천 근거, 불가 시 원본 업무화면으로 이동.
5. `hd20-ops-v2.css`: 대시보드에서만 표시하는 압축형 3그룹 레이아웃. 업무 탭에서는 완전 숨김.
6. `index.html`: 새 스크립트 로드 및 CSS/JS 캐시 버전 갱신.

## 검증
- 신규 Playwright 회귀검증: `tests/dashboard-kpi-migration-smoke.cjs`.
- 검증 항목: 3그룹/12개 KPI 표시, 원천 산식 일치, Audit 하위업무 선택, 3개 업무탭 KPI 제거, 새로고침 복원.
- GitHub Actions workflow: `.github/workflows/dashboard-kpi-migration-smoke.yml`.
- GitHub 소스 재조회·JavaScript 구문검사: 통과.
- GitHub Pages 실제 브라우저 실행/Actions 통과: 아직 확인되지 않음.

## 데이터 보호
- localStorage 키/기존 레코드/업무 데이터 변경 없음.
- 이관은 렌더링 위치 및 드릴다운 동작 변경에 한정.
