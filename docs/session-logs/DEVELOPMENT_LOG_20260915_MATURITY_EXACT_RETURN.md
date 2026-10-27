# HD-20 개발일지 — 고도화 맵 Exact 복귀 강화 2026-09-15

## 목적
고도화 맵 → Activity Grid → 원 Case 복귀에서 Activity ID만으로 첫 DOM Case를 선택하던 잔여 위험을 제거한다.

## 발견 위험
Grid 진입 시 return context에는 Activity ID와 생산팀이 함께 저장되지만 기존 `restoreReturnFocus()`는 Activity ID만으로 첫 카드를 선택했다. 정상 데이터에서는 ID가 유일하므로 문제가 없지만 Grid 체류 중 데이터가 갱신되어 동일 ID가 다른 팀에 추가되는 경우 잘못된 Case를 focus할 가능성이 있었다.

## 수정
- `returnCandidates(r,root)` 추가
- 저장된 `team + Activity ID`를 동시에 만족하는 Case만 복귀 후보로 인정
- 후보가 정확히 1건일 때만 focus 및 return context 제거
- 0건 또는 2건 이상이면 임의 선택하지 않고 복귀를 중단하여 exact 원칙 유지
- `validate()`에 `returnMatches`, `returnExactSafe` 추가

## Cache 반영
- `final-layout-polish.js`: `hd20-maturity-map-operational-guard.js?v=20260915-1`
- `index.html`: `final-layout-polish.js?v=20260915-2`

## 변경 Commit
- 기능 강화: `8ef85351c5bc923e67036105b8b43174aca1ac03`
- loader cache 갱신: `01e5e62a2e97914e06c8cd431b2eb64dd83068e2`
- loader 경로 회귀 즉시 정정: `674f7804da27132dfe2f1e6064a6339500324361`
- index cache 갱신: `cbc27fe85aafedd93c12ebb7f0c5c75fa467557a`

## 회귀방지
- 중복/누락 Activity ID Drill-down 차단 유지
- 팀명/작업장 유사도 추정 lineage 금지 유지
- Supabase Production sanitize/preserve 정책 변경 없음
- 서버측 forced empty write 추가 없음

## 다음 검증
Pages exact SHA 배포 확인, Actions runner step 실행 여부 확인, 실제 runtime `returnExactSafe` 확인, duplicate ID fixture 및 필터 복귀 교차검증.