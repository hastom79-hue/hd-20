# HD-20 코딩일지 — 2026-10-18 (사후 보완 기록)

> 이 파일은 사후 보완 기록이며, 당시 실시간 갱신 완료를 의미하지 않습니다.

- PR #40: hd20-improve-board.js / hd20-request-board.js / chart-evidence-browser.yml — 축·라벨·브라우저 검증. main 병합 미확인.
- PR #41: hd20-improve-board.js — axis integer/tight, plotBottom, tightAxis, 차트 기준선 Y=290. main 병합.
- PR #42: .github/workflows/subtab-contract-grid-smoke.yml — legacyTabs에서 정상 policy 탭 제외, legacyPanels 검사 유지. main 병합.
- PR #43: hd20-improve-board.js — labelTotals 기반 인당 수치와 괄호 총 건수 2줄 표기. main 병합 미확인.
- PR #44: hd20-request-board.js — periodLabel, rowsM, selPeriodRows, 월별 완료일 집계 및 근거 데이터 기간 연동. main 병합.
- PR #45: hd20-request-board.js — number input min=1 max=12, 입력 검증, Enter/blur, 공란 연간. main 병합.
- 테스트: JS 구문 및 독립 SVG 축 계산 통과 기록. 실제 브라우저와 운영 배포 검증은 별개로 미완료.
- 회귀 체크: 월 공란/1/9/12/0/13/문자, KPI·차트·근거·CSV 동일 기간, 좌우 기준선, 괄호 총건수, CI·운영 화면.
- 기록 원칙: 향후 변경 PR에 개발/코딩 로그 동시 갱신; 실패 및 미검증 사실을 명시.
