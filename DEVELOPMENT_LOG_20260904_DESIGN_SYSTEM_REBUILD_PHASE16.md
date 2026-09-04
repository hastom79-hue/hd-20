# HD-20 Design System Rebuild — Phase 16
Date: 2026-09-04

## 목적
`workflow-area-density.css`에 남아 있던 area-specific workflow presentation contract를 `hd20-five-area.css`로 실제 흡수하고, 별도 stylesheet layer를 제거한다.

## 선행 확인
Phase 15 HEAD `8b1b61a3d7bcb8526c5d968feedf18167adb7303`의 Runtime Smoke와 Package는 성공 상태를 확인했고, failure run은 0건이었다. Design/Layout 계열은 장시간 Playwright 설치가 이어지는 상태였으므로 선삭제 대신 실제 병합을 먼저 완료하고 새로운 4-layer contract로 재검증하도록 변경했다.

## 실제 반영
- `workflow-area-density.css`의 남은 표현규칙을 `hd20-five-area.css`에 실제 병합.
- 포함 범위:
  - Workflow step numbering
  - Activity 입력 Card sticky/layout
  - table overflow/최근 목록 표현
  - 고도화 `조건 충족수 ≠ 공식판정`, 현재 상태, 적용 범위
  - Audit `대상 추출 → 실제 Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 종료평가`
  - 개선조치 `BEFORE → 문제정의 → 담당팀·팀장 → 개선조치 → AFTER → 효과검증 → 재발관리`
  - area별 의미색 및 responsive contract
- `index.html`에서 `workflow-area-density.css` link 제거.
- `hd20-five-area.css` cache key를 `20260904-workflow-contract-1`로 갱신.
- Design Layout Smoke의 expected stylesheet chain을 4개로 축소.
- Design Layout Smoke에서 `workflow-area-density.css` 재유입을 retired stylesheet로 취급하도록 추가.
- 병합 후 `workflow-area-density.css` 파일 물리삭제.

## 현재 stylesheet chain
1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `maturity-condition-analysis.css`

## 업무 로직 영향
없음. 5S 6개 유형, 고도화 3조건과 공식판정 분리, 명시적 line mapping 원칙, Risk 가중 랜덤 Audit, 실제 Audit 실시일부터 달력 기준 6개월 지속관리, 개선조치 자동 Deadline 정책과 canonical stores는 변경하지 않았다.

## 다음 단계
최신 HEAD의 Design Layout / Browser / Runtime / Nav / Dashboard / Package / Pages 검증을 확인한다. Green 확인 후 `hd20-overhaul.css`와 `hd20-five-area.css` 사이의 중복 selector와 불필요한 `!important`를 안전하게 축소한다. 이 작업에서도 화면 의미와 업무정책은 변경하지 않는다.
