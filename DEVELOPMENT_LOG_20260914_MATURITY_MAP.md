# HD-20 개발일지 — 고도화 맵 / 양방향 Drill-down / 운영필터

작성일: 2026-09-14

## 1. 개발 목적
HD-20을 단순 메뉴형 화면이 아니라 실제 운영 흐름이 끊기지 않는 5S 활동관리 시스템으로 정리한다.
이번 작업의 핵심은 기존 5개 상위영역과 별도로 `고도화 맵`을 독립 Top-level 화면으로 두고, 공식확정 Case를 팀 단위 포트폴리오로 확인한 뒤 정확한 Activity ID 기준으로 상세 Grid까지 Drill-down하고 다시 원 Case로 복귀할 수 있게 하는 것이다.

## 2. 확정된 Top-level 구조
- dashboard
  - summary 종합현황
  - analysis 성과·운영분석
- activity
  - manage 활동관리
  - analysis 실적분석
- advancement
  - judge 후보·판정
  - standard 확정·수평전개
- maturitymap
  - 고도화 맵 (별도 Top-level, Subtab 없음)
- audit
  - audit Audit 관리
  - retention 유지관리
- action
  - manage 개선조치
  - verify 효과·재발관리

상단 beginner-navigation은 총 6개 버튼으로 운영한다.

## 3. 고도화 맵 데이터 원칙
- 생산 데이터만 사용한다.
- `window.HD20KPIData.load()` 원천을 사용한다.
- 공식확정 Case는 `HD20KPIData.isConfirmed()` 기준만 인정한다.
- 단순 `confirmed===true`만으로 공식확정으로 보지 않는다.
- 현재 유지 여부는 `HD20KPIData.isMaintained()`를 그대로 사용한다.
- Demo/Test/E2E는 canonical source filter에 의해 생산 화면에서 제외한다.
- Activity→Audit 직접 lineage는 존재가 입증되지 않았으므로 팀명/작업장 유사도로 임의 연결하지 않는다.
- 개별 Case Drill-down은 stable Activity ID exact match만 사용한다.

## 4. 고도화 맵 화면 구성
### KPI
- 후보
- 공식확정
- 현재 유지
- 전환율

### 팀 포트폴리오
- 팀별 공식확정 Case 수 및 유지 Case 수를 기반으로 포트폴리오 표현
- 임의 점수/가상 maturity score는 생성하지 않음

### 팀 Case Drill-down
- 팀 선택 시 해당 팀의 공식확정 Case만 노출
- Case 카드에 운영상태 Badge 표시
  - 현재 유지
  - 유지미흡
  - 재점검 필요

### 개별 Case 상세
- 팀
- 작업장
- Activity ID
- 판정일
- 판정상태
- 3조건
- 유지상태
- 증빙
- 비고

## 5. 운영상태 기준
### 현재 유지
`HD20KPIData.isMaintained(x)===true`

### 유지미흡
다음 중 하나:
- canonical maintained=false
- `valid===false`
- source 상태가 `유지미흡|부적합|중지|해제|실패`

### 재점검 필요
별도 운영주의 Badge로만 사용한다.
source 상태가 다음을 명시적으로 포함할 때만 표시한다.
- 재점검
- 점검대기
- 확인필요
- 재확인
- 관찰

`재점검 필요`는 KPI 성과를 자동 차감하는 별도 성과상태로 취급하지 않는다.

## 6. Case 우선순위
운영관리 관점에서 팀 Case 목록은 다음 순으로 정렬한다.
1. 유지미흡 + 재점검 필요
2. 유지미흡
3. 현재 유지 + 재점검 필요
4. 현재 유지

동일 상태에서는 최신 판정일 우선이다.

기존 Guard의 `운영주의 우선` 계산은 재점검 단독 Case가 유지미흡 단독 Case보다 먼저 올 수 있었으므로 별도 priority/filter guard로 보정했다.

## 7. Case 필터
고도화 맵에 다음 필터를 제공한다.
- 전체
- 유지미흡
- 재점검 필요
- 현재 유지

기존 Guard가 `all/weak/review`만 알고 있어 `현재 유지(ok)` 필터 상태를 재처리할 때 Case를 전부 숨길 수 있는 충돌 가능성을 확인했다.
이를 제거하기 위해 신규 Guard에서 `mmtPriorityFilter` 별도 상태키를 사용하고, `현재 유지` 필터일 때 legacy `mmtFilter`는 `all`로 유지하도록 분리했다.

## 8. Activity ID Exact Drill-down
개별 고도화 Case 상세에서 `Activity ID 상세 Grid 열기` 버튼을 제공한다.

호출 경로:
`HD20_OPS_V2.go('advancement','standard',{openGrid:true,q:<ActivityID>})`

이동 목적:
- 고도화·표준화
- 확정·수평전개
- Canonical Grid

검증 결과:
- Advancement Standard evidence/grid에는 Activity ID가 표시/검색 가능한 필드로 포함됨
- Grid 검색은 행 전체 텍스트를 대상으로 하므로 exact Activity ID 검색 가능
- 임의 팀명/작업장 유사도 검색을 사용하지 않음

