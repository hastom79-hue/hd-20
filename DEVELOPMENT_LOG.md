# HD-20 5S 활동관리 시스템 — 개발일지

> 목적: 반복 수정 과정에서 요구사항·구현·검증 이력이 유실되지 않도록 현재 운영본의 개발 기준과 승인된 UI/UX 원칙 및 변경 이력을 기록한다.
> 기준일: 2026-08-27
> 운영 저장소: `hastom79-hue/hd-20`

## 1. 프로젝트 목적
울산캠퍼스의 5S 활동을 단순 실적 집계가 아니라 **개선활동 → 고도화 후보 → 고도화 작업장 인정 → 1/3/6개월 Audit → 문제점 개선조치 → 수평전개**까지 하나의 흐름으로 관리하는 웹 기반 Prototype을 구축한다.

## 2. 최종 화면/업무 원칙
### 대시보드 정보 위계
1. 핵심 성과 및 운영현황
2. 고도화 작업장 3대 인정기준 및 인정·유지 프로세스
3. 세부 성과 KPI와 Trend
4. Portfolio Map 및 고도화 작업장 추이
5. 상세 Raw Data

**먼저 보여줄 정보는 상단, 상세/Raw Data는 하단**에 배치한다. 승인된 첫 페이지의 정보·수치·업무구조는 개별 디자인/기능 추가 시 임의 변경하지 않는다.

### 정보 LOCK / 디자인 분리 원칙
외부 또는 참고 Dashboard 이미지는 **디자인 언어만 참고**한다. 기존 5S 시스템의 KPI, 명칭, 수치, 인정기준, 프로세스, 데이터 의미를 다른 시스템 정보와 혼합하지 않는다.

허용되는 변경 예: Dark Navy 배경, Glass/Glow 카드, Neon Accent, 숫자 강조, Hover/Click/Ripple, Mini Chart/Sparkline, Trend Badge, 카드 깊이감.

금지되는 변경 예: 다른 과제관리 KPI를 5S KPI와 혼합, 승인된 KPI 명칭 변경, 임의 수치 생성, 업무 프로세스 변경.

## 3. 고도화 작업장 관리기준
### 3대 인정기준
- 시각화·형적관리
- 인간공학적 Green Zone
- 정량축소·정위치 변경을 통한 공간 활용

3개 기준을 모두 충족해야 고도화 작업장으로 인정하는 구조를 기본으로 한다.

### 인정·유지 프로세스
`후보 발굴 → 고도화 인정 → 1개월 점검 → 3개월 AUDIT → 6개월 AUDIT → 수평전개`

단순 5S 활동점수만으로 고도화 작업장을 판단하지 않는다. 실제 후보·인정·유지·Audit Life-cycle을 기준으로 관리한다.

## 4. 대시보드 KPI 및 Trend 표현
상단 핵심 KPI는 인당 5S 개선활동, 고도화 후보 발굴, 고도화 작업장 신규 확보, 누적 고도화 작업장 확보, 현재 유지 작업장을 유지한다.

실제 운영화 단계에서는 고정 샘플값을 사용하지 않고 각 KPI의 Canonical Source에서 계산한다. Trend 값 역시 실제 데이터 Source가 없는 상태에서 임의 운영수치로 확정하지 않는다.

## 5. Drill-down / 상세 Grid 원칙
요약 KPI, 상단 5개 KPI, 하단 성과 KPI, Portfolio Map, 월별 추이, Audit 요약 등 집계정보는 클릭 시 본문을 밀어내지 않고 **Modal Popup 형태의 상세 Grid**를 표시한다.

Modal은 페이지 로딩 시 사용할 수 있도록 선제 준비하고 닫기 버튼, 배경 클릭, ESC 닫기를 지원한다. 집계 숫자와 상세 Grid 행수는 동일 Canonical Source 기준으로 검증한다.

## 6. 주요 구현 기능
- 5S 활동 신규등록/조회/수정/삭제, 사용자 소속팀 자동 지정, Excel/Raw Data
- 고도화 후보/인정/신규/누적/유지, Portfolio Map, 월별 추이, 상세 Grid
- Audit 1~5점 평가, 자동판정, 1/3/6개월 유지관리, Admin/Excel, Drill-down
- 문제점·개선조치, BEFORE/AFTER, 생산팀장 이메일 Workflow, 상태/조치 이력
- 생산팀장 이름/이메일 Excel 일괄등록

