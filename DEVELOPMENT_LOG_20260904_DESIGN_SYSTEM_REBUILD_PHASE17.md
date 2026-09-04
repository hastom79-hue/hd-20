# HD-20 Design System Rebuild — Phase 17
Date: 2026-09-04

## 목적
Phase 16 이후 남아 있던 `hd20-overhaul.css`와 `hd20-five-area.css` 간 표현 경쟁을 보수적으로 줄인다. 첫 대상으로 Navigation의 열수와 버튼 최소높이 소유권을 단일화한다.

## 선행 검증
Phase 16 HEAD `b5f2aecb29bad1396a1126d8059f38530b5530f0` 기준 failure workflow run이 0건임을 확인했다. Package 및 Pages 성공도 확인했다.

## 변경
`hd20-overhaul.css`에서 다음 중복 레이아웃 선언을 제거했다.

- `.beginnerNav`의 `grid-template-columns`
- `.beginnerNav button`의 `min-height`
- `@media(max-width:980px)`의 Navigation 3열 override 및 버튼 높이 override
- `@media(max-width:700px)`의 Navigation 2열 override
- `@media(max-width:460px)`의 Navigation 1열 및 버튼 높이 override

공통 Navigation surface는 유지했다.

- sticky 위치
- border / background / shadow
- button padding / typography
- hover / active state
- icon / small text 표현

5개 업무영역의 실제 열수와 최소높이는 `hd20-five-area.css`가 단독 소유한다.

- 기본: 5열 / 버튼 최소높이 62px
- 1100px 이하: 3열
- 700px 이하: 1열

`index.html`의 `hd20-overhaul.css` cache key를 `20260904-nav-owner-1`로 갱신했다.

## 업무 로직 영향
없음. 5S 6개 유형, 고도화 3조건, 공식판정, 라인 비추론, Risk 가중 랜덤 Audit, Audit 실시일부터 달력 기준 +6개월 지속관리, 개선조치 Deadline 정책과 canonical stores는 변경하지 않았다.

## 현재 stylesheet chain
1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `maturity-condition-analysis.css`

## 다음 단계
최신 회귀검증을 확인한 뒤 공통 Workflow base와 `[data-area]` scoped override의 중복을 추가로 분석한다. 범용 component에 필요한 속성은 `hd20-overhaul.css`, 5-area 전용 밀도·반응형·업무 의미표현은 `hd20-five-area.css`가 소유하도록 단계적으로 정리한다. 한 번에 큰 CSS 삭제는 하지 않고 검증 가능한 단위로 진행한다.
