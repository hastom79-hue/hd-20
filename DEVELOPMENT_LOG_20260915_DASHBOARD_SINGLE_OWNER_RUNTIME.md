# Development Log — Dashboard single-owner runtime — 2026-09-15

## 발견 문제
Dashboard는 canonical 4탭(`summary/execution/standard/field`)이 화면 소유권을 갖지만, legacy `hd20-subtabs.js`의 `applyDashboard(summary|analysis)`가 늦게 실행되면 `.mainGrid`, `.bottomGrid`, `#hd20OperationalBridge` 표시상태를 다시 변경할 수 있는 race가 남아 있었다.

## 수정
`dashboard-subnav-single-owner-guard.js`가 Dashboard 활성 상태에서 legacy `#hd20Subnav`, `#hd20PurposePanel`을 제거한 뒤 현재 canonical Dashboard tab을 다시 `HD20_DASHBOARD_TABS.apply(active,{scroll:false})`로 적용한다.

적용 시점: 초기 boot, main nav click 후, legacy `hd20-subtab-changed`, pageshow, DOM mutation.

## 보존 계약
- Dashboard canonical 4탭 유지
- Audit 6개월 Evidence는 `audit.retention`에 유지
- Activity/Audit/Action 데이터 mutation 없음
- Supabase write 변경 없음
- server-side forced empty write 없음

## Cache
child `dashboard-subnav-single-owner-guard.js?v=20260915-3`로 갱신.