# HD-20 UI Architecture Current Status — 2026-09-04

이 README는 HD-20 업무기준을 변경하지 않고 전면 디자인 구조개편의 최신 표현 소유권과 회귀검증 상태를 기록한다.

## 현재 구조
HD-20은 여러 theme/hotfix CSS의 load order로 최종 디자인을 결정하지 않는다. `hd20-overhaul.css`와 `hd20-five-area.css`를 중심으로 공통 Design System과 5개 업무영역 레이아웃을 관리한다.

현재 메인 정보계층은 다음 순서다.

`운영 건전성 KPI 6종 → 5S 활동·고도화 성과 흐름 → 폐쇄루프 상세 운영상태 / 팀별 실행·Audit → 판정기준·추이`

운영 KPI 6종은 `HD20KPIData.operational()`의 실제 계산결과를 사용한다.

1. 공식 판정 완료율
2. 평균 판정 Lead Time
3. 고도화 수준
4. Audit 후 6개월 유지율
5. Audit 부적합 재발률
6. 기한 내 개선조치 완료율

실제 계산 데이터가 없으면 `—`를 표시하며 임의값·등급·Threshold를 만들지 않는다.

## 5개 업무영역 표현 계약
- ① 통합 대시보드: 운영 KPI와 전체 성과/폐쇄루프 요약
- ② 5S 활동: 현장 실행·등록·증빙 중심
- ③ 고도화·판정: 후보·공식판정·조건충족·적용범위 중심
- ④ 유지·Audit: Risk 랜덤 추출·Audit 실시·실시일부터 6개월 지속관리·종료평가 중심
- ⑤ 개선조치: Deadline·BEFORE/AFTER·효과검증·재발 중심

Dashboard 전용 `#hd20DashboardPriority`, `#hd20OperationalBridge`, `.hd20DashboardSectionLabel`은 ②~⑤ 화면에서 표시하지 않는다.

## 현재 실제 stylesheet chain
`index.html`이 정적으로 로드하는 표현 계층은 다음 5개다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `workflow-area-density.css`
5. `maturity-condition-analysis.css`

Phase 12에서 `dashboard-priority-groups.css`의 `hd20DashboardPriorityGroups / hd20HealthGroup / Dashboard detail density / responsive` 규칙을 실제로 `hd20-five-area.css`에 병합한 뒤 `index.html` link를 제거하고 파일을 물리 삭제했다. Phase 10처럼 병합 전 link부터 제거하는 방식은 더 이상 사용하지 않는다.

Phase 14에서는 `workflow-area-density.css`에서 공통 Hero/Card/Form/KPI/Empty-state density override를 제거했다. 해당 공통 표현은 `hd20-five-area.css`가 소유하고, 현재 `workflow-area-density.css`에는 Workflow step numbering, 화면별 layout ratio, 고도화 조건/공식판정/적용범위 구분, Audit lifecycle, 개선조치 closed-loop 등 area-specific 표현 contract만 남겨 두었다.

새로운 `*-fix.css`, `*-hotfix.css`, `*-polish.css`를 추가하는 방식은 사용하지 않는다.

## Runtime stylesheet 방어
Phase 13 Design Layout Smoke에서 Repository에 이미 존재하지 않는 `mobile-runtime-restore.css`가 런타임 DOM에 다시 삽입되는 회귀를 실제 검출했다. Repository tree에는 해당 파일이 없으며, 재유입의 최초 주입 Source는 아직 특정하지 못했다.

Phase 14의 `final-layout-polish.js` canonical boot는 다음 퇴역 stylesheet link가 존재하면 제거하고, 이후 DOM mutation으로 다시 삽입되는 경우도 차단한다.

- `mobile-runtime-restore.css`
- `dashboard-priority-groups.css`
- 과거 readability/theme/contrast/title/balance/shared-color/tab/modal hotfix·polish 계열

이는 표현 계층 정합성 방어이며 KPI 산식, 업무 데이터, 운영정책을 변경하지 않는다.

