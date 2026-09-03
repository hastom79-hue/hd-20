# HD-20 Current Status — 2026-09-04

이 문서는 2026-09-04 기준 HD-20 전면개편의 최신 UI/Design System 상태를 기록한다. 업무기준과 상세 이력은 `README_OVERHAUL_20260902.md`, `README_CURRENT_STATUS_20260902.md`, `README_UI_ARCHITECTURE_20260902.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE12.md`를 함께 참조한다.

## 현재 IA
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 Header Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다.

## Canonical stylesheet chain
현재 `index.html`의 stylesheet 로딩 순서는 다음 5개로 축소되어 있다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `workflow-area-density.css`
5. `maturity-condition-analysis.css`

`dashboard-priority-groups.css`는 Dashboard group contract를 `hd20-five-area.css`로 실제 흡수한 뒤 물리 삭제했다. 과거 `*-fix.css`, `*-hotfix.css`, `*-polish.css` 계열을 다시 추가하지 않는다.

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
`.github/workflows/design-layout-smoke.yml`은 Desktop 1440×1000, 125% 배율 대응 1152×800, Tablet 900×900, Mobile 375×812를 검증한다.

검증범위는 5개 탭, 탭 전환 scrollY, document overflow, 주요 Box viewport 경계, ②~⑤ Header 단일성, Dashboard 6 KPI 명칭/개수, Dashboard-only layer 누출, 통합기준정보 Modal 경계에 더해 다음을 포함한다.

- stylesheet chain이 위 5개와 정확히 일치하는지 확인
- `dashboard-priority-groups`, `hotfix`, `polish` stylesheet 재유입 차단
- Audit 화면의 `Audit 실시(D-Day) / +6개월 지속관리 / 종료평가` 의미표현 확인
- 개선조치 화면의 `BEFORE / 문제정의 / 개선조치 / AFTER / 효과검증 / 재발관리` 의미표현 확인

## 다음 통합 대상
남은 주요 보조 presentation layer는 `workflow-area-density.css`다. 이 파일은 현재 공통 density 규칙과 ③/④/⑤ area-specific 의미표현이 함께 존재한다. 다음 통합은 한 번에 삭제하지 않고 다음 순서로 진행한다.

`공통 Card/Form/Table/Flow 중복 식별 → canonical 규칙으로 흡수 → area-specific 의미표현 유지 검증 → Design Layout Smoke 통과 → index link 제거 → 파일 물리 삭제`

업무 산식, Canonical Store, 승인되지 않은 Threshold/정책은 CSS 통합 과정에서 변경하지 않는다.
