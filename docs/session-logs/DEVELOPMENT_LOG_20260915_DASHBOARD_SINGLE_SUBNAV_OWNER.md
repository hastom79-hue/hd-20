# DEVELOPMENT LOG — 2026-09-15 — Dashboard Single Subnav Owner

대시보드에 `HD20_SUBNAV`의 구형 2그룹(종합현황/성과·운영분석)과 `dashboard-section-tabs.js`의 canonical 4그룹이 동시에 존재하는 이중 세부메뉴 구조를 제거했다.

대시보드에서는 canonical 4그룹 `종합현황 / 실행·유지 / 기준·추이 / 현장참고`만 사용자에게 노출한다. 다른 업무영역에서는 기존 `HD20_SUBNAV`와 업무목적 패널을 그대로 사용한다.

데이터·KPI·Audit/Action ID·Supabase/localStorage write 로직은 변경하지 않았다. forced empty write 없음.
