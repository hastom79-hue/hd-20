# 코딩일지 — 2026-10-17
- 파일 `hd20-subtabs.js`의 `apply(area,sub)`.
- `area!=='dashboard'`이면 `hd20Dashboard{Summary,Improve,Request,Execution,Analysis,Field}Active` 클래스 제거.
- 고도화 `trend`의 `.bottomGrid`를 숨기는 대시보드 전용 CSS 누출 방지. KPI 산식/데이터/스타일 정의는 변경 없음.
- 남은 검사 실패: 종합현황·실행 그룹, 운영기준 중복 탭, 디자인 KPI 검사.
