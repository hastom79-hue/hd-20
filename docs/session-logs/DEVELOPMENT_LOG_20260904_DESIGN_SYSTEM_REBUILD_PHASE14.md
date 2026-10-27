# HD-20 Design System Rebuild — Phase 14
Date: 2026-09-04

## 목적
Phase 13 회귀검증 실패원인을 먼저 해소하고, `workflow-area-density.css`에서 canonical CSS와 중복되던 공통 density override를 실제로 줄인다.

## Phase 13 회귀검증에서 검출된 문제
`HD20 design layout smoke` run `33815461816`이 실패했다. 실패원인은 화면 레이아웃 자체가 아니라 런타임 DOM에 이미 물리 삭제된 `mobile-runtime-restore.css` link가 다시 삽입되어 stylesheet contract가 5개가 아닌 6개가 된 것이었다.

검출값:
`styles.css / hd20-overhaul.css / hd20-five-area.css / workflow-area-density.css / maturity-condition-analysis.css / mobile-runtime-restore.css`

Repository tree에는 `mobile-runtime-restore.css` 파일이 존재하지 않는다. 따라서 삭제된 stylesheet가 런타임에 재유입되는 경우를 canonical boot에서 제거하도록 `final-layout-polish.js`에 retired stylesheet guard를 추가했다. 단순 1회 제거가 아니라 이후 DOM mutation으로 재삽입되는 경우도 차단한다.

## Workflow CSS 1차 축소
`workflow-area-density.css`에서 다음 공통 density override를 제거하고 표현 소유권을 기존 `hd20-five-area.css` canonical component로 돌렸다.

- 공통 Hero 최소높이/패딩
- 공통 Step 높이/텍스트 크기
- 공통 Card border/head/body density
- 공통 Form label/input/textarea density
- 공통 Photo/Drop density
- 공통 KPI 높이/패딩/숫자 크기
- 공통 Empty state density

반면 업무영역 자체의 의미를 만드는 규칙은 유지했다.

- Workflow step numbering
- Activity 입력 Card sticky layout
- 고도화 `조건 충족수 ≠ 공식판정`, 현재상태, 적용범위 구분
- Audit `실제 Audit 실시(D-Day) → +6개월 지속관리 → 종료평가` 시각 흐름
- 개선조치 `BEFORE → 문제정의 → 개선조치 → AFTER → 효과검증 → 재발관리` 시각 흐름
- Area별 의미색과 반응형 구조

## 업무 로직 영향
없음. 5S 6개 유형, 고도화 3조건, 공식판정, 라인 비추론 원칙, Risk 가중 랜덤 Audit, 실시일부터 달력 기준 6개월 지속관리, 개선조치 D+7~D+14 정책 범위 및 canonical stores는 변경하지 않았다.

## 현재 구조
stylesheet chain 자체는 아직 5개를 유지한다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `workflow-area-density.css`
5. `maturity-condition-analysis.css`

이번 단계는 `workflow-area-density.css`를 바로 삭제한 것이 아니라 **공통 density 경쟁을 먼저 제거하고 area-specific contract만 남기는 1차 축소**다.

## 다음 단계
최신 Design Layout/Browser/Runtime/Nav/Dashboard/Package/Pages 검증 후, 남은 workflow area-specific contract를 `hd20-five-area.css`로 실제 병합하고 `workflow-area-density.css` link 제거 및 파일 물리삭제 여부를 결정한다. 검증 전 선삭제는 하지 않는다.
