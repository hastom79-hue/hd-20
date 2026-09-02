# HD-20 Design System Rebuild Phase 5 — 2026-09-02

## 목적
Phase 4에서 추가한 통합 대시보드 우선순위 계층을 ②~⑤ 업무화면과 완전히 분리하고, 남아 있던 화면용 runtime CSS 소유권을 canonical Design System으로 이동한다.

## 1. Dashboard 전용 영역 유출 방지
`dashboard-priority-layout.js`가 만든 다음 요소는 통합 대시보드 전용이다.

- `#hd20DashboardPriority`
- `.hd20DashboardSectionLabel`
- `#hd20OperationalBridge`

② 5S 활동 / ③ 고도화·판정 / ④ 유지·Audit / ⑤ 개선조치 전환 시 `.app.awFocused` 상태에서 위 요소를 숨기도록 canonical CSS 계약을 추가했다.

이 조치는 데이터나 Workflow를 숨기는 것이 아니라, 대시보드 전용 요약레이어가 다른 업무화면에 잔류하는 시각적 오류를 방지하기 위한 것이다.

## 2. 고도화 성과전환 runtime CSS 제거
`performance-conversion-analysis.js`의 대형 `style()` / `<style id="performanceConversionStyle">` 생성 코드를 제거했다.

JS는 다음 동작만 담당한다.
- Canonical 5S 고도화 데이터 집계
- 후보 / 공식확정 / 현재유지 현황
- 생산팀별 상세 조회
- 고도화 수준 Map 연결
- 3대 조건 안내

`.pcHeader / .pcFlow / .pcStage / .pcGrid / .pcPanel / .pcType / .pcModal / .pcTable`의 표현은 `hd20-five-area.css`가 담당한다.

상세 Modal Table은 모바일 viewport 자체를 확장하지 않고 `.pcTableWrap` 내부에서만 가로 스크롤한다.

## 3. 운영 폐쇄루프 runtime CSS 제거
`dashboard-operational-bridge.js`의 `css()` runtime style injection을 제거했다.

기능은 그대로 유지한다.
- 3조건 모두 충족 작업장
- 2조건 충족 라인
- Audit 6개월 관리중
- 종료평가 대기 / 유지 / 미흡
- 개선조치 미완료
- 기한경과
- 재발

최상위 운영 KPI 6종과 역할이 겹치지 않도록 화면 명칭을 `폐쇄루프 상세 운영상태`로 낮추고, 시각적 중요도도 보조 레벨로 조정했다.

## 4. Workflow foundation runtime CSS 제거
`activity-workflow.js`가 생성하던 `activityWorkflowStyle` 전체를 제거했다.

JS는 다음 업무기능만 유지한다.
- 6개 5S 유형 등록
- BEFORE / AFTER 증빙
- 고도화 후보 Gate
- 고도화 후보 / 공식판정 Raw Grid
- 조건충족 × 적용범위 Grid
- Audit 상태 집계
- Canonical Store 저장 및 이벤트 발생

기존 `.awScreen / .awHero / .awFlow / .awKpis / .awGrid / .awCard / .awForm / .awPhoto / .awDrop / .awTable / .awStatus` foundation style은 `hd20-five-area.css`로 이전했다.

특히 `.awScreen{display:none}` / `.awScreen.on{display:block}` 계약도 static CSS가 소유하므로, 선택되지 않은 업무 Screen이 DOM에 존재하더라도 화면에 동시에 노출되지 않는다.

## 5. 상단 Navigation runtime CSS 제거
`beginner-navigation.js`의 `beginnerNavStyle` 생성 코드를 제거했다.

다음 동작은 그대로 유지한다.
- 5개 Navigation DOM 정규화
- Dashboard / Activity / Advancement / Audit / Action 전환
- 기존 deep link `conversion / workplace / master` 정규화
- `awFocused` 상태 전환
- 통합 업무 흐름 안내문

상단 Navigation의 시각 규칙은 `hd20-overhaul.css + hd20-five-area.css`에서만 관리한다.

## 6. Design Layout 계약 강화
`HD20 design layout smoke`에 dashboard-only layer 검증을 추가했다.

Dashboard에서는:
- 운영 KPI 6종 표시
- 폐쇄루프 상세 표시

②~⑤ 화면에서는:
- `#hd20DashboardPriority` 비표시
- `#hd20OperationalBridge` 비표시
- `.hd20DashboardSectionLabel` 비표시

기존 desktop/mobile horizontal overflow, active tab, duplicate header, pageerror 검증은 유지한다.

## Runtime style 잔여
Repository code search 기준 대형 visual `createElement('style')` 경로는 제거됐다.

남은 `nav-scroll-stability.js`의 1줄 rule:

`html.hd20-nav-switching{scroll-behavior:auto!important}`

은 탭 전환 중 브라우저의 부드러운 스크롤 복원 동작을 막기 위한 functional rule이며 시각테마를 결정하지 않으므로 유지한다.

## 업무 로직 보존
이번 단계에서 변경하지 않은 항목:
- `HD20KPIData.operational()` 산식
- 고도화 3대 조건
- 공식 판정 주체 및 결과
- Risk 가중 랜덤 Audit
- 실제 Audit 실시일 + 달력 6개월 지속관리
- 개선조치 D+7~D+14 정책
- 종료평가 유지/미흡
- Canonical Store 및 생산팀 Master

## 관련 commits
- `3cba983` — closed-loop bridge runtime CSS 제거
- `d5f0323` — performance conversion runtime CSS 제거
- `70225c4` — canonical CSS 통합 + dashboard-only visibility 계약
- `891562b` — design layout dashboard-only leak regression
- `81e4a98` — activity workflow runtime CSS 제거
- `7c84d03` — workflow foundation static CSS 이전
- `c6df9e9` — beginner navigation runtime CSS 제거
