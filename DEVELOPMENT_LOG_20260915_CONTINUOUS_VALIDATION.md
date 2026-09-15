# HD-20 개발일지 — 연속 실행·검증 2026-09-15

## 목적
사용자 요청에 따라 기존 정상기능을 유지하면서 잔여 결함을 반복 검증하고, 확인된 결함만 최소 범위로 수정한다.

## 이번 검증 범위
- Action Case → Exact Audit Trace 연결 규칙 재확인
- 고도화 맵 → Activity Grid → 원 Case 복귀 구조 확인
- 고도화 맵 Activity ID 무결성 Guard와 우선순위/필터 Guard 교차검증
- Production 데이터 보호 로직 유지 확인

## 발견 결함
`hd20-maturity-map-priority-filter-guard.js`가 Case 상태 계산 시 Activity ID를 Map key로 사용했다.

Activity ID가 정상적으로 유일하면 문제가 없지만, ID Integrity Guard가 실제로 방어하려는 "중복 Activity ID" 상태에서는 같은 ID의 뒤쪽 Case가 앞쪽 Case를 덮어쓸 수 있었다.
그 결과 중복 ID Case는 Drill-down 자체는 차단되어도, 카드의 우선순위 정렬과 `유지미흡 / 재점검 필요 / 현재 유지` 필터 판정이 다른 중복 Case의 상태를 참조할 가능성이 있었다.

## 수정
Activity ID Map lookup을 제거하고 기존 Core Map의 안정키를 그대로 사용하도록 변경했다.
- 생산팀
- `data-mmt-case` 원본 인덱스

즉 DOM 정렬 여부와 Activity ID 중복 여부에 관계없이 팀별 canonical source의 원 Case를 직접 역매핑한다.

추가로 `validate()`를 노출하여 현재 렌더링된 Case 카드 수와 canonical 원본 매핑 성공 수를 비교할 수 있게 했다.

## 변경 파일
- `hd20-maturity-map-priority-filter-guard.js`
  - commit `f3d70c7661bf06f1374dd4b3dccddf7f9a3543e1`
- `final-layout-polish.js`
  - guard cache `v=20260914-2` → `v=20260915-1`
  - commit `92ae12a4da03b100f927f5f444adea4630588e1f`
- `index.html`
  - `final-layout-polish.js?v=20260914-38` → `final-layout-polish.js?v=20260915-1`
  - commit `8f2091b782427b702f184728a6dd07f4c3c50921`
  - main 재조회로 새 cache key 반영 확인
- `supabase-sync.js`
  - 인증 사용자 확인 직후 `HD20_DB_SYNC` API를 노출해 Health Guard가 초기 remote hydration 완료를 기다리다 retry를 소진하는 race를 제거
  - sanitize/preserve/conflict 규칙은 유지
  - commit `84113306bc0c002898b0e02c170eed53c5c12c3e`

## 기술적 검증 추가 결과
- Browser Smoke workflow는 main navigation을 5개(`dashboard/activity/advancement/audit/action`)로 고정 기대하고 있어 현재 6개 IA(`maturitymap` 포함)와 정적 계약 불일치가 확인됨.
- 반면 Runtime Smoke는 이미 6개 IA를 canonical 계약으로 검사하고 있어 두 CI 계약이 서로 불일치함.
- 최신 Browser Smoke run은 job 객체는 생성됐지만 steps가 0개이고 job log blob도 생성되지 않아 테스트 코드 실행 전 Runner 단계에서 종료된 것으로 확인됨. 따라서 현재 CI failure를 앱 회귀 실패로 판정하지 않는다.
- `hd20-trace-backlink-guard.js`는 Case Detail의 `원천 Audit ID`만 추출하고 Audit 유지관리 표에서 cell text가 ID와 exact 일치하는 행만 highlight한다.
- `hd20-maturity-map-operational-guard.js`는 canonical source를 team + `data-mmt-case` 원본 인덱스로 복원하며 Activity Grid query와 원 Case 복귀는 Activity ID exact 기준이다.

## 회귀방지 확인
변경하지 않은 규칙:
- 공식확정 판정은 `HD20KPIData.isConfirmed()`
- 유지 판정은 운영 Guard의 `stateOf()`
- 중복/누락 Activity ID는 ID Integrity Guard에서 exact Drill-down 차단
- Audit↔Action은 `auditDrawId || sourceCaseId` exact ID 기준
- 팀명/작업장 유사도 기반 임의 lineage 생성 금지
- Supabase Production sanitize/preserve 정책 유지
- 서버측 강제 empty write 금지

## 잔여 검증
1. Browser Smoke 5-area 계약을 6-area canonical IA와 정합화하되 HDPS 별도 navigation 계약과 분리
2. Pages가 수정 SHA를 실제 배포했는지 확인
3. 실제 브라우저에서 `HD20_MATURITY_PRIORITY_FILTER_GUARD.validate()` 결과 `mappingSafe=true` 확인
4. 중복 ID Case 2건의 상태가 서로 달라도 각각의 정렬/필터가 원 Case 기준으로 유지되는지 확인
5. 고도화 맵 → Activity Grid → 원 Case 복귀 후 필터 자동복원/전체 전환 확인
6. Production canonical source의 Activity ID 중복/누락 실데이터 건수 확인
7. 인증 Supabase sanitize push 후 remote `updated_at` 변경 및 non-production 0건 확인
