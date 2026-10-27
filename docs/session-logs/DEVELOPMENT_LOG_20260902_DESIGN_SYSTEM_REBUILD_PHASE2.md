# HD-20 Design System Rebuild Phase 2 — 2026-09-02

## 목적
1차에서 정리한 canonical Design System을 KPI 상세 Grid, 공통 Table Enhancement, HDPS·5S Expert AI까지 확대한다.

## 반영 내용
- `kpi-modal-bootstrap.js`: runtime `<style>` 생성 제거. 상세 Grid 생성/닫기 동작만 유지.
- `table-enhance-suite.js`: runtime `<style>` 생성 제거. 검색·정렬·더보기·행 상세보기 동작만 유지.
- `expert-chatbot-final.js`: runtime `<style>` 생성 제거. Q&A·오류접수·오류이력 동작 및 업무지식은 유지.
- `hd20-overhaul.css`: 위 3개 UI의 시각 규칙을 canonical Design System으로 흡수.

## 통합된 UI 규칙
- Modal overlay / box / header / close button
- KPI 상세 Grid / table typography
- Table search / count / sort / more
- Row detail modal
- Expert AI FAB / panel / tabs / FAQ / input / history

## 보존한 업무 로직
- KPI 상세 Grid 데이터 로직
- Table 검색/정렬/페이지 증가 로직
- 5S/고도화/Audit/개선조치 canonical Store
- Expert AI의 현재 5개 영역 업무지식
- Audit 6개월 관리 및 개선기한 정책

## 결과
표현 스타일의 소유권을 JS 개별 모듈에서 `hd20-overhaul.css`로 이동했다. JS는 동작, CSS는 표현을 담당하도록 역할을 분리했다.

## 관련 commits
- `8144f0d` — KPI modal runtime style 제거
- `17e60eb` — table enhancement runtime style 제거
- `4328161` — modal/table/AI canonical style 통합
- `cce0631` — Expert AI runtime style 제거
