# HD-20 Current Status — 2026-09-04

이 문서는 2026-09-04 기준 HD-20 전면개편의 최신 UI/Design System 상태를 기록한다. 업무기준과 상세 이력은 `README_OVERHAUL_20260902.md`, `README_CURRENT_STATUS_20260902.md`, `README_UI_ARCHITECTURE_20260902.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE14.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE15.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE16.md`, `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE17.md`를 함께 참조한다.

## 현재 IA
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 Header Utility이며 `HDPS · 5S Expert AI`는 공통 지원기능이다.

## Canonical stylesheet chain
현재 `index.html`의 정적 stylesheet 로딩 순서는 다음 4개다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `maturity-condition-analysis.css`

`dashboard-priority-groups.css`와 `workflow-area-density.css`는 각각의 표현 contract를 `hd20-five-area.css`로 실제 흡수한 뒤 link 제거 및 파일 물리삭제까지 완료했다. 과거 `*-fix.css`, `*-hotfix.css`, `*-polish.css` 계열 stylesheet를 다시 추가하지 않는다.

Phase 13 Design Layout Smoke가 검출한 `mobile-runtime-restore.css` 런타임 재유입은 `final-layout-polish.js`의 retired stylesheet guard로 차단한다. Repository tree에는 해당 파일이 존재하지 않는다.

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

## Workflow presentation ownership — Phase 16
Phase 14에서 `workflow-area-density.css`의 공통 Card/Form/KPI density를 먼저 제거했고, Phase 16에서 남아 있던 area-specific contract까지 `hd20-five-area.css`에 실제 병합했다.

병합 대상은 Workflow step numbering, Activity 입력 layout, 고도화 조건/공식판정/적용범위 구분, Audit 6개월 lifecycle, 개선조치 closed-loop, 영역별 의미색 및 반응형 규칙이다. 병합 후 `index.html` link를 제거하고 파일을 물리 삭제했다.

## Navigation ownership cleanup — Phase 17
`hd20-overhaul.css`와 `hd20-five-area.css`가 동시에 Navigation 열수와 버튼 높이를 지정하던 중복을 축소했다. 공통 Navigation 표면·색·상호작용은 `hd20-overhaul.css`가 유지하고, 5개 업무영역의 실제 열수와 버튼 최소높이 및 1100/700px 반응형 전환은 `hd20-five-area.css`가 단독 소유한다.

이에 따라 `hd20-overhaul.css`에서 `.beginnerNav`의 `grid-template-columns`, `.beginnerNav button`의 `min-height`, 980/700/460px 구간의 Navigation 열수·높이 override를 제거했다. `index.html`의 `hd20-overhaul.css` cache key도 `20260904-nav-owner-1`로 갱신했다.

## Runtime presentation cleanup
`health-grid-practical-final.js`의 runtime visual `<style>` 주입은 Phase 15에서 제거했다. KPI 상세 설명은 canonical `.awHint` 표현을 재사용한다. Repository code search 기준 visual runtime style은 제거되었고 `nav-scroll-stability.js`의 탭 전환용 functional 1줄 rule만 남는다.

## Regression contract
`.github/workflows/design-layout-smoke.yml`은 Desktop 1440×1000, 125% 배율 대응 1152×800, Tablet 900×900, Mobile 375×812를 검증한다.

검증범위는 5개 탭, 탭 전환 scrollY, document overflow, 주요 Box viewport 경계, ②~⑤ Header 단일성, Dashboard 6 KPI 명칭/개수, Dashboard-only layer 누출, 통합기준정보 Modal 경계, stylesheet chain, Audit/Action 의미표현을 포함한다.

Phase 16부터 stylesheet contract는 `styles.css / hd20-overhaul.css / hd20-five-area.css / maturity-condition-analysis.css` 정확히 4개로 고정하며 `workflow-area-density.css`가 다시 로드되면 실패하도록 했다.

## 다음 통합 대상
최신 Design Layout/Browser/Runtime/Nav/Dashboard/Package/Pages 검증 후 `hd20-overhaul.css`와 `hd20-five-area.css`의 나머지 중복 selector를 보수적으로 축소한다. 특히 공통 Workflow base와 5-area scoped rule을 구분하여, 범용 component가 필요한 곳은 `hd20-overhaul.css`, 5개 화면 고유 밀도·반응형은 `hd20-five-area.css`가 소유하도록 정리한다.

업무 산식, Canonical Store, 승인되지 않은 Threshold/정책은 디자인 통합 과정에서 변경하지 않는다.
