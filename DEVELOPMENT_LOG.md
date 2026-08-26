# HD-20 5S 활동관리 시스템 — 개발일지

> 목적: 반복 수정 과정에서 요구사항·구현·검증 이력이 유실되지 않도록 현재 운영본의 개발 기준을 기록한다.
> 기준일: 2026-08-26
> 운영 저장소: `hastom79-hue/hd-20`

## 1. 프로젝트 목적
울산캠퍼스의 5S 활동을 단순 실적 집계가 아니라 **개선활동 → 고도화 후보 → 고도화 작업장 인정 → 1/3/6개월 Audit → 문제점 개선조치 → 수평전개**까지 하나의 흐름으로 관리하는 웹 기반 Prototype을 구축한다.

## 2. 최종 화면/업무 원칙
### 대시보드 정보 위계
1. 고도화 작업장 3대 인정기준 및 인정·유지 프로세스
2. 핵심 성과 KPI
3. Portfolio Map 및 고도화 작업장 추이
4. 상세 Raw Data

성과·의사결정 정보는 상단에, 상세/Raw Data 성격의 정보는 하단에 배치한다. 승인된 첫 페이지 레이아웃은 개별 기능 추가 시 임의 변경하지 않는다.

### Drill-down 원칙
요약 KPI, Portfolio Map, 월별 추이, Audit 요약 등 집계정보는 클릭 시 본문을 밀어내지 않고 **Modal Popup 형태의 상세 Grid**를 표시한다. 상세 Grid에서는 가능한 경우 Raw Data CSV 추출을 제공한다.

## 3. 고도화 작업장 관리기준
### 3대 인정기준
- 시각화·형적관리
- 인간공학적 Green Zone
- 정량축소·정위치 변경을 통한 공간 활용

3개 기준을 모두 충족해야 고도화 작업장으로 인정하는 구조를 기본으로 한다.

### 인정·유지 프로세스
`후보 발굴 → 고도화 인정 → 1개월 점검 → 3개월 AUDIT → 6개월 AUDIT → 수평전개`

## 4. 주요 구현 기능
### 4.1 5S 활동관리
- 활동 신규등록/조회/수정/삭제
- 접속 사용자 소속팀 자동 지정 구조
- Excel/Raw Data 활용 및 추출 기능

### 4.2 고도화 작업장
- 후보 발굴 및 인정 현황
- 신규/누적/현재 유효 작업장 관리
- Portfolio Map
- 월별 확보 추이
- 작업장 상세 Grid 및 Raw Data

### 4.3 Audit
- 점검항목별 1~5점 클릭 평가
- 점수 기반 적합/조건부/부적합 자동판정
- 1개월/3개월/6개월 유지관리
- Admin 기준정보 및 Excel 점검표 매핑
- Audit 요약 Drill-down

### 4.4 문제점·개선조치
- 문제점 등록
- BEFORE 현장사진
- 생산팀장 이메일 연계
- 조치사항 등록
- AFTER 현장사진
- 상태/조치 이력 관리

### 4.5 생산팀장 정보
- 팀장 이름 및 이메일 Excel 일괄등록
- 개선조치 메일 Workflow와 연계

### 4.6 시스템 가이드 챗봇
역할은 범용 AI가 아니라 다음 두 가지에 집중한다.
- 시스템 사용방법 안내 및 주요 Q&A
- 시스템 오류 접수 및 오류 이력관리

주요 Q&A에는 활동등록, 고도화 기준, Audit 평가, Excel 업로드, 팀장 이메일, 상세 Grid, Raw Data 추출, 개선조치 Workflow 등을 포함한다.

현재 오류이력은 정적 GitHub Pages 환경 특성상 브라우저 LocalStorage 기반이며, 향후 사내 DB/API 연결 시 중앙 이력관리로 전환할 수 있다.

## 5. 주요 회귀문제와 대응
### 레이아웃 회귀
반복적인 기능 추가 과정에서 기존 대시보드 DOM을 숨기거나 이동시키면서 Portfolio/추이/Raw Data가 사라지는 문제가 발생했다. 이후 승인 레이아웃을 잠그고 필요한 기능만 복원하는 방향으로 변경했다.

### 클릭 기능 회귀
화면은 존재하지만 DOM 이동/숨김으로 Drill-down 이벤트 대상이 사라지는 문제가 있었다. `dashboard-regression-fix.js`, `final-requirements-guard.js` 등을 통해 KPI/Map/추이와 실제 업무 Screen의 연결을 보강했다.

