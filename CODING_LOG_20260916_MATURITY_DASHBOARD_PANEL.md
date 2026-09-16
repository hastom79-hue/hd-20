# Coding Log — 2026-09-16 — Maturity Dashboard Panel

## 변경 파일
`hd20-maturity-map-tab.js`

## 코드 변경
- `ensure()` 생성 요소에서 `awScreen`/`data-area=maturitymap` 제거, `data-dashboard-section=maturity` 적용.
- standalone visibility controller 제거.
- `show()` = render + panel visible.
- `hide()` = panel/detail modal hidden.
- `open/close` = compatibility aliases only.
- refresh는 Dashboard + maturity subtab 활성 시에만 수행.
- boot는 CSS/DOM 준비만 수행하며 URL이나 nav 상태를 변경하지 않음.
- standalone body-mode CSS 삭제.

## 불변조건
- Canonical source read semantics 유지.
- 공식확정만 성과 반영하는 기존 KPI 판정 유지.
- 저장/write 경계 변경 없음.
- 강제 empty write 없음.
