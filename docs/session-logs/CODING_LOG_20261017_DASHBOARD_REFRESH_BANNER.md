# 코딩일지 — 2026-10-17 새로고침 목적 안내 배너
- 수정 파일: `hd20-subtabs.js`
- 수정 함수: `renderPurpose(area,sub)`
- 조건: `area==='dashboard'`이면 `el.style.setProperty('display','none','important')`, `el.replaceChildren()`, `return`.
- 기타 업무 영역: `el.style.removeProperty('display')` 후 기존 렌더링 유지.
- 비변경: `dashboard-section-tabs.js`, 기존 KPI, 차트, 데이터, 상단 메뉴, 기타 업무 화면.
- 테스트: 소스 변경 범위 확인. 실제 브라우저 재진입/새로고침 검증은 미실행.