### GitHub 반영 검증
커밋 성공 메시지만으로 배포 완료를 판단하지 않는다. 향후 변경은 다음 순서로 검증한다.

`수정 → GitHub Commit → main 브랜치 파일 재조회 → index.html 로딩 여부 확인 → 실제 변경 코드 존재 확인 → 완료 통보`

## 6. 운영 파일 관리 원칙
현재 저장소는 반복 개발 과정에서 Prototype/Hotfix/Guard 파일이 증가했다. 파일명에 `hotfix`, `fix`, `guard`가 포함됐다는 이유만으로 삭제하지 않는다. 현재 `index.html`이 로드하거나 다른 운영 기능이 의존하는 파일은 운영파일로 간주한다.

과거 Preview/구형 Dashboard 등 미사용 파일은 즉시 삭제하기보다 `/archive/legacy/`로 이동 후 일정 기간 보존하는 것을 원칙으로 한다. 정리 전 반드시 `index.html` 및 코드 참조 여부를 확인한다.

## 7. 현재 주요 운영 스크립트
- `app.js`
- `activity-workflow.js`
- `auto-user-team.js`
- `workflow-crud.js`
- `audit-admin-import.js`
- `audit-global-seed.js`
- `audit-checklist-enhance.js`
- `audit-summary-drilldown.js`
- `action-mail-workflow.js`
- `action-field-photo-gallery.js`
- `team-leader-excel-import.js`
- `integrated-performance-map.js`
- `final-preview-layout.js`
- `dashboard-regression-fix.js`
- `final-requirements-guard.js`
- `top-kpi-drilldown.js`
- `system-guide-chatbot.js`

※ 실제 운영 여부는 항상 최신 `index.html`의 script 로딩 상태를 최종 기준으로 판단한다.

## 8. 데이터 관련 주의사항
기존 Prototype에는 실제 생산현장 팀명을 반영한 데이터와 시연용/강제생성 데이터가 혼재한다. Headcount, 일부 작업장 실적, Audit/후보 데이터 등은 실제 시스템 Master 또는 DB 연결 시 교체가 필요하다. 시연 데이터와 실데이터를 혼동하지 않도록 운영 전 데이터 Source를 명시한다.

## 9. 향후 개발 시 금지사항
- 기능 하나를 추가하기 위해 승인된 첫 페이지 전체 레이아웃을 다시 설계하지 않는다.
- 요약정보 클릭 시 페이지 하단에 상세 Grid를 무작정 추가하지 않는다. Modal을 사용한다.
- 점수만으로 고도화 작업장 상태를 정의하지 않는다. 후보/인정/Audit 유지 프로세스를 기준으로 한다.
- 기존 기능을 삭제하거나 숨기기 전에 의존관계를 확인한다.
- GitHub Commit 생성만 확인하고 '배포 완료'라고 판단하지 않는다.

## 10. 개발일지 기록 규칙
향후 중요한 변경은 아래 형식으로 이 파일 하단에 누적 기록한다.

```text
### YYYY-MM-DD / 변경 제목
- 요구사항:
- 변경 파일:
- 구현 내용:
- 회귀검증:
- GitHub Commit:
- 잔여사항:
```

---

## Change Log

### 2026-08-26 / 대시보드 구조 및 Drill-down 안정화
- 승인된 대시보드 정보 위계 확정
- Portfolio Map/월별 추이/Raw Data 복원
- KPI 및 Map/추이 클릭 상세 Modal Grid 구현
- Raw Data CSV 추출 연결
- 업무 메뉴 Routing Guard 추가

### 2026-08-26 / Audit 및 개선조치 Workflow 보강
- Audit 1~5점 클릭 평가 및 자동판정
- Audit Excel/Admin 관리 기능 보강
- 문제점 → 생산팀장 메일 → 조치 → AFTER 사진 흐름 구현
- 생산팀장 이름/메일 Excel 일괄등록 기능 반영

### 2026-08-26 / 시스템 가이드 챗봇
- 시스템 사용 가이드 챗봇 추가
- 주요 Q&A 추가
- 오류 접수번호 및 LocalStorage 기반 오류이력 관리 추가

### 2026-08-26 / 저장소 정리 검토
- 운영파일과 과거 Preview/Legacy 파일 혼재 확인
- 운영 의존 파일은 유지
- 미사용 구형 파일은 삭제보다 `/archive/legacy/` 이동을 우선하는 원칙 수립
