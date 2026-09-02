# HD-20 Design System Rebuild — 2026-09-02

## 목적
기능 추가 과정에서 누적된 다중 테마·hotfix·runtime CSS 주입 경쟁을 줄이고, HD-20의 5개 업무영역을 하나의 제품 UI 체계로 통합한다.

## Phase 1 반영

### 1. index.html 스타일 로딩 구조 정리
기존 index.html에서 아래 중첩 테마/보정 레이어를 직접 로딩하지 않도록 정리했다.
- readability-polish.css
- dashboard-premium-theme.css
- dashboard-contrast-fix.css
- title-underline-fix.css
- dashboard-balance-hotfix.css
- shared-color-theme-final.css

기본 구조 CSS + 실제 업무화면 CSS + canonical design layer 순서로 단순화했다.

현재 주요 스타일 순서:
1. styles.css
2. approved-landing-v2.css
3. hd20-overhaul.css
4. hd20-five-area.css
5. maturity-condition-analysis.css
6. tab-polish.css
7. modal-chrome-unify.css

### 2. final-layout-polish.js 역할 축소
이 모듈이 hd20-overhaul.css / hd20-five-area.css / maturity-condition-analysis.css를 runtime에 다시 삽입하던 동작을 제거했다.
이제 final-layout-polish.js는 canonical 업무 JS 모듈 로딩만 담당한다.

### 3. hd20-overhaul.css Design System 재구축
공통 디자인 토큰을 정의했다.
- Background / Panel / Line / Text / Muted
- Primary / Success / Warning / Danger / Purple
- Radius 3단계
- Shadow 2단계
- 4px 기반 spacing scale

공통 UI 규칙을 재정리했다.
- Header
- Header action buttons
- 5-area navigation
- KPI cards
- Main/Side/Bottom grid
- Card header/body
- Chart visual hierarchy
- Audit summary
- Action summary
- Advancement criteria cards
- Workflow hero/cards
- Table
- Form
- Modal
- Responsive breakpoints

### 4. 업무 로직 보존
이번 단계에서는 canonical Store, Audit random draw, 6개월 관리, 개선조치 deadline, 고도화 판정 로직을 변경하지 않았다.
표현계층만 정리했다.

## 다음 단계
- active runtime style injection 전수 점검
- modal/table/button 공통 컴포넌트로 추가 통합
- ② 5S 활동 / ③ 고도화·판정 / ④ 유지·Audit / ⑤ 개선조치 화면별 정보밀도 정리
- desktop/mobile overflow 회귀검증 강화
- 제거 가능한 legacy theme/hotfix 파일 퇴역

## 관련 commits
- 7999594 — index.html canonical style layer 전환
- 254eb5e — final-layout-polish runtime stylesheet reinjection 제거
- 49bbc03 — hd20-overhaul.css design system rebuild
