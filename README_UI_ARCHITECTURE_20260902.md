# HD-20 UI Architecture Current Status — 2026-09-02

이 README는 `README_CURRENT_STATUS_20260902.md`의 업무기준을 변경하지 않고, 전면 디자인 구조개편의 최신 상태만 보완 기록한다.

## 현재 구조
HD-20은 더 이상 여러 theme/hotfix CSS의 load order로 최종 디자인을 결정하지 않는다. `hd20-overhaul.css`와 `hd20-five-area.css`를 중심으로 공통 Design System과 5개 업무영역 레이아웃을 관리한다.

현재 메인 정보계층:

`운영 건전성 KPI 6종 → 5S 활동·고도화 성과 흐름 → 폐쇄루프 상세 운영상태 / 팀별 실행·Audit → 판정기준·추이`

운영 KPI 6종은 기존 `HD20KPIData.operational()`을 유일한 산식 Source로 사용한다.

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
- ④ 유지·Audit: Risk 랜덤 추출·Audit 실시·6개월 유지 중심
- ⑤ 개선조치: Deadline·BEFORE/AFTER·효과검증·재발 중심

Dashboard 전용 `#hd20DashboardPriority`, `#hd20OperationalBridge`, `.hd20DashboardSectionLabel`은 ②~⑤ 화면에서 표시하지 않는다.

## Runtime CSS 분리 완료상태
JS 모듈에서 대형 visual stylesheet를 생성하던 아래 경로는 표현 소유권을 canonical CSS로 이전했다.

- `final-layout-polish.js` stylesheet reinjection
- `kpi-modal-bootstrap.js`
- `table-enhance-suite.js`
- `expert-chatbot-final.js`
- `performance-conversion-analysis.js`
- `dashboard-operational-bridge.js`
- `activity-workflow.js`
- `beginner-navigation.js`

`.awScreen / .awHero / .awFlow / .awKpis / .awGrid / .awForm / .awPhoto / .awDrop / .awTable / .awStatus`는 이제 `hd20-five-area.css`가 소유한다. Navigation의 시각 규칙은 `hd20-overhaul.css + hd20-five-area.css`가 소유한다.

Repository code search 기준 남아 있는 `createElement('style')`은 `nav-scroll-stability.js`의 아래 1줄 functional rule뿐이다.

`html.hd20-nav-switching{scroll-behavior:auto!important}`

이 rule은 탭 전환 중 브라우저 scroll restoration으로 화면이 끌려 내려가는 것을 방지하기 위한 기능 안정화 규칙이며 테마·컴포넌트 디자인을 결정하지 않는다.

## 자동검증
`HD20 design layout smoke`는 Desktop `1440×1000`, Mobile `375×812`에서 5개 업무영역을 모두 확인한다.

검증내용:
- active tab
- horizontal overflow
- duplicate Area Header
- pageerror
- Dashboard KPI 6종 존재·명칭
- Dashboard 전용 UI의 ②~⑤ 유출 여부

Phase 3에서 검출된 Mobile `③ 고도화·판정`의 `718 > 375` overflow는 실제 결함으로 기록 후 container min-width 및 table 내부 scrolling으로 수정했다.

## 현재 다음 구조정리
대형 runtime visual CSS의 퇴역이 완료되었으므로 다음 단계는 추가 stylesheet를 만드는 것이 아니라 기존 canonical CSS 내부의 중복 selector와 `!important` 사용량을 줄이는 방향으로 진행한다.

우선순위:
- `hd20-overhaul.css`와 `hd20-five-area.css`의 역할경계 명확화
- 같은 selector의 중복 정의 축소
- ②~⑤ 화면의 table/form 폭·밀도 미세조정
- modal 및 mobile bounding-box 회귀검증 강화
- 더 이상 main에서 로딩하지 않는 legacy theme/hotfix 파일의 안전한 퇴역 검토

상세 변경이력:
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE2.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE3.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE4.md`
- `DEVELOPMENT_LOG_20260902_DESIGN_SYSTEM_REBUILD_PHASE5.md`
