# HD-20 5S 활동관리 시스템 — 개발일지

> 목적: 반복 수정 과정에서 요구사항·구현·검증 이력이 유실되지 않도록 현재 운영본의 개발 기준과 승인된 UI/UX 원칙을 기록한다.
> 기준일: 2026-08-26
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

금지되는 변경 예: GMES 과제관리 KPI를 5S KPI와 혼합, 승인된 KPI 명칭 변경, 임의 수치 생성, 업무 프로세스 변경.

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
상단 핵심 KPI는 다음 정보를 유지한다.
- 인당 5S 개선활동: 2.36건/인
- 고도화 후보 발굴: 14건
- 고도화 작업장 신규 확보: 5곳
- 누적 고도화 작업장 확보: 24곳
- 현재 유지 작업장: 20곳

각 KPI 카드는 단일 현재값만 보여주는 카드가 아니라 **값의 Trend 변화를 함께 표현**하는 방향으로 확정한다. 현재값 + 전월/전기 대비 증감(↑/↓, %, 건/곳) + Mini Sparkline/Trend Chart를 조합한다. 단, Trend 값은 실제 데이터 Source가 없는 상태에서 임의로 운영수치로 확정하지 않는다.

하단 성과 KPI 예시는 고도화 후보, 누적 확보, 현재 유효, 전환율(후보→유효), AUDIT 6개월 유지율, 기한임박(3개월 AUDIT)이며 각 카드도 Trend/전월대비와 상세 Grid 진입성을 강화한다.

## 5. Drill-down / 상세 Grid 원칙
요약 KPI, 상단 5개 KPI, 하단 성과 KPI, Portfolio Map, 월별 추이, Audit 요약 등 집계정보는 클릭 시 본문을 밀어내지 않고 **Modal Popup 형태의 상세 Grid**를 표시한다.

상단 5개 KPI도 모두 Clickable 대상으로 한다. Modal은 페이지 로딩 시 사용할 수 있도록 선제 준비하고, 다른 기능을 먼저 클릭해야 생성되는 의존구조를 만들지 않는다. 닫기 버튼, 배경 클릭, ESC 닫기를 지원하며 상세 Grid에서는 가능한 경우 Raw Data CSV 추출을 제공한다.

## 6. 주요 구현 기능
### 6.1 5S 활동관리
- 활동 신규등록/조회/수정/삭제
- 접속 사용자 소속팀 자동 지정 구조
- Excel/Raw Data 활용 및 추출 기능

### 6.2 고도화 작업장
- 후보 발굴 및 인정 현황
- 신규/누적/현재 유효 작업장 관리
- Portfolio Map
- 월별 확보 추이
- 작업장 상세 Grid 및 Raw Data

### 6.3 Audit
- 점검항목별 1~5점 사각형 클릭 평가
- 점수 기반 적합/조건부/부적합 자동판정
- 1개월/3개월/6개월 유지관리
- Admin 기준정보 및 Excel 점검표 매핑
- Audit 요약 Drill-down

### 6.4 문제점·개선조치
- 문제점 등록
- BEFORE 현장사진
- 생산팀장 이메일 연계
- 조치사항 등록
- AFTER 현장사진
- 상태/조치 이력 관리

### 6.5 생산팀장 정보
- 팀장 이름 및 이메일 Excel 일괄등록
- 개선조치 메일 Workflow와 연계

## 7. 시스템 운영관리 AI 챗봇
챗봇은 단순 범용 AI가 아니라 **5S 시스템 운영관리 전문가** 역할을 부여한다.

핵심 역할:
- 시스템 사용방법 가이드
- 주요 Q&A
- 일일 운영점검 가이드
- KPI 이상치 및 상태 점검 가이드
- 고도화 후보→인정 정체 건 확인
- 1/3/6개월 Audit 예정·기한임박 관리
- 조건부/부적합 미조치 확인
- 생산팀장 개선조치 회신 지연 확인
- 기준정보/Master 누락 및 데이터 이상 원인 확인
- 오류 접수 및 오류 이력관리

UI는 사용자가 제시한 GMES Help 형태를 참고해 **우측 하단 Floating Help 버튼 → 팝업 패널 → 주요 Q&A / 오류접수 / 오류이력** 구조를 기본으로 한다. 글자크기, 버튼, Accordion Q&A, Scroll, 입력창, 질문 버튼 등도 시스템 화면과 조화되는 수준으로 충분히 크게 구성한다.

현재 오류이력은 정적 GitHub Pages 환경 특성상 브라우저 LocalStorage 기반이다. 향후 사내 DB/API 연결 시 중앙 이력관리로 전환한다. Prototype 단계에서는 실제 서버/DB를 AI가 실시간 감시한다고 표현하지 않는다.