## Runtime style 잔여 확인
대형 visual stylesheet를 JS에서 다시 삽입하던 주요 경로는 canonical CSS로 이전했다. 다만 직접 파일 점검 결과 `health-grid-practical-final.js`에는 KPI 상세 Modal용 소규모 visual `<style>` 생성 코드가 아직 남아 있다. 따라서 과거 문서의 “`nav-scroll-stability.js` 1줄 외 runtime style이 없다”는 표현은 현재 기준으로 정확하지 않다.

현재 확인된 runtime style은 다음 두 종류다.

- `nav-scroll-stability.js`: 탭 전환 중 `scroll-behavior:auto!important` 1줄 기능 규칙
- `health-grid-practical-final.js`: KPI 상세 Modal decision note/table visual 규칙

후자는 다음 canonical modal 정리 단계에서 `hd20-overhaul.css`로 이전한 뒤 JS visual injection을 제거할 대상이다.

## 퇴역 stylesheet 물리 삭제
Canonical Design System 전환 이후 더 이상 메인 화면에 참여하지 않는 과거 layer는 저장소에서도 삭제했다.

- `readability-polish.css`
- `dashboard-premium-theme.css`
- `dashboard-contrast-fix.css`
- `title-underline-fix.css`
- `dashboard-balance-hotfix.css`
- `shared-color-theme-final.css`
- `mobile-runtime-restore.css`
- `tab-polish.css`
- `modal-chrome-unify.css`
- `dashboard-priority-groups.css`

## 자동검증
`HD20 design layout smoke`는 Desktop `1440×1000`, 125% 배율 상당 `1152×800`, Tablet `900×900`, Mobile `375×812`에서 5개 업무영역을 확인한다.

검증내용:
- 5개 탭 active 및 tab switch scroll top
- document horizontal overflow / critical bounding box
- ②~⑤ Area Header 단일성
- pageerror
- Dashboard KPI 6종 존재·승인명칭
- Dashboard 전용 UI의 ②~⑤ 유출 여부
- 통합기준정보 Modal bounding box
- stylesheet chain 및 퇴역 stylesheet 재유입
- Audit `실제 Audit 실시(D-Day) → +6개월 지속관리 → 종료평가` 의미표현
- 개선조치 `BEFORE → 문제정의 → 개선조치 → AFTER → 효과검증 → 재발관리` 의미표현

Phase 13은 이 검증을 통해 `mobile-runtime-restore.css` 런타임 재유입을 실제 검출했고 Phase 14에서 방어로직을 반영했다. 회귀검증 실패는 숨기지 않고 원인을 해소한 뒤 다음 CSS 제거로 진행한다.

## 현재 다음 구조정리
우선순위는 다음과 같다.

- Phase 14 최신 HEAD의 Design Layout / Browser / Runtime / Nav / Dashboard / Package / Pages 검증 완료
- `workflow-area-density.css`에 남은 area-specific contract를 `hd20-five-area.css`로 실제 병합
- 병합 검증 후 `workflow-area-density.css` link 제거 및 파일 물리삭제
- `health-grid-practical-final.js`의 Modal visual runtime style을 canonical modal CSS로 이전
- `hd20-overhaul.css`와 `hd20-five-area.css` 중복 selector 및 불필요한 `!important` 추가 축소
- ②~⑤ 각 화면이 `어디를 보고 → 무엇을 판단하고 → 다음에 무엇을 해야 하는지` 순서로 읽히는지 정보계층 재검증

상세 변경이력:
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE2.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE3.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE4.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE5.md`
- `DEVELOPMENT_LOG_20260903_DESIGN_SYSTEM_REBUILD_PHASE6.md`
- `DEVELOPMENT_LOG_20260903_DESIGN_SYSTEM_REBUILD_PHASE7.md`
- `DEVELOPMENT_LOG_20260903_DESIGN_SYSTEM_REBUILD_PHASE8.md`
- `DEVELOPMENT_LOG_20260903_DESIGN_SYSTEM_REBUILD_PHASE9.md`
- `DEVELOPMENT_LOG_20260903_DESIGN_SYSTEM_REBUILD_PHASE10.md`
- `DEVELOPMENT_LOG_20260903_DESIGN_SYSTEM_REBUILD_PHASE11.md`
- `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE12.md`
- `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE13.md`
- `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE14.md`