## 7. 시스템 운영관리 AI 챗봇
5S 시스템 운영관리 전문가 역할을 기본으로 하며 사용방법, Q&A, 운영점검, KPI 이상, Audit 기한, 미조치, Master 누락 및 오류 접수/이력을 지원한다. Prototype의 브라우저 LocalStorage를 실제 중앙 DB/API 감시로 표현하지 않는다.

## 8. 디자인 승인 방향
Deep Navy/Indigo, Glass/Glow, KPI Accent, Hover/Click Feedback 등 디자인 효과는 적용할 수 있으나 **정보·수치·업무 의미는 LOCK**한다. 승인된 첫 화면을 기능 추가 과정에서 임의 재설계하거나 숨기지 않는다.

## 9. 주요 회귀문제와 대응
- 승인 Dashboard DOM 이동/숨김으로 Portfolio/추이/Raw Data가 사라지는 회귀 금지
- Modal 생성 순서로 Drill-down이 먹지 않는 회귀 방지
- 반복 `setInterval`, 무제한 `MutationObserver` 등 화면 떨림/중복 렌더링 원인 제거
- Commit 성공만으로 완료 판단하지 않고 main 재조회 및 실제 코드 존재/로딩을 검증

## 10. 운영 파일 관리 원칙
현재 `index.html`이 로드하거나 다른 운영 기능이 의존하는 파일은 운영파일로 간주한다. 파일명만 보고 삭제하지 않는다. 구형 파일 정리 전 참조관계를 확인한다.

## 11. 데이터 관련 원칙
- 운영 KPI와 상세 Grid는 동일 Canonical Source를 사용한다.
- 고도화 공식확정/Lifecycle 원천: `hd20GMES5SAutoImproveRawV1`
- 개선조치 Canonical Store: `hd20ActionCasesV2`
- Demo/Seed 데이터는 운영 KPI, Lead Time, Grid 집계에 자동 주입하지 않는다.
- 실제 근거 없는 수치/Trend를 운영값으로 만들지 않는다.

## 12. 개발일지 기록 규칙
**2026-08-27 이후 모든 작업은 기능 수정과 동시에 본 파일에 누적 기록한다.** 단순 설명이 아니라 요구사항, 변경 파일, 구현 내용, 검증, Commit, 잔여사항을 남긴다.

```text
### YYYY-MM-DD HH:MM KST / 변경 제목
- 요구사항:
- 변경 파일:
- 구현 내용:
- 실행/검증:
- GitHub Commit:
- 잔여사항:
```

---

# Change Log

## 2026-08-26
### 대시보드 구조 및 Drill-down 안정화
- 승인 Dashboard 정보 위계 확정
- Portfolio Map/월별 추이/Raw Data 복원
- KPI/Map/추이 클릭 상세 Modal Grid 원칙 확정
- Raw Data CSV 추출 연결 및 업무 메뉴 Routing 보강

### Audit 및 개선조치 Workflow 보강
- Audit 1~5점 클릭 평가 및 자동판정
- Audit Excel/Admin 관리 기능 보강
- 문제점 → 생산팀장 메일 → 조치 → AFTER 사진 흐름 구현
- 생산팀장 이름/메일 Excel 일괄등록 기능 반영

### 시스템 운영관리 AI 챗봇 고도화
- 주요 Q&A / 오류접수 / 오류이력 UI
- 일일 운영점검, KPI 이상, Audit 기한, 미조치, Master 이상 점검 가이드

### GitHub 배포 검증 강화
- `수정 → Commit → main 재조회 → index 로딩 확인 → 변경 코드 확인 → 실제 화면 확인` 원칙 확정

## 2026-08-27
### 승인 첫 화면 복원 및 실제 Lifecycle Source 연결
- 요구사항: 승인된 첫 Dashboard 화면을 유지하면서 임의 샘플값과 반복 렌더링을 제거하고 실제 원천에 연결
- 변경 파일: `approved-landing-v2.js`
- 구현 내용:
  - 공식확정 원천 `hd20GMES5SAutoImproveRawV1` 연결
  - `confirmed === true`, `judgeState === '확정'`, `judgedAt` 기준 최근 공식확정 표시
  - `HD20MaturityFollowup.summary()`를 통한 3개월 AUDIT 기한임박 연결
  - 임의 최근 작업장/Level/Audit 샘플값 제거
  - 80ms 반복 `setInterval` 제거, 최초 실행 + 1회 `requestAnimationFrame` 재시도 구조 적용
