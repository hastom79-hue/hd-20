# HD-20 Current Status — 2026-09-04

이 문서는 2026-09-04 기준 HD-20 전면개편의 최신 UI/Design System 상태를 기록한다.

## 현재 IA
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 Header Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다.

## 긴급 디자인 복원 — 2026-09-04
Phase 12~17의 stylesheet 통합 이후 실제 화면의 구성·균형·밀도가 전반적으로 무너졌다는 사용자 피드백을 반영하여, 추가 정리를 즉시 중단하고 마지막으로 검증된 Phase 11 presentation baseline을 복원했다.

복원 범위는 **표현 계층만**이다. 업무 로직, canonical store, KPI 산식, 고도화 3조건, 공식판정, Risk 가중 랜덤 Audit, Audit 실시일부터 달력 기준 +6개월 지속관리, 개선조치 Deadline 정책은 롤백하지 않았다.

현재 stylesheet stack은 다음 안정형 6개 구조로 복원했다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `dashboard-priority-groups.css`
5. `workflow-area-density.css`
6. `maturity-condition-analysis.css`

`dashboard-priority-groups.css`는 Dashboard의 3영역 grouping과 main/side/bottom density를 담당한다. `workflow-area-density.css`는 ②~⑤의 실행화면 밀도와 고도화/Audit/개선조치 의미표현을 담당한다. 이 두 파일은 현재 다시 독립 layer로 유지하며, 시각 검증 없이 재통합하지 않는다.

## Phase 20 — ③ 고도화·판정 정보계층 재구성
`maturity-condition-analysis.js/css`를 기준으로 ③ 화면의 고도화 수준과 적용범위를 다시 구성했다. 기존 업무 데이터와 판정 로직을 변경하지 않고 화면의 이해 순서를 `고도화 성과수준 → 3대 조건 → 적용범위 현상 → 분석결과 → 공식판정 → 상세데이터`로 정리했다.

고도화 성과의 1차 표시 구간은 다음 3개다.

- `1개 조건 충족 영역` = 정확히 1개 조건 충족
- `2개 이상 충족 영역` = 정확히 2개 조건 + 3개 모두 충족의 누적 구간
- `3개 모두 충족 영역` = 3대 조건 모두 충족

상세 집계에서는 정확히 1/2/3개 충족값을 계속 분리해 보존한다. `2개 이상`은 누적 표시임을 화면에 명시해 3개 모두 충족 구간과의 중복 의미를 숨기지 않는다. 0개 충족은 고도화 성과에서 제외한다.

적용범위는 `생산팀 → 라인 → 작업장` 구조를 사용한다. 라인은 원천데이터에 구조화 필드로 명시된 경우에만 집계하며, 작업장명이나 자유기술에서 임의 추정하지 않는다. 작업장 데이터는 있으나 라인이 없는 경우 `미분류/라인 매핑 필요` 상태로 표시한다.

공식판정은 조건 충족수와 별도로 표현한다. 화면에 `조건 충족수 ≠ 공식판정`을 명시하며, 판정기재/확정/보완요청/미확정 집계는 실제 판정 필드가 있는 데이터만 사용한다. 조건 수만으로 공식 성과를 확정하지 않는다.

## Dashboard contract
Dashboard 최상위 운영 KPI는 승인된 6종만 사용한다.

- 공식 판정 완료율
- 평균 판정 Lead Time
- 고도화 수준
- Audit 후 6개월 유지율
- Audit 부적합 재발률
- 기한 내 개선조치 완료율

Dashboard-only layer인 `#hd20DashboardPriority`, `#hd20OperationalBridge`, `.hd20DashboardSectionLabel`은 ②~⑤에 노출하지 않는다.

## Workflow semantic contract
③ 고도화·판정은 고도화 조건 충족수와 공식판정을 분리한다. 조건은 `시각화·형적관리 / 인간공학적 Green Zone / 정량축소·정위치 변경을 통한 공간 활용` 3개이며, 라인은 명시적 구조화 필드만 사용한다.

④ 유지·Audit은 `Risk 가중 랜덤 대상추출 → 실제 Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 종료평가` 흐름을 유지한다. 고정 M+1/M+3/M+6 운영규칙은 사용하지 않는다.

⑤ 개선조치는 `BEFORE → 문제정의 → 담당팀·팀장 → 개선조치 → AFTER → 효과검증 → 재발관리` 흐름을 유지한다. Deadline은 등록일 기준 7~14일 범위이며 정확한 자동지정 일수는 운영정책 설정값만 사용한다.

## Regression contract
`.github/workflows/design-layout-smoke.yml`은 Desktop 1440×1000, 125% 배율 대응 1152×800, Tablet 900×900, Mobile 375×812를 검증한다. 복원된 6개 stylesheet stack을 공식 화면계약으로 검사하며, 5개 탭, scrollY, document overflow, 주요 box viewport 경계, Dashboard 6 KPI, Dashboard-only layer 누출, 통합기준정보 Modal, Audit/Action 의미표현을 함께 확인한다.

Phase 20부터 ③ 고도화·판정에 대해 `1개 조건 충족 영역 / 2개 이상 충족 영역 / 3개 모두 충족 영역`, `조건 충족수 ≠ 공식판정`, 3대 고도화 조건, `라인 미분류 / 매핑 필요`, `공식판정은 별도 관리` 문구와 새 maturity hierarchy의 실제 표시 여부도 Desktop/125%/Tablet/Mobile 전 구간에서 회귀검증한다.

## 다음 작업 원칙
추가 CSS 병합·삭제는 중단한다. 실제 화면을 기준으로 영역별 구성·정보계층·배치 밸런스를 순차적으로 개선한다. Phase 20에서는 ③ 고도화·판정 화면의 의미계층을 먼저 정리했으며, 이후에도 사용자 확인 없이 대규모 스타일 계층을 다시 합치지 않는다.
