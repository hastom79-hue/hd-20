# HD-20 개발일지 — Supabase Production Data Guard

작성일: 2026-09-14

## 1. 발견 배경
고도화 맵 Activity ID 무결성을 실제 Production 원천에서 검증하기 위해 `supabase-sync.js`와 Supabase `hd20_app_state/canonical_v1`을 읽기 전용으로 점검했다.

## 2. 실제 원격 상태
Supabase 프로젝트: `hastom79-hue's Project`
Project ref: `sbqpyrynamviaojwfrrp`
Region: `ap-northeast-1`

`public.hd20_app_state` / `id='canonical_v1'`:
- 마지막 갱신: 2026-09-08 02:11:47 UTC
- Activity store `hd20GMES5SAutoImproveRawV1`: 120건
- 120건 모두 `source=demo-seed`
- 120건 모두 `DEMO-*` ID
- canonical Production filter 적용 시 Production Activity = 0건

다른 store 단순 현황:
- `hd20ActionCasesV2`: 86건
- `hd20AuditChecklistV1`: 40건
- `hd20AuditRandomDrawsV1`: 21건
- `hd20TeamLeaderMasterV1`: 16건

따라서 DB 전체가 Demo라는 의미가 아니라 Activity store가 Demo-only로 남아 있는 상태로 판단했다.

## 3. 발견한 운영위험
기존 `supabase-sync.js` 로그인 boot:
1. remote row 존재 여부만 확인
2. remote가 있으면 `apply(remote.payload)` 실행
3. `sanitizeStore()`가 Demo Activity 120건을 모두 제거하여 clean Activity=[]
4. 해당 빈 배열을 LocalStorage에 저장

따라서 사용자 브라우저에 정상 Production Activity가 있었더라도 remote Demo-only Activity 때문에 로그인 시 빈 배열로 덮어써질 위험이 있었다.

또한 기존 `push()`는 `mergePreservingRemoteUnsafe()`를 통해 remote non-production 행을 다시 payload에 붙여 보내므로 Demo Activity가 원격에서 계속 살아남을 수 있었다.

## 4. 수정방향
DB row를 직접 삭제/변경하지 않고 웹 동기화 로직을 수정했다.

### Remote unsafe-only 보호
Remote store가:
- array이고
- raw row > 0이고
- sanitize 결과 0건이고
- 모든 raw row가 non-production이며
- LocalStorage에 Production clean row가 존재하면

해당 store는 remote로 덮지 않고 Local Production을 보존한다.

### Push production-only
`push()` payload는 `snapshot()`의 production-clean payload만 사용한다.
Remote unsafe row를 다시 첨부하지 않는다.

### 자동 정화
pull/boot/manual sync/conflict pull에서 remote unsafe가 발견되면:
- local production 보존
- remote timestamp/meta 동기화
- 후속 sanitized push 예약

다음 정상 동기화에서 remote non-production row가 Production snapshot에 다시 포함되지 않도록 한다.

## 5. 변경 파일
- `supabase-sync.js`
- `index.html`

## 6. Commit
- `4c5811a0f83c6cbe0b06e4fd0a2b4ea5df89abcf`
  - remote Demo-only overwrite 방지
  - remote unsafe 재보존 제거
  - sanitized push scheduling 추가
- `473d3c6425e621f8252e7e1110db74659e49e4a7`
  - `supabase-sync.js?v=20260914-prodguard-1` cache 적용

## 7. 회귀방지
- DB schema/RLS/table 직접 변경 없음
- Supabase auth cache 변경 없음
- `trendBox` 구조 보존
- Action/Audit canonical business rule 변경 없음
- Production filter 규칙 기존 `isNonProdRow()`와 동일하게 유지
- Local Production이 존재할 때 remote unsafe-only가 이를 지우지 못하게 함

## 8. 잔여 검증
- 최신 main Pages exact SHA 확인
- 실제 로그인 브라우저에서 `hd20-db-status` 동작 확인
- remote Activity가 Demo-only 상태에서 local Production 보존 여부 실행검증
- sanitized push 이후 Supabase Activity store에서 Demo row 제거/Production row 반영 여부 재조회
- 실제 Production Activity가 원격에 올라온 이후 ID 중복/누락 다시 집계

## 9. 중요 판단
현재 Supabase 원격 Activity의 공식확정 Production Case가 0건이므로 원격 DB만으로 실제 고도화 Case Activity ID 무결성을 아직 확정할 수 없다.
이번 Guard는 Production 데이터 유실 위험을 먼저 제거하기 위한 선행조치다.
