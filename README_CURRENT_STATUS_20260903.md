# HD-20 Current Status — 2026-09-03

이 문서는 2026-09-03 기준 HD-20 전면개편의 최신 상태를 요약한다. 세부 업무기준은 `README_OVERHAUL_20260902.md`, 이전 상태는 `README_CURRENT_STATUS_20260902.md`, 상세 변경이력은 `DEVELOPMENT_LOG_20260902*.md` 및 `DEVELOPMENT_LOG_20260903*.md`를 참조한다.

## 1. 현재 5영역 IA
1. 통합 대시보드
2. 5S 활동
3. 고도화·판정
4. 유지·Audit
5. 개선조치

`통합기준정보`는 상단 Utility, `HDPS · 5S Expert AI`는 공통 지원기능이다.

## 2. Canonical Data
- 5S/고도화: `hd20GMES5SAutoImproveRawV1`
- 개선조치: `hd20ActionCasesV2`
- Audit 추출/실시/종료평가: `hd20AuditRandomDrawsV1`
- 운영정책: `hd20OperatingPolicyV1`
- Audit 점검항목 Master: `hd20AuditChecklistV1`
- 생산팀 Master: `window.HD20ProductionTeamMaster`
- 생산팀장/이메일: `hd20TeamLeaderMasterV1`

## 3. 운영 KPI 6종
`dashboard-priority-layout.js`는 `HD20KPIData.operational()`을 Source로 사용한다.

1. 공식 판정 완료율
2. 평균 판정 Lead Time
3. 고도화 수준
4. Audit 후 6개월 유지율
5. Audit 부적합 재발률
6. 기한 내 개선조치 완료율

실제 산출 데이터가 없으면 `—`로 표시한다. 임의 목표, 임의 등급, 임의 경고 Threshold는 사용하지 않는다.

2026-09-03 UI 재정렬 이후 6개 KPI는 산식 변경 없이 업무영역으로 묶는다.

- STEP 03 고도화·판정: 공식 판정 완료율 / 평균 판정 Lead Time / 고도화 수준
- STEP 04 유지·Audit: Audit 후 6개월 유지율 / Audit 부적합 재발률
- STEP 05 개선조치: 기한 내 개선조치 완료율

각 그룹은 해당 업무 탭으로 직접 이동하며 상단 읽기 순서는 `현재 상태 → 판단 → 다음 행동`이다.

## 4. 통합 대시보드 최신 구조
2026-09-03부터 duplicate `approved-landing-v2` active runtime을 퇴역했다.

현재 단일 정보계층:

`운영 건전성 KPI 6종(업무영역 그룹) → 5S 활동/고도화 성과 보조지표 5종 → 폐쇄루프 상세 운영상태 → 팀별 실행/Audit 유지관리 → 3대 판정기준/고도화 추이`

구형 `approved-landing-v2.js/css`는 active runtime 제거 후 저장소에서도 삭제했다. 과거 승인형 대시보드가 별도로 만들던 5개 성과 KPI, 6개 운영 KPI, 3대 기준, 수준 Map, 추이, Audit 관리대상 화면은 더 이상 실행경로에 존재하지 않는다.

Dashboard 탭 복귀는 `#hd20DashboardPriority`를 canonical target으로 사용하며 `.cards`를 fallback으로 사용한다.

## 5. 고도화·판정
고도화 조건은 다음 3개다.

1. 시각화·형적관리
2. 인간공학적 Green Zone
3. 정량축소·정위치 변경을 통한 공간 활용

조건 충족수는 정확 1/2/3개로 분석하며 공식판정과 분리한다. 공식판정은 생산혁신팀 + 5S 모듈의 실제 `확정 / 보완요청 / 미확정` 값을 사용한다.

현재 화면은 `고도화 3대 조건 → 후보/공식판정 → 운영상태 → 조건 충족 × 적용범위` 순서로 읽히도록 재정리했다. 후보/공식판정 Header에는 `조건 충족수 ≠ 공식판정`을 명시하고, 조건 충족수 열과 공식판정 열을 시각적으로 분리했다.