## 8. 디자인 승인 방향
### Dark Dashboard Design
참고 시안을 기반으로 다음 디자인 효과를 적용하는 방향을 승인한다.
- Deep Navy / Indigo 계열 Dashboard 배경
- Glassmorphism / 반투명 Panel
- Blue / Orange / Green / Purple KPI Accent
- 카드별 Glow와 Border Highlight
- KPI 숫자 대형화 및 시각적 계층 강화
- Icon Tile 입체화
- Hover 시 Lift / Glow
- Click Ripple / Feedback
- 인정·유지 프로세스 Step 연결선과 단계별 Accent
- 하단 KPI 카드 Mini Chart / Sparkline / Trend Badge
- 상세 Grid 버튼의 명확한 Affordance

중요: **디자인만 변경하며 정보·수치·업무 의미는 LOCK한다.** 디자인 시안을 먼저 확인·승인한 후 GitHub 운영본에 반영하는 것을 원칙으로 한다.

## 9. 주요 회귀문제와 대응
### 레이아웃 회귀
반복적인 기능 추가 과정에서 기존 대시보드 DOM을 숨기거나 이동시키면서 Portfolio/추이/Raw Data가 사라지는 문제가 발생했다. 이후 승인 레이아웃을 잠그고 필요한 기능만 복원하는 방향으로 변경했다.

### 클릭 기능 회귀
화면은 존재하지만 DOM 이동/숨김 또는 Modal 생성 순서 때문에 Drill-down이 작동하지 않는 문제가 있었다. `dashboard-regression-fix.js`, `final-requirements-guard.js`, KPI Modal Bootstrap 구조 등을 통해 KPI/Map/추이와 실제 업무 Screen의 연결을 보강한다.

### GitHub 반영 검증
커밋 성공 메시지만으로 배포 완료를 판단하지 않는다.

`수정 → GitHub Commit → main 브랜치 파일 재조회 → index.html 로딩 여부 확인 → 실제 변경 코드 존재 확인 → 가능하면 Pages 렌더링 확인 → 완료 통보`

사용자가 실제 화면에서 반영되지 않았다고 확인한 경우 GitHub Commit 성공 여부와 별개로 완료 처리하지 않는다.

## 10. 운영 파일 관리 원칙
Prototype/Hotfix/Guard 파일이 증가했으므로 파일명만 보고 삭제하지 않는다. 현재 `index.html`이 로드하거나 다른 운영 기능이 의존하는 파일은 운영파일로 간주한다.

과거 Preview/구형 Dashboard 등 미사용 파일은 즉시 삭제하기보다 `/archive/legacy/`로 이동 후 일정 기간 보존하는 것을 원칙으로 한다. 정리 전 반드시 `index.html` 및 코드 참조 여부를 확인한다.

## 11. 현재 주요 운영 스크립트
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

## 12. 데이터 관련 주의사항
Prototype에는 실제 생산현장 팀명을 반영한 데이터와 시연용/강제생성 데이터가 혼재한다. Headcount, 일부 작업장 실적, Audit/후보 데이터 등은 실제 시스템 Master 또는 DB 연결 시 교체가 필요하다.

고도화 작업장 관련 시연 데이터는 휠로더 작업장, 붐/프레임 제작, 대형 메인팀 등 실제성이 있는 생산영역 중심으로 구성하되, 시연 데이터임을 운영 데이터와 구분한다.

Trend Chart 역시 디자인 미리보기에서 예시 Trend를 사용할 수 있으나 실제 운영화 시 반드시 원천 데이터에서 계산해야 한다.

## 13. 향후 개발 시 금지사항
- 승인된 첫 페이지 전체 레이아웃을 기능 추가 때마다 재설계하지 않는다.
- 참고 이미지의 업무정보를 현재 시스템 데이터와 섞지 않는다.
- 요약정보 클릭 시 페이지 하단에 상세 Grid를 추가하지 않는다. Modal을 사용한다.
- 점수만으로 고도화 작업장 상태를 정의하지 않는다.
- 기존 기능을 삭제하거나 숨기기 전에 의존관계를 확인한다.
- 실제 근거 없는 Trend/성과 수치를 운영값으로 확정하지 않는다.
- GitHub Commit 생성만 확인하고 '배포 완료'라고 판단하지 않는다.
- 사용자가 GitHub 업로드 전 미리보기를 요청한 디자인 변경은 승인 없이 운영본에 바로 반영하지 않는다.

