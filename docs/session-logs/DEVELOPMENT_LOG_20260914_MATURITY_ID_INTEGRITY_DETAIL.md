# HD-20 개발일지 — 고도화 맵 Activity ID 무결성 상세

작성일: 2026-09-14

## 목적
고도화 맵의 Activity ID exact Drill-down 전제인 `ID 유일성`을 운영 화면에서 검증 가능하게 하고, 중복/누락 Case를 숫자 경고만이 아니라 실제 Case 목록으로 확인할 수 있게 한다.

## 기존 문제
- Activity ID가 중복되면 `q=<ActivityID>` 검색이 여러 Case를 반환할 수 있어 exact Drill-down 의미가 깨질 수 있음.
- Activity ID가 누락되면 상세 Grid 이동의 안정적인 key가 없음.
- v1 Guard는 중복/누락 건수와 Drill-down 차단은 제공했지만 어떤 Case가 문제인지 운영자가 즉시 확인하기 어려웠음.

## 보완 내용
### 1. 무결성 상세 목록
`hd20-maturity-id-integrity-guard.js` v2에서 경고 배너를 클릭 가능하게 변경.

상세 목록 컬럼:
- Activity ID
- 생산팀
- 작업장
- 판정일
- 상태
- 이상 사유

이상 사유:
- Activity ID 누락
- Activity ID 중복 (N건)

### 2. 데이터 원칙
- `HD20KPIData.load().filter(HD20KPIData.isConfirmed)` 공식확정 생산 Case만 검사
- Demo/Test/E2E는 canonical source filter 기준 유지
- Activity→Audit 임의 연계 없음
- 팀/작업장 유사추론 없음

### 3. exact Drill-down 보호
- 동일 ID 발생건수 = 1 → 상세 Grid 버튼 활성
- 발생건수 = 0 → `Activity ID 확인 필요`, 버튼 비활성
- 발생건수 >= 2 → `Activity ID 중복 · 상세 Grid 차단`, 버튼 비활성
- 중복 Case 카드에는 `ID 중복` Badge 표시

### 4. 상세 모달 UX
- 경고 배너 클릭 또는 Enter 키로 열기
- × / backdrop / ESC로 닫기
- Desktop: 최대 920px, 스크롤 테이블
- Mobile: full-screen, 표 horizontal scroll
- 정상 데이터면 상세 목록은 빈 상태 표시

## 변경 파일 및 Commit
- `a7e5da576705ee8e7bbd96d35701199e4c62c879`
  - `hd20-maturity-id-integrity-guard.js` 상세 목록 기능 추가
- `29630f855468650780c14e8aaef155a5e501124a`
  - `final-layout-polish.js`
  - Guard cache `v=20260914-1 → v=20260914-2`
- `b27e375b7f432bd42f64e72fb7e418d14790679e`
  - `index.html`
  - `final-layout-polish.js?v=20260914-37 → v=20260914-38`
  - `trendBox` 구조 및 Supabase auth cache 보존

## 이전 배포 확인
직전 main `d405cb39cc232f0e996b8cf5ae0c08dc02a2fc99`:
- Pages Build success
- Pages Deploy success
- Report success
- `pages_build_version` exact match
- `Reported success!`

## 회귀 방지
- `trendBox` exact 구조 보존
- Supabase auth CSS/JS 버전 보존
- 공식확정 기준 `HD20KPIData.isConfirmed()` 유지
- 현재유지 기준 `HD20KPIData.isMaintained()` 유지
- existing Audit/Action canonical lifecycle 미변경
- duplicate ID를 임의로 자동 수정하지 않음
- ID 충돌 시 잘못된 exact 이동보다 차단을 우선함

## 잔여 검증
- 최신 문서 commit 포함 main Pages exact SHA 확인
- 실제 Production source의 `missing / duplicateIds / duplicateCases` 결과 확인
- 문제 Case가 존재할 경우 상세 목록과 카드 Badge 건수 일치 확인
- 문제 수정 후 데이터 갱신 이벤트에서 경고/상세 목록 자동 해제 확인
- 모바일 full-screen modal 시인성 확인
