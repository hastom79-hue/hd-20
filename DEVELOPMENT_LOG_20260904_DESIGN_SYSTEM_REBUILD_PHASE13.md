# HD-20 Design System Rebuild — Phase 13
Date: 2026-09-04

## 목적
`workflow-area-density.css` 통합 전에 현재 화면 의미와 stylesheet chain을 자동검증 계약으로 고정하여, CSS 이동 중 시각적으로는 비슷하지만 업무 흐름 문구가 사라지거나 퇴역 stylesheet가 재유입되는 회귀를 차단한다.

## 선행 확인
Phase 12 최신 HEAD의 GitHub Actions에서 Dashboard canonical smoke와 Package HD20 source 성공을 확인했다. Phase 13은 이 안정상태에서 시작했다.

## 반영
`.github/workflows/design-layout-smoke.yml`에 다음 검증을 추가했다.

- stylesheet chain 정확성: `styles.css → hd20-overhaul.css → hd20-five-area.css → workflow-area-density.css → maturity-condition-analysis.css`
- `dashboard-priority-groups`, `hotfix`, `polish` stylesheet 재유입 금지
- ④ Audit pseudo-flow에 `Audit 실시(D-Day)`, `+6개월 지속관리`, `종료평가` 존재 확인
- ⑤ 개선조치 pseudo-flow에 `BEFORE`, `문제정의`, `개선조치`, `AFTER`, `효과검증`, `재발관리` 존재 확인

또한 `README_CURRENT_STATUS_20260904.md`를 생성하여 Phase 12 이후 실제 stylesheet chain, Dashboard 6 KPI contract, Workflow semantic contract, 다음 CSS 통합 순서를 최신 상태로 명시했다.

## 업무 로직 영향
없음. 이번 단계는 다음 CSS 통합을 위한 회귀 안전망 강화와 문서 현행화다.

## 다음 단계
`workflow-area-density.css`의 공통 presentation 규칙과 area-specific 의미규칙을 분리 식별한다. 공통 규칙부터 `hd20-five-area.css`로 흡수하고 smoke를 통과시킨 후에만 남은 보조 layer 제거를 진행한다.
