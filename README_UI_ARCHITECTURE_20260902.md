# HD-20 UI Architecture Current Status — 2026-09-04

이 README는 HD-20 업무기준을 변경하지 않고 전면 디자인 구조개편의 최신 표현 소유권과 회귀검증 상태를 기록한다.

## 현재 구조
HD-20은 여러 theme/hotfix CSS의 load order로 최종 디자인을 결정하지 않는다. `hd20-overhaul.css`와 `hd20-five-area.css`를 중심으로 공통 Design System과 5개 업무영역 레이아웃을 관리한다.

현재 메인 정보계층:

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
`index.html`이 정적으로 로드하는 표현 계층은 다음 4개다.

1. `styles.css`
2. `hd20-overhaul.css`
3. `hd20-five-area.css`
4. `maturity-condition-analysis.css`

Phase 12에서 `dashboard-priority-groups.css`를 실제 병합 후 제거했고, Phase 14에서 `workflow-area-density.css`의 공통 density를 먼저 축소한 뒤 Phase 16에서 남은 area-specific contract까지 `hd20-five-area.css`에 흡수했다. 이후 `index.html` link 제거와 파일 물리삭제를 완료했다.

새로운 `*-fix.css`, `*-hotfix.css`, `*-polish.css`를 추가하는 방식은 사용하지 않는다.

## Workflow presentation ownership
`.awScreen / .awHero / .awFlow / .awStep / .awKpis / .awGrid / .awSplit / .awForm / .awTable / .awCriteriaBanner` 및 ③·④·⑤의 의미표현은 이제 `hd20-five-area.css`가 직접 소유한다.

포함되는 area-specific contract:
- Workflow step numbering
- Activity 입력 Card/버튼 layout
- 고도화 `조건 충족수 ≠ 공식판정`, 현재상태, 적용범위 구분
- Audit `실제 Audit 실시(D-Day) → +6개월 지속관리 → 종료평가`
- 개선조치 `BEFORE → 문제정의 → 개선조치 → AFTER → 효과검증 → 재발관리`
- 영역별 의미색 및 반응형 구조

## Runtime stylesheet 방어
Phase 13 Design Layout Smoke에서 Repository에 이미 존재하지 않는 `mobile-runtime-restore.css`가 런타임 DOM에 다시 삽입되는 회귀를 검출했다. `final-layout-polish.js` canonical boot는 퇴역 stylesheet link가 존재하면 제거하고 이후 DOM mutation으로 재삽입되는 경우도 차단한다.

`health-grid-practical-final.js`의 visual runtime `<style>`은 Phase 15에서 제거했다. 현재 확인된 `createElement('style')`은 `nav-scroll-stability.js`의 탭 전환 중 `scroll-behavior:auto!important` 기능 규칙 1줄뿐이다.

## 퇴역 stylesheet 물리 삭제
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
- `workflow-area-density.css`

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

Phase 16부터 stylesheet contract는 정확히 4개로 고정한다. `workflow-area-density.css`, `dashboard-priority-groups.css`, hotfix/polish 계열이 다시 들어오면 실패한다.

## 현재 다음 구조정리
- 최신 Design Layout / Browser / Runtime / Nav / Dashboard / Package / Pages 검증 완료
- `hd20-overhaul.css`와 `hd20-five-area.css`의 중복 selector 및 불필요한 `!important` 추가 축소
- ②~⑤ table/form 폭·밀도 미세조정
- 각 업무영역이 `어디를 보고 → 무엇을 판단하고 → 다음에 무엇을 해야 하는지` 순서로 읽히는지 정보계층 재검증

상세 변경이력은 `DEVELOPMENT_LOG_20260904_DESIGN_SYSTEM_REBUILD_PHASE16.md`까지 이어진다.
