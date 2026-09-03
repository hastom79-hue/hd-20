# HD-20 Development Log — Baseline CSS Consolidation

Date: 2026-09-03

## 목적
HD-20 전면개편 중 공통 Design System 위에 과거 `styles.css`가 큰 폰트, 구형 카드 규칙, 고정 폭/높이, 중복 hover/animation을 다시 덮어쓰는 구조를 제거한다. 화면을 새로 꾸미는 hotfix가 아니라 오래된 baseline을 구조 전용 layer로 축소하는 작업이다.

## 변경
- `styles.css`를 legacy visual theme에서 structural foundation으로 축소했다.
- body/app/grid/card/chart/modal 등 오래된 DOM이 정상 배치되기 위한 최소 구조만 유지했다.
- 공통 색상·radius·shadow·font hierarchy는 `hd20-overhaul.css`가 최종 결정하도록 책임을 명확히 했다.
- ②~⑤ 업무화면은 `hd20-five-area.css`가 최종 layout을 결정한다.
- 1680px 기준 고정 시각 비율 대신 `minmax(0,1fr)` 기반 grid와 `min-width:0`을 확대 적용해 폭 전파와 horizontal overflow 위험을 줄였다.
- Desktop/Tablet/Mobile 구조용 breakpoint만 baseline에 유지했다.
- 기존 chart/bar/trend/workplace/modal DOM selector는 제거하지 않아 업무 기능과 drilldown 연결을 보존했다.

## 변경하지 않은 사항
- `hd20GMES5SAutoImproveRawV1`, `hd20ActionCasesV2`, `hd20AuditRandomDrawsV1` 등 Canonical Store
- 공식판정 로직 및 생산혁신팀 + 5S 모듈 판정 주체
- 고도화 3대 조건
- Risk 가중 랜덤 Audit 정책
- 실제 Audit 실시일 기준 달력 +6개월 지속관리
- 개선조치 D+7~D+14 정책 범위
- 운영 KPI 6종 산식

## Design Architecture
현재 스타일 책임은 다음 순서로 정리한다.

`styles.css = structural baseline`

`hd20-overhaul.css = global canonical Design System`

`hd20-five-area.css = 5-area workflow-specific layout`

`maturity-condition-analysis.css = advancement analysis specialization`

새로운 `*-fix.css`, `*-hotfix.css`, `*-polish.css`는 추가하지 않는다.

## 다음 단계
- 최신 main에서 Runtime / Browser / Nav / Design / Dashboard Canonical smoke를 재확인한다.
- 단일 Dashboard의 카드 밀도와 판단 우선순위를 실제 화면 기준으로 추가 정리한다.
- ②~⑤ 화면에서 공통 card/form/table spacing이 동일한지 Desktop/Mobile 양쪽에서 검증한다.