## 14. 개발일지 기록 규칙
중요 변경은 아래 형식으로 하단에 누적한다.

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
- 승인된 Dashboard 정보 위계 확정
- Portfolio Map/월별 추이/Raw Data 복원
- 상단 및 하단 KPI, Map/추이 클릭 상세 Modal Grid 원칙 확정
- Raw Data CSV 추출 연결
- Modal 선제 생성 필요성 반영
- 업무 메뉴 Routing Guard 추가

### 2026-08-26 / Audit 및 개선조치 Workflow 보강
- Audit 1~5점 클릭 평가 및 자동판정
- Audit Excel/Admin 관리 기능 보강
- 문제점 → 생산팀장 메일 → 조치 → AFTER 사진 흐름 구현
- 생산팀장 이름/메일 Excel 일괄등록 기능 반영

### 2026-08-26 / 시스템 운영관리 AI 챗봇 고도화
- 시스템 사용 가이드 챗봇 추가
- 주요 Q&A / 오류접수 / 오류이력 UI 구성
- 시스템 운영관리 전문가 역할 부여
- 일일 운영점검, KPI 이상, Audit 기한, 미조치, Master 이상 점검 가이드 추가
- 오류 접수번호 및 LocalStorage 기반 오류이력 관리

### 2026-08-26 / Dashboard 디자인 고도화 방향 승인
- 기존 정보·수치·업무구조 LOCK
- 참고 Dashboard에서는 디자인 효과만 차용하는 원칙 확정
- Dark Navy / Glass / Glow / Neon Accent 방향 승인
- KPI 카드의 현재값과 함께 Trend 변화 표현 요구 반영
- 전월/전기 대비 증감 + Mini Sparkline/Trend Chart 구성 방향 승인
- 하단 성과 카드의 Hover/Click/Trend 시각효과 강화
- 디자인은 GitHub 업로드 전에 미리보기 후 승인받는 절차 확정

### 2026-08-26 / GitHub 배포 검증 강화
- Commit 성공만으로 완료 판단 금지
- main 파일 재조회 및 index.html 실제 로딩 여부 확인
- 실제 코드 존재 확인 후 완료 통보
- 가능할 경우 Pages 렌더링까지 추가 확인

### 2026-08-26 / 저장소 정리 검토
- 운영파일과 과거 Preview/Legacy 파일 혼재 확인
- 운영 의존 파일은 유지
- 미사용 구형 파일은 삭제보다 `/archive/legacy/` 이동 우선

### 2026-08-27 18:43 KST / 긴급 구동 복원 및 승인 시안 2 첫 화면 재적용
- 요구사항: HD-20이 구동되지 않는 상태를 즉시 복원하고, 이전에 승인된 2번 시안을 첫 페이지 대시보드에 다시 정확히 반영한다.
- 안전조치: 장애 상태 전체를 `backup-broken-runtime-20260827-1843` 브랜치에 보존하여 당일 작업 데이터/코드를 유실하지 않도록 함.
- 복원 기준: 검증된 Design 2 안정화 체크포인트 `f41629693d67d01a3742aa29b5a4043e62fa5119`로 `main`을 우선 복원.
- 변경 파일: `approved-landing-v2.css`, `approved-landing-v2.js`, `beginner-navigation.js`.
- 구현 내용:
  - `approved-landing-v2.css`의 명시된 `visual reference #2` 스타일을 stable main에 재생성.
  - 승인 첫 화면 Renderer `approved-landing-v2.js`를 stable main에 재생성.
  - 첫 Dashboard 진입 시 승인 화면 CSS/JS를 강제로 로드하도록 `beginner-navigation.js` 연결.
  - Dashboard 메뉴 복귀 대상도 `.hd20ApprovedLanding`을 최우선으로 지정.
  - 승인 화면의 실제 Lifecycle Source 연결 로직(`hd20GMES5SAutoImproveRawV1`, `HD20MaturityFollowup`)은 보존.
- 실행/검증:
  - `approved-landing-v2.css` 생성 Commit `bfc4d7f5ce0a0e34bf07bce8c527e442fa1ed061`.
  - `approved-landing-v2.js` 생성 Commit `58cefc1368376bea6126909ccd08f05358c27e0f`.
  - 첫 화면 로더/Navigation 연결 Commit `b8b4ab11ce4c900acffa2014367c402f2a09259e`.
  - 해당 HEAD 기준 Package workflow 성공 및 GitHub Pages build/deployment 성공 확인.
- 잔여사항: 실제 브라우저 화면에서 승인 시안 2 시각 일치 여부 재확인 후, 백업 브랜치에 보존한 KPI/Lead Time/데이터 정합성 개선분을 기능별로 하나씩 재적용하고 매 단계 회귀검증한다.
