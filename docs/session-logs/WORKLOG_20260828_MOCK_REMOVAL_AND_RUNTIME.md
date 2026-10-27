# HD-20 업무일지 — Mock 제거 / Canonical 데이터 / Runtime 안정화

- 작업일시: 2026-08-28 KST
- 저장소: `hastom79-hue/hd-20`
- 적용 기준: 승인된 첫 화면 시안 2 유지, 실제 원천 없는 운영수치 생성 금지, `수정 → Runtime Smoke → Package/배포 확인` 순서 준수

## 1. 5S 활동·고도화·Audit 화면의 Mock 제거

### 발견 사항
기존 `activity-workflow.js` 한 파일에서 아래 시연값이 활동/고도화/Audit/개선조치 화면을 동시에 생성하고 있었다.

- 활동 샘플 4건
- 활동 KPI 87 / 73 / 14 / 5
- 고도화 후보 14건 / 신규확보 5곳
- 고도화 작업장 샘플 3건
- 유지상태 20 / 2 / 2 / 1
- Audit 6 / 9 / 7 / 4
- Audit 샘플 점수 95 / 88 / 72
- 개선조치 KPI 8 / 3 / 21 / 72%
- 개선조치 샘플 행 및 가상 담당자
- `샘플 등록 완료` 안내 로직

### 1차 교체 및 자동검증 실패
- 변경 파일: `activity-workflow.js`
- Commit: `298c52df6c70703b971bcfc6dc91eb5afa860fd1`
- 결과: Runtime Smoke 실패
- 원인: 신규 Canonical 렌더링 코드의 `.sort(...)` 구문에서 닫힘 괄호 누락
- 조치: 실패를 완료 처리하지 않고 GitHub Actions 로그에서 정확한 구문 위치 확인 후 즉시 수정

### 정상 교체
- 변경 파일: `activity-workflow.js`
- Commit: `cb90a8a67c75e9e45d4de131f65d717fb44589f1`
- 구현:
  - 활동 현황/상세행 → `HD20KPIData.snapshot()` 사용
  - 고도화 후보/신규/유지 → 동일 Canonical KPI Source 사용
  - Audit 일정 → `HD20MaturityFollowup.summary()` 사용
  - 완료 Audit 점수 Source가 없으면 점수는 `—`로 표시
  - 5S 신규등록 → `hd20GMES5SAutoImproveRawV1` 저장
  - 고도화 후보 추천 시 `판정대기`로 저장
  - 샘플 행/샘플 KPI/샘플 완료 안내 전부 제거
- 검증: Runtime Smoke **SUCCESS** (`run 33106035945`)

## 2. Audit 기본점수 자동주입 제거

### 기존 문제
`audit-global-seed.js`가 40개 점검항목뿐 아니라 3~5점의 점수, 적합/조건부/부적합 결과, 미흡사항 문구까지 자동주입하고 있었다. 비어 있는 운영 화면도 Audit 실적이 존재하는 것처럼 보일 수 있었다.

### 수정 1 — 점검항목 Master와 실적 분리
- 변경 파일: `audit-global-seed.js`
- Commit: `f5c97e3b73696989fe086859887007d5470a7d23`
- 구현:
  - 40개 점검항목은 기준정보로 유지
  - 초기 점수 `0`, 판정 `N/A`, 미흡사항 공란
  - `자주보전` → `위험구역관리`, `고도화` → `5S 고도화` 기준 통일
  - 기존 브라우저 데이터가 과거 자동 Seed의 정확한 패턴과 일치하는 경우에만 1회 안전 마이그레이션
  - 사용자가 입력한 임의 Audit 데이터는 일괄삭제하지 않음

### 수정 2 — 신규 Audit 행의 자동 적합 방지
- 변경 파일: `audit-checklist-enhance.js`
- Commit: `6e1f351695ec0cfad41ed395617b002f7e904f7a`
- 구현:
  - 신규 항목 기본 점수 5점 → 0점/N/A
  - 사용자가 1~5 평가를 클릭한 경우에만 실적 판정
  - Excel에 점수가 없으면 0/N/A
  - 상단 요약은 평가완료 건수, 점수 합계, 미흡/조건부 건수로 표시

## 3. Audit 상세 Drill-down 샘플 24건 제거

### 기존 문제
`audit-summary-drilldown.js`에 6개월/3개월/1개월/대기·조치 총 24건의 작업장, 날짜, 점수, 담당자, 상태가 코드로 고정돼 있었다.

