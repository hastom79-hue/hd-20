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

## 4. 통합 대시보드 최신 구조
2026-09-03부터 duplicate `approved-landing-v2` active runtime을 퇴역했다.

현재 단일 정보계층:

`운영 건전성 KPI 6종 → 5S 활동/고도화 성과 보조지표 5종 → 폐쇄루프 상세 운영상태 → 팀별 실행/Audit 유지관리 → 3대 판정기준/고도화 추이`

`approved-landing-v2.js`가 별도로 만들던 5개 성과 KPI, 6개 운영 KPI, 3대 기준, 수준 Map, 추이, Audit 관리대상 화면은 active runtime에서 제거하여 중복 대시보드를 해소했다.

Dashboard 탭 복귀는 `#hd20DashboardPriority`를 canonical target으로 사용하며 `.cards`를 fallback으로 사용한다.

## 5. 고도화·판정
고도화 조건은 다음 3개다.

1. 시각화·형적관리
2. 인간공학적 Green Zone
3. 정량축소·정위치 변경을 통한 공간 활용

조건 충족수는 정확 1/2/3개로 분석하며 공식판정과 분리한다. 공식판정은 생산혁신팀 + 5S 모듈의 실제 `확정 / 보완요청 / 미확정` 값을 사용한다.

라인은 명시된 구조화 필드만 사용하고 작업장명에서 임의 추정하지 않는다. 미입력은 `미분류/라인 매핑 필요`로 관리한다.

## 6. 유지·Audit
현재 운영 흐름:

`Risk 가중 랜덤 대상 추출 → Audit 실시(D-Day) → 실시일부터 달력 기준 +6개월 지속관리 → 개선요청/개선조치 → 효과검증·재발 → 종료평가 → 차기 Audit 판단 근거`

Risk 정책 미설정 시 균등 랜덤이며, Audit 표본수는 통합기준정보 설정값을 사용한다. 동일 Batch 내 중복 팀은 허용하지 않는다.

고정 M+1/M+3/M+6 Lifecycle은 사용하지 않는다.

## 7. 개선조치
등록일 기준 자동기한은 D+7~D+14 범위이며 실제 자동지정 일수는 운영정책 설정값을 사용한다. 정책 미설정 시 임의 기본값을 생성하지 않는다.

관리 흐름:

`BEFORE → 문제정의 → 담당팀/팀장 → 개선조치 → AFTER → 효과검증 → 재발관리`

Audit에서 생성된 개선조치는 원본 `sourceCaseId / auditDrawId / sourceStage`를 보존한다.

## 8. Design System
공통 표현은 `hd20-overhaul.css`와 `hd20-five-area.css`의 canonical layer를 사용한다.

- JS runtime `<style>` 삽입 제거 진행 완료: KPI modal / Table Enhancement / Expert AI
- 구형 `*-fix.css`, `*-hotfix.css`, 다중 polish layer를 active chain에서 정리
- ②~⑤ 화면: `업무영역 Header → Workflow/상태 → Form/Grid`
- Modal/Table/AI의 공통 시각규칙을 Design System으로 통합
- Mobile/PC responsive 회귀검증 운영

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

## 10. 2026-09-03 핵심 변경
- duplicate `approved-landing-v2.css/js` active reference 제거
- Dashboard 탭 복귀 target을 canonical priority layer로 전환
- Operational Bridge를 `.cards` 기준으로 고정
- 단일 Dashboard information hierarchy 확립
- 전용 Dashboard Canonical Smoke 추가
- 상세 개발일지: `DEVELOPMENT_LOG_20260903_DASHBOARD_CANONICALIZATION.md`