- 실행/검증: `main` 재조회로 변경 코드 존재 확인
- GitHub Commit: `c8e1d469658ae7dc805f1805331f77096f513737`
- 잔여사항: 후보/신규/인당 개선활동 KPI Canonical Source 연결 및 Popup Grid 정합성 검증

### 개선조치 Demo Seed 운영 자동주입 차단
- 요구사항: 시연용 개선조치가 실제 KPI/Lead Time/Grid 통계를 왜곡하지 않도록 차단
- 변경 파일: `action-demo-seed.js`
- 구현 내용: `hd20ActionCasesV2`에 Demo 8건 자동생성하던 동작 제거, 기존 실제 데이터 보존
- 실행/검증: `main` 재조회 확인
- GitHub Commit: `af4e0abb53bf9eb4dc96a892623a675993e2342e`
- 잔여사항: 기존 브라우저에 과거 Seed가 이미 저장된 경우 실제/시연 구분 정책 추가 검토

### 개선요청 저장 원천 단일화 및 Polling 제거
- 요구사항: 개선조치 저장소 분리 문제와 반복 Observer/Polling 제거
- 변경 파일: `action-button-hotfix.js`
- 구현 내용:
  - 신규 개선요청 저장키를 `hd20ActionCasesV2`로 단일화
  - `startDate`, `targetDate` 기록
  - 100ms `setInterval` 및 무제한 `MutationObserver` 제거
  - 최초 연결/화면 진입 시 1회 연결 방식 적용
- 실행/검증: `main` 재조회 확인
- GitHub Commit: `b7d55e252c199e08f64d313984088f5daee42b10`
- 잔여사항: 완료 Workflow의 `doneDate`와 Lead Time 비교 Grid 연계 검증

### 개선조치 예상/실제 해결 Lead Time Grid
- 요구사항: 예상 해결 Lead Time과 실제 해결 Lead Time을 비교하고 계획대비 상태 표시
- 변경 파일: `action-leadtime-grid.js`, `index.html`
- 구현 내용:
  - 착수일 = `startDate || date`
  - 목표예정일 = `targetDate || due`
  - 실제완료일 = `doneDate || completedDate || finishDate`
  - 예상 LT = 목표예정일 − 착수일
  - 실제 LT = 실제완료일 − 착수일
  - 계획대비 = 실제 LT − 예상 LT
  - 판정 = 단축 / 계획준수 / 지연 / 진행중
- 실행/검증: 파일이 `main`에 존재하며 `index.html`에서 로딩됨을 재확인
- GitHub Commit: 기존 반영본 확인
- 잔여사항: 완료메일 Workflow에서 `doneDate` 저장 경로의 end-to-end 검증

### 원본 Dashboard 고정 Audit/Lifecycle 수치 실제 데이터 치환
- 요구사항: 원본 Dashboard에 남은 누적/유지/Audit/판정대기 고정 수치를 실제 데이터로 치환
- 변경 파일: `dashboard-live-kpi.js`, `index.html`
- 구현 내용:
  - 누적 고도화 작업장 = 공식확정 행수
  - 현재 유지 작업장 = 공식확정 중 해제/무효 제외
  - 1/3/6개월 대상 = `HD20MaturityFollowup.summary()`
  - 판정대기 = 공식확정 전 원천 행수
  - 초기 HTML의 기존 고정값은 0으로 중립화하고 로딩 후 실제 원천으로 치환
- 실행/검증: `dashboard-live-kpi.js` main 재조회 및 `index.html` 로딩 연결 확인
- GitHub Commit: `39ef32e9258eab2f6a3d70407bf1330d3138aacc`, `6e3bfb0cdddf0995507bd144f77a44db1b51fdc7`
- 잔여사항: 인당 5S 개선활동 / 고도화 후보 발굴 / 신규 확보 3개 KPI의 실제 원천 연결, KPI 숫자와 Popup Grid 행수 1:1 검증

### 업무일지 상시 기록 의무화
- 요구사항: 현재부터 진행하는 모든 작업 내용을 GitHub README 성격의 개발일지에 반드시 기록
- 변경 파일: `DEVELOPMENT_LOG.md`
- 구현 내용: 2026-08-27 작업내역 복원 기록 및 이후 모든 변경에 대해 요구사항/변경파일/구현/검증/Commit/잔여사항을 누적하도록 규칙 고정
- 실행/검증: 본 파일 `main` 재조회 예정
- GitHub Commit: 본 변경 Commit
- 잔여사항: 이후 모든 기능 변경 Commit 직후 본 개발일지 동시 갱신