### 수정
- 변경 파일: `audit-summary-drilldown.js`
- Commit: `15b7bd481d990d51b4c195153569c7efb84b5fdf`
- 구현:
  - 하드코딩 샘플 배열 전부 제거
  - `HD20MaturityFollowup.summary().flat`만 사용
  - 예정 / 기한임박 / 경과 / 전체 Lifecycle 필터
  - 1개월 / 3개월 / 6개월 상세 Grid
  - Grid와 CSV가 동일 Lifecycle 행 사용
  - 실제 근거가 없는 Audit 평균점수/담당자 표시 제거
  - 무제한 `MutationObserver` 제거, 초기 bounded retry + 데이터 이벤트 갱신으로 변경

## 4. 개선조치 가상 현장사진 제거

### 기존 문제
`action-field-photo-gallery.js`가 특정 Demo 개선조치 ID에 Wikimedia Commons 공장사진을 매핑해 실제 현장 Evidence처럼 표시하고 있었다.

### 수정
- 변경 파일: `action-field-photo-gallery.js`
- Commit: `dc7cb6d7da7057fd0956d656ee9426b1e5984ce9`
- 구현:
  - 외부 Stock/Wikimedia 사진 매핑 전부 제거
  - `hd20ActionCasesV2`에 사용자가 실제 첨부한 `before / evidence / after / afterEvidence`만 표시
  - 첨부가 없으면 `첨부 없음`
  - 무제한 DOM Observer 제거

## 5. 생산팀장 가상 이메일 안전차단

### 발견 사항
`action-mail-workflow.js` 내부 fallback에 `팀장A~P`, `teamlead1@example.com~teamlead16@example.com`이 존재했다.

### 안전조치
- 신규 파일: `team-master-safety.js`
- Commit: `00f95b24211264b66d49e056285db78d309c99b9`
- 구현:
  - `hd20TeamLeaderMasterV1`이 없으면 실제 생산팀명 + `미지정` + 공란 이메일로 초기화
  - 과거 `teamleadN@example.com` 형식만 선별하여 공란으로 안전 마이그레이션
  - 실제 입력된 팀장명/실제 이메일은 보존
- 로딩: `action-mail-workflow.js`보다 먼저 실행하도록 `index.html`에서 순서 고정

## 6. Legacy 첫 화면 고정수치 중립화 및 로딩 순서 정리

### 수정
- 변경 파일: `index.html`
- Commit: `3b8f2347e246f9c45441eaf0b90852f52ccd0efb`
- 구현:
  - Legacy HTML의 2.36 / 14 / 5 / 24 / 20 초기 운영값 제거 또는 0/— 중립화
  - Audit 9/7/4, Action Summary 3/4/3/2 초기 고정수치 제거
  - 실제 렌더링 전 순간적으로 과거 샘플값이 보이는 Flash 방지
  - `dashboard-kpi-source.js`와 `maturity-seq-action-link.js`를 승인 시안/업무화면보다 먼저 로드
  - 변경된 JS들의 cache-busting version 갱신
  - `team-master-safety.js`를 `action-mail-workflow.js` 앞에 배치
  - `maturity-seq-action-link.js` 중복 후반 로딩 제거

### 최종 자동검증
- 최종 HEAD: `3b8f2347e246f9c45441eaf0b90852f52ccd0efb`
- Runtime Smoke run: `33106734639`
- 결과: **SUCCESS**
- Runtime Smoke 검증범위:
  - 전체 JavaScript `node --check`
  - `index.html` 로컬 script 파일 존재 검증
  - 승인 시안 2 CSS/JS Boot Path
  - 7개 메뉴 Navigation Contract
  - Canonical KPI Wiring
  - Lifecycle API Wiring

## 7. 현재 잔여 검증/정리 순서

1. `action-mail-workflow.js` 내부의 가상 fallback 정의 자체를 제거하거나, 현재 Safety Master 방식으로 완전히 비활성임을 재검증
2. 나머지 활성 Script의 Demo/Mock/고정 운영수치 전수검사
3. 승인 시안 2의 KPI 숫자 ↔ Popup Grid 행수 1:1 검증
4. Audit 완료결과의 실제 점수/판정 저장 Source와 Lifecycle 일정 Source의 역할 분리 검증
5. 첫 화면 → 활동 → 고도화 → Audit → 개선조치 → 기준정보 메뉴 전체 회귀검증
6. 최종 Package 및 GitHub Pages 배포 상태 확인

> 원칙: 이후에도 Mock 제거 중 오류가 발견되면 실패 이력까지 업무일지에 남기고, Runtime Smoke가 성공하기 전에는 완료로 보고하지 않는다.
