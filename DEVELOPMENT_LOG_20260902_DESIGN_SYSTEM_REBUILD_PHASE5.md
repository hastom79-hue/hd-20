# HD-20 Design System Rebuild Phase 5 — 2026-09-02

## 목적
Phase 4에서 추가한 통합 대시보드 우선순위 계층을 ②~⑤ 업무화면과 완전히 분리하고, 남아 있던 고도화 성과전환·폐쇄루프 상세의 runtime CSS 소유권을 canonical Design System으로 이동한다.

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

## 4. Design Layout 계약 강화
`HD20 design layout smoke`에 dashboard-only layer 검증을 추가했다.

Dashboard에서는:
- 운영 KPI 6종 표시
- 폐쇄루프 상세 표시

②~⑤ 화면에서는:
- `#hd20DashboardPriority` 비표시
- `#hd20OperationalBridge` 비표시
- `.hd20DashboardSectionLabel` 비표시

기존 desktop/mobile horizontal overflow, active tab, duplicate header, pageerror 검증은 유지한다.

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