## 9. 양방향 복귀
Activity 상세 Grid 진입 전 sessionStorage에 복귀 Context를 저장한다.

Key:
`hd20MaturityMapReturnV1`

저장값:
- Activity ID
- Team
- Timestamp

Grid 상단에 다음 버튼을 추가한다.
`← 고도화 맵으로 돌아가기`

복귀 동작:
1. Canonical Grid 닫기
2. maturitymap Top-level 이동
3. Map 화면 Open 보장
4. 원 Activity ID Case exact 검색
5. 원 팀 자동 재선택
6. 원 Case 강조
7. 원 Case 위치로 scroll
8. Return context 삭제

복귀 시 기존 필터 때문에 원 Case가 숨겨진 경우 자동으로 `전체` 필터로 전환하여 원 Case가 반드시 보이도록 보정한다.

## 10. Case 원본 매핑 검증
Core map의 `data-mmt-case`는 팀별 `t.cases` 원본 인덱스를 유지한다.
화면에서 Case 카드 DOM 순서를 변경해도 원 `data-mmt-case` 인덱스는 변경하지 않는다.
따라서 최신일/우선순위 정렬 후에도 클릭한 Case가 canonical source의 동일 Case로 역매핑된다.

추가로 운영 Guard는 Case 카드에 exact Activity ID를 `data-activity-id`로 부여하여 복귀와 Drill-down 시 stable key로 사용한다.

## 11. Responsive / Navigation
`hd20-six-nav-layout.js`
- Desktop: 6 columns
- <=1100px: 3 columns
- <=720px: 2 columns

고도화 맵은 독립 Top-level 화면이므로 활성 시 일반 Subnav/Purpose/Ops strip을 숨기고, 다른 영역으로 이동하면 복원한다.

## 12. 회귀방지 유지사항
다음 항목은 이번 작업 중 변경하지 않거나 보존을 재확인했다.
- `고도화 작업장 추이` 구조:
  `<div class="cardBody"><div class="trendBox"></div></div>`
- Supabase auth cache/version 유지
  - `supabase-auth.css?v=20260914-accesspopup-2`
  - `supabase-auth.js?v=20260914-accesspopup-5`
- 기존 Audit/Action canonical lifecycle 미변경
- Demo/E2E 생산 필터 유지
- Activity→Audit 임의 lineage 생성 금지

## 13. 주요 파일
- `beginner-navigation.js?v=20260914-map-1`
- `hd20-six-nav-layout.js?v=20260914-1`
- `hd20-maturity-map-tab.js?v=20260914-2`
- `hd20-maturity-map-operational-guard.js?v=20260914-6`
- `hd20-maturity-map-priority-filter-guard.js?v=20260914-2`
- `final-layout-polish.js`
- `index.html`

## 14. 배포 및 검증 이력
### ec4132aadec2747550810b6107a313ed2d2b0763
- Pages Build: success
- Pages Deploy: success
- Report Build Status: success
- deploy log `pages_build_version` exact match 확인
- deployment result `Reported success!`
- URL: `https://hastom79-hue.github.io/hd-20/`

### 이후 필터 충돌 제거
- `ba398e17628cb3b8d3db027a21c2e269c85786af`
  - maturity status filter legacy-state 충돌 제거
- `392fbb869605404ce83bd1732950947cec070828`
  - priority filter guard cache v2 적용
- `158f7f51c32e6f8de6b56a4b4803832a956a0c43`
  - `final-layout-polish.js?v=20260914-36` 캐시 강제갱신

`158f7f51...` Pages run은 생성 확인 후 배포상태를 계속 검증한다.

## 15. CI 해석 원칙
일반 Browser/Design/Runtime Smoke가 GitHub Runner에서 step 시작 전 실패하는 기존 패턴이 반복되고 있다.
따라서 다음을 구분한다.
- Pages Build/Deploy 성공 및 exact SHA 배포 확인 → 실제 배포 사실로 인정
- Smoke job에서 실제 test step 미실행/steps null → 앱 기능 실패로 단정하지 않음
- 브라우저 E2E 성공은 runner가 실제 테스트 step을 수행하고 통과한 경우에만 선언

## 16. 현재 잔여 검증
- 최신 `158f7f51...` Pages 배포 SHA exact 확인
- 실제 브라우저에서 고도화 맵 → Activity Grid → 고도화 맵 복귀 시 팀/Case 강조 유지 여부
- 데이터 갱신 이벤트 발생 후 현재 유지/유지미흡/재점검 필터 상태 유지 여부
- 모바일에서 복귀버튼 및 Case detail 버튼의 full-width/터치영역 검증

## 17. 운영원칙
앞으로 HD-20 변경 시 개발일지에 반드시 남긴다.
- 요청/목적
- 발견한 문제
- 원인
- 수정 방향
- 변경 파일
- canonical business rule 영향 여부
- 회귀방지 대상
- 실행검증 결과
- 배포 commit SHA
- Pages 실제 배포 SHA
- 미검증/잔여위험
