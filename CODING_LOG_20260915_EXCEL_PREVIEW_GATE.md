# HD-20 Excel Preview Gate 코딩로그 — 2026-09-15

## 변경 파일
- `team-leader-excel-import.js`
- `index.html`

## 핵심 로직
`analyze(incoming)`가 저장 전에 정상/오류/중복을 분리하고 기존 `hd20TeamLeaderMasterV1`과 비교해 신규/수정/변경없음을 계산한다.

`renderPreview()`는 검증 결과와 행별 판정을 표시한다. 오류/중복이 하나라도 있으면 확정반영 버튼을 disabled 처리한다.

`applyRows()`는 Preview Gate를 통과하고 사용자가 확정반영을 승인한 경우에만 호출된다. 따라서 파일 선택 및 파싱만으로 localStorage가 변경되지 않는다.

캐시: `team-leader-excel-import.js?v=20260915-preview-gate-4`

## 회귀 보호
기존 xlsx/xls/csv 파싱, 헤더 자동인식, 양식 다운로드, visible team table repaint, `hd20-team-master-updated` event는 유지한다.
