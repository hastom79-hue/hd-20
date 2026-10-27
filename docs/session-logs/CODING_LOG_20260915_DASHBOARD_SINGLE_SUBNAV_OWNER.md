# CODING LOG — 2026-09-15 — Dashboard Single Subnav Owner

## 신규
`dashboard-subnav-single-owner-guard.js`

## 동작
- `HD20_NAV.active() === 'dashboard'`: `#hd20Subnav`, `#hd20PurposePanel` 숨김
- dashboard canonical `#hd20DashboardSectionTabs`만 노출
- 다른 5개 업무영역: dashboard section tabs 숨김, 기존 업무 subnav/purpose 복원
- 메인 nav click 및 subtab 변경 시 동기화

## 캐시 체인
- `final-layout-polish.js` → `dashboard-subnav-single-owner-guard.js?v=20260915-1`
- `index.html` → `final-layout-polish.js?v=20260915-dashboard-single-owner-17`

업무 데이터 mutation 없음.
