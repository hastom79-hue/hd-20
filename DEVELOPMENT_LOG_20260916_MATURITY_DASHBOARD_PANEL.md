# Development Log — 2026-09-16 — Maturity Dashboard Panel

## 목적
고도화 맵을 독립 메인 화면이 아닌 대시보드의 Portfolio 하위 패널로 단일화한다.

## 반영
- `hd20-maturity-map-tab.js`의 standalone screen 동작 제거.
- `.awScreen`, `.awFocused`, `body.hd20MaturityMapMode`, URL `tab=maturitymap`, 강제 scroll-top 의존 제거.
- `show()/hide()` 패널 API 추가, 기존 `open()/close()`는 호환 alias로 유지.
- refresh 조건을 `HD20_NAV.active()==='dashboard' && HD20_DASHBOARD_TABS.active()==='maturity'`로 변경.
- boot 시 독립 deep-link hijack을 제거하고 패널을 hidden 상태로만 준비.

## 안전성
- KPI Canonical 판정/데이터 읽기 로직은 변경하지 않음.
- 운영데이터 write 추가 없음.
- server-side forced empty write 없음.
- legacy deep-link 정규화 책임은 `beginner-navigation.js`에 유지.

## 후속 검증
- dashboard maturity subtab과 bridge 연결 확인.
- browser smoke의 `networkidle` 의존 제거 후 실제 Playwright 계약 재실행.