`조건 충족 × 적용범위`는 별도 2차 분석영역으로 두고 라인/작업장/생산팀/후보/공식확정/3개 모두 충족/최근일을 함께 확인한다. 라인은 명시된 구조화 필드만 사용하고 작업장명에서 임의 추정하지 않는다. 미입력은 `미분류/라인 매핑 필요`로 관리한다.

## 6. 유지·Audit
현재 운영 흐름:

`Risk 가중 랜덤 대상 추출 → Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 개선요청/개선조치 → 효과검증·재발 → 종료평가 → 차기 Audit 판단 근거`

화면 상단은 실제 Audit 상태를 `Audit 실시 대기 → 6개월 관리중 → 종료평가 대기 → 종료평가 완료` 4단계로 표시한다. `6개월 관리중`은 실제 `auditDate`부터 달력 기준 +6개월이며, 기간이 끝난 뒤 `finalEvaluation`이 없으면 종료평가 대기로 분류한다. 이 표현은 기존 `renderAudit()` 계산을 그대로 사용하며 산식은 변경하지 않았다.

Risk 정책 미설정 시 균등 랜덤이며, Audit 표본수는 통합기준정보 설정값을 사용한다. 동일 Batch 내 중복 팀은 허용하지 않는다.

고정 M+1/M+3/M+6 Lifecycle은 사용하지 않으며, 임의 일/주/월 점검주기도 추가하지 않는다.

## 7. 개선조치
등록일 기준 자동기한은 D+7~D+14 범위이며 실제 자동지정 일수는 운영정책 설정값을 사용한다. 정책 미설정 시 임의 기본값을 생성하지 않는다.

관리 흐름:

`BEFORE → 문제정의 → 담당팀/팀장 → 개선조치 → AFTER → 효과검증 → 재발관리`

현재 화면은 이 폐쇄루프를 상단에 명시하고 `전체 요청 / 완료 / 진행중 / 기한경과 → Case 생성 → 기한·상태 관리 → AFTER·효과확인` 순서로 읽히도록 재정리했다. Desktop에서는 Case 현황을 신규 등록보다 넓게 배치하고, 회신/AFTER Evidence는 완료 단계로 별도 구분한다.

Audit에서 생성된 개선조치는 원본 `sourceCaseId / auditDrawId / sourceStage`를 보존한다. `hd20ActionCasesV2`와 기존 자동기한·메일·Outlook·자동발송 기능은 변경하지 않았다.

## 8. Design System
공통 표현은 `hd20-overhaul.css`와 `hd20-five-area.css`의 canonical layer를 사용한다.

현재 스타일 책임은 다음처럼 정리했다.

`styles.css = structural baseline`

`hd20-overhaul.css = global canonical Design System`

`hd20-five-area.css = 5-area workflow-specific layout`

`dashboard-priority-groups.css = Dashboard 업무영역 그룹 specialization`

`workflow-area-density.css = ②~⑤ 업무화면 밀도/반응형 및 ③ 판정·④ Audit·⑤ 개선조치 계층 specialization`

`maturity-condition-analysis.css = advancement analysis specialization`

