# HD-20 Coding Log — 2026-09-16 Activity Import Analysis + Mail Preview

## 변경 파일
- `activity-import-analysis-mail-preview.js` 신규
- `index.html`

## 주요 로직
- Canonical key: `hd20GMES5SAutoImproveRawV1`
- Team master key: `hd20TeamLeaderMasterV1`
- `HD20KPIData.isNonProdRow()`를 재사용하여 비운영 데이터를 분석에서 제외
- `source === excel-import`만 Import 분석 범위로 사용
- 최신월/직전월, 팀별 count/delta 계산
- 감소팀은 음수 delta로 식별
- 목표값을 확인할 수 없는 상태에서는 미달 판정 로직을 실행하지 않음
- 메일 Preview는 `mailto:` 작성 화면만 열며 자동 send 없음
- 수신자 미선택 시 메일 작성 차단

## 이벤트
- `hd20-gmes-5s-imported`
- `hd20-team-master-updated`

두 이벤트에서 분석 UI를 재렌더링한다.

## Cache
`activity-import-analysis-mail-preview.js?v=20260916-1`

## 검증 포인트
1. Excel 확정 반영 전에는 분석 데이터에 포함되지 않아야 한다.
2. 확정 반영 후 최신월 집계가 즉시 갱신되어야 한다.
3. Demo/E2E fixture는 집계에서 제외되어야 한다.
4. 팀장 이메일이 없는 행은 수신자 목록에 나오지 않아야 한다.
5. 메일 Preview 버튼 자체는 실제 발송을 수행하지 않아야 한다.