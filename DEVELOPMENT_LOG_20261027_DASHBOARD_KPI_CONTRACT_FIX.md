# HD-20 대시보드 이관 KPI 제목·지표 불일치 및 3개 세부탭 중복 노출 수정 (2026-10-27)

## 사용자 화면 문제
- 대시보드의 '업무별 통합 운영지표'가 '운영 종합진단', '5S 자율개선 종합', '5S 개선요청 종합'에서 중복 표시됨.
- Audit·유지점검 그룹에 Audit 원천/실시 대기/완료/부적합 대신 '5S 활동/고도화 후보/Audit 대기/기한경과'라는 대시보드 공통 지표가 노출됨.

## 실제 원인
1. `dashboard-work-kpi-migration.js`가 KPI 패널을 최상위 대시보드에서만 숨김/표시했고, `dashboard-section-tabs.js`의 TABS.targets에 KPI 패널이 등록되지 않았음. 대시보드 1/2/3번 세부탭 간 격리 누락.
2. `hd20-ops-production-filter-guard.js`가 `HD20_OPS_V2.metrics`를 런타임에서 덮어쓰는데, 현행 Audit subtab 키 `audit.draw` 대신 구형 `audit.audit`만 정의. 미존재 키는 `dashboard.summary`로 폴백하여 전혀 다른 KPI가 Audit 이름으로 표시됨.
3. 같은 필터링 모듈에서 `audit.ongoing`, `action.leadtime` 누락.
4. `hd20-kpi-evidence-drill.js`의 `audit.ongoing.3` 근거행이 월간 집계 기준과 달랐음.

## 수정
- 대시보드 summary의 TABS.targets에 `#hd20DashboardWorkMetrics` 등록.
- `body:not(.hd20DashboardSummaryActive)`에서 KPI 패널 강제 숨김. 운영 업무탭도 기존대로 숨김.
- Audit 키 `audit.audit` → `audit.draw`; Audit ongoing 및 Action leadtime filtered metrics 추가.
- 미지원 업무 키를 `dashboard.summary`로 대체하지 않고 빈 배열 반환(잘못된 수치 노출 방지).
- KPI 표시에서 area/sub별 첫 지표명, 4개 행, 숫자 유효성을 검증. 불일치 시 안내 문구를 표시하고 수치를 임의로 대체하지 않음.
- Audit 월별 근거행을 현재월 기준으로 수정.
- 동적 로더 `final-layout-polish.js`와 `index.html` 캐시 버전 갱신.
- Playwright smoke: summary KPI 표시, 2/3번 및 map 탭에서 중복 숨김, Audit 첫 지표명 검증.

## 검증
- GitHub 소스 재조회 및 JS 구문 검사: 통과.
- 필터링 KPI 소스 함수에 fixture(2 Audit, 2 Action)를 넣은 함수 단위 실행검증: Audit draw/ongoing/retention, Action manage/leadtime/verify, Advancement judge/standard 8개 계약 통과. 알 수 없는 Audit sub 키는 빈 배열 반환 확인.
- 실제 GitHub Pages 브라우저 및 GitHub Actions E2E: 아직 통과 확인하지 못함.

## 데이터 보호
- localStorage 원천 레코드·키·Supabase·운영 DB는 수정하지 않음.