- `styles.css`에 남아 있던 큰 폰트, 구형 card visual theme, 고정 폭 중심 grid, 중복 hover/animation을 제거하고 구조용 baseline으로 축소했다.
- JS runtime `<style>` 삽입 제거 완료: KPI modal / Table Enhancement / Expert AI / Workflow foundation.
- 구형 `*-fix.css`, `*-hotfix.css`, 다중 polish layer를 active chain에서 정리했다.
- ②~⑤ 화면은 `업무영역 Header → Workflow/상태 → Form/Grid` 공통 구조를 사용한다.
- ② 5S 활동은 입력 Form보다 실적/이력 영역을 넓게 배치하고 Desktop에서 등록 Form을 sticky 보조영역으로 운영한다.
- ③ 고도화·판정은 후보/공식판정 Table을 운영상태보다 우선 배치하고, 조건 충족과 공식판정을 명시적으로 분리한다.
- ④ 유지·Audit은 `대상 추출 → D-Day 실시 → +6개월 지속관리 → 종료평가` 흐름과 실제 4개 운영상태를 한 방향으로 읽도록 정리했다.
- ⑤ 개선조치는 Case 생성/현황/회신을 분리하고 BEFORE→AFTER 폐쇄루프를 화면 상단 기준축으로 사용한다.
- Table이 전체 페이지 폭을 밀지 않도록 `.awBody` 내부 가로스크롤과 셀 wrapping을 적용했다.
- 최근 직접등록 목록은 제목 ellipsis + 날짜 고정열로 정리했다.
- `minmax(0,1fr)` 및 `min-width:0` 기반 responsive 구조를 확대해 중첩 grid의 horizontal overflow 위험을 낮췄다.
- Modal/Table/AI의 공통 시각규칙을 Design System으로 통합했다.
- 새 `*-fix.css`, `*-hotfix.css`, `*-polish.css`는 추가하지 않는다.

## 9. 자동 회귀검증
현재 주요 GitHub Actions:

- `runtime-smoke.yml`
- `browser-smoke.yml`
- `nav-scroll-smoke.yml`
- `design-layout-smoke.yml`
- `dashboard-canonical-smoke.yml`
- `package-source.yml`
- GitHub Pages build/deploy

`dashboard-canonical-smoke.yml`은 Desktop `1440×1000`, Mobile `375×812`에서 duplicate approved landing 0개, canonical priority 1개, 운영 KPI 6개, operational bridge 1개, 성과 KPI 5개, horizontal overflow/pageerror 없음을 검증한다.

`browser-smoke.yml`도 동일한 canonical dashboard 계약을 사용하도록 수정했다. 더 이상 `.hd20ApprovedLanding` 존재를 요구하지 않는다.

④ 유지·Audit 개편 이후 HEAD `031f068`에서 Runtime Smoke와 Package Source가 success로 확인되었다. ⑤ 개선조치 계층 개편은 commit `0d53b86`에 반영했으며 후속 자동검증 대상이다.

## 10. 2026-09-03 핵심 변경
- duplicate `approved-landing-v2.css/js` active reference 제거
- `approved-landing-v2.js/css` 파일 자체 삭제
- Browser Smoke를 canonical dashboard 계약으로 전환
- Dashboard 탭 복귀 target을 canonical priority layer로 전환
- Operational Bridge를 `.cards` 기준으로 고정
- 단일 Dashboard information hierarchy 확립
- 운영 KPI 6종을 고도화·판정 / 유지·Audit / 개선조치 업무영역으로 재그룹화
- KPI 그룹별 해당 업무화면 직접 이동 추가
- ②~⑤ 업무화면의 입력/현황/Table 정보밀도 재정렬
- 업무 Table 독립 overflow 및 셀 wrapping 안정화
- ③ 고도화·판정의 조건 충족 / 공식판정 / 운영상태 / 적용범위 시각계층 재정렬
- ④ 유지·Audit의 D-Day / 달력 +6개월 / 종료평가 상태 시각계층 재정렬
- ⑤ 개선조치의 BEFORE/문제정의/담당/조치/AFTER/효과확인 폐쇄루프 시각계층 재정렬
- `styles.css`를 legacy visual layer에서 structural foundation으로 축소
- 전용 Dashboard Canonical Smoke 추가
- 상세 개발일지: `DEVELOPMENT_LOG_20260903_DASHBOARD_CANONICALIZATION.md`
- 상세 개발일지: `DEVELOPMENT_LOG_20260903_BASELINE_CSS_CONSOLIDATION.md`
- 상세 개발일지: `DEVELOPMENT_LOG_20260903_CANONICAL_DASHBOARD_CLEANUP.md`
- 상세 개발일지: `DEVELOPMENT_LOG_20260903_DASHBOARD_PRIORITY_GROUPING.md`
- 상세 개발일지: `DEVELOPMENT_LOG_20260903_WORKFLOW_AREA_DENSITY.md`
