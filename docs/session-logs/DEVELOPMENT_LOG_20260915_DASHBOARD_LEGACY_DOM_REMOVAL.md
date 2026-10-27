# DEVELOPMENT LOG — 2026-09-15 — Dashboard Legacy DOM Removal

## 목적
대시보드에서 canonical 4그룹 탭과 함께 존재하던 generic HD20_SUBNAV의 구형 2탭 DOM을 단순 숨김이 아니라 실제 DOM에서 제거한다.

## 검증
- canonical 대시보드 소유자: `dashboard-section-tabs.js`의 summary / execution / standard / field 4그룹.
- generic `hd20-subtabs.js`의 dashboard.summary / dashboard.analysis 계약은 KPI evidence 등 호환 참조가 남아 있어 소스 API 자체는 이번 단계에서 삭제하지 않는다.
- 화면 DOM의 `#hd20Subnav`, `#hd20PurposePanel`만 dashboard 활성 시 제거한다.
- 활동관리 등 운영영역 진입 시 `hd20-subtabs.js`의 render/ensure가 운영 서브탭을 다시 생성하므로 운영영역 기능은 유지된다.

## 변경
`dashboard-subnav-single-owner-guard.js`
- dashboard 활성 시 legacy subnav/purpose를 `display:none`으로 남기지 않고 `remove()`.
- canonical `#hd20DashboardSectionTabs`만 표시.

업무 데이터, KPI 판정, Audit/Action linkage, Supabase write 경로 변경 없음.
