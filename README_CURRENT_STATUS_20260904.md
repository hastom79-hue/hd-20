# HD-20 Current Status — 2026-09-04

이 문서는 2026-09-04 기준 HD-20 전면개편의 최신 UI/Design System 상태를 기록한다. 업무기준과 상세 이력은 `README_OVERHAUL_20260902.md`, `README_CURRENT_STATUS_20260902.md`, `README_UI_ARCHITECTURE_20260902.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE14.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE15.md`를 함께 참조한다.

## 현재 IA
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 Header Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다.

## Canonical stylesheet chain
현재 `index.html`의 정적 stylesheet 로딩 순서는 다음 5개다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `workflow-area-density.css`
5. `maturity-condition-analysis.css`

`dashboard-priority-groups.css`는 Dashboard group contract를 `hd20-five-area.css`로 실제 흡수한 뒤 물리 삭제했다. 과거 `*-fix.css`, `*-hotfix.css`, `*-polish.css` 계열 stylesheet를 다시 추가하지 않는다.

Phase 13 Design Layout Smoke는 런타임에서 이미 삭제된 `mobile-runtime-restore.css` link가 다시 나타나는 것을 실제 검출했다. Repository tree에는 파일이 없으므로 `final-layout-polish.js`의 canonical boot에서 retired stylesheet link를 제거하고, 이후 DOM mutation으로 재삽입되는 경우도 차단하도록 보완했다. 이 조치는 업무 로직이나 화면 데이터에 관여하지 않는다.

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

## Workflow presentation ownership — Phase 14
`workflow-area-density.css`는 더 이상 공통 Card/Form/KPI density를 중복 소유하지 않도록 1차 축소했다.

공통 Hero/Card/Form/KPI/Empty-state density는 `hd20-five-area.css` canonical component가 소유한다. `workflow-area-density.css`에는 현재 Workflow step numbering, Activity 입력 layout, 고도화 조건/공식판정/적용범위 구분, Audit 6개월 lifecycle 표현, 개선조치 closed-loop 표현, area별 의미색과 반응형 구조처럼 업무영역 고유 표현만 남겨 두었다.

즉, 현재 단계는 `workflow-area-density.css`를 성급하게 삭제한 것이 아니라 **중복 density 제거 → area-specific contract만 남김 → 회귀검증 → 최종 병합/삭제 판단** 순서다.

## Runtime presentation cleanup — Phase 15
`health-grid-practical-final.js`가 Modal용 시각 CSS를 런타임 `<style>`로 주입하던 경로를 제거했다. KPI 상세 설명은 기존 canonical `.awHint` 표현을 재사용하며, 표와 Modal의 시각계약은 정적 CSS가 담당한다.

동시에 해당 모듈의 KPI 식별명을 `6개월 유지율`에서 승인된 정확한 명칭인 `Audit 후 6개월 유지율`로 교정했다. `기한 내 개선조치 완료율` 설명도 `등록일 기준 운영정책으로 자동 지정된 완료기한`을 기준으로 표현하도록 정리하여 특정 일수를 화면 설명이 임의 정책처럼 다시 고정하지 않도록 했다.

Repository code search 기준 visual `createElement('style')` 주입은 제거되었고, 남은 것은 `nav-scroll-stability.js`의 탭 전환용 functional 1줄 rule뿐이다.

## Regression contract
`.github/workflows/design-layout-smoke.yml`은 Desktop 1440×1000, 125% 배율 대응 1152×800, Tablet 900×900, Mobile 375×812를 검증한다.

검증범위는 5개 탭, 탭 전환 scrollY, document overflow, 주요 Box viewport 경계, ②~⑤ Header 단일성, Dashboard 6 KPI 명칭/개수, Dashboard-only layer 누출, 통합기준정보 Modal 경계, stylesheet chain, Audit/Action 의미표현을 포함한다.

Phase 13에서 실제로 퇴역 stylesheet 재유입을 검출했기 때문에, 회귀검증 실패를 숨기지 않고 원인을 제거한 후 다음 CSS 통합으로 진행한다.

## 다음 통합 대상
최신 Design Layout/Browser/Runtime/Nav/Dashboard/Package/Pages 검증 후 `workflow-area-density.css`에 남은 area-specific contract를 `hd20-five-area.css`로 실제 병합한다. 병합 검증이 끝난 뒤에만 `index.html` link 제거와 파일 물리삭제를 수행한다.

업무 산식, Canonical Store, 승인되지 않은 Threshold/정책은 CSS 통합 과정에서 변경하지 않는다.
