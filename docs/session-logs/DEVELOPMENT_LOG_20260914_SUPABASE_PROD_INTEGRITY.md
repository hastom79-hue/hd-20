# HD-20 개발일지 — Supabase Production 무결성 검증 (2026-09-14)

## 목적
HD-20 운영 데이터가 Supabase `public.hd20_app_state / canonical_v1`과 동기화될 때 Demo/E2E seed가 Production 화면·KPI·Trace로 재유입되지 않도록 실제 DB 원천과 동기화 로직을 함께 검증한다.

## 실제 DB 검증 결과
Supabase `canonical_v1` payload의 핵심 3개 배열을 직접 집계했다.
- `hd20GMES5SAutoImproveRawV1`: 120행 / non-production 판정 120행
- `hd20ActionCasesV2`: 86행 / non-production 판정 86행
- `hd20AuditRandomDrawsV1`: 21행 / non-production 판정 0행

즉 Activity와 Action 원격 배열은 현재 Demo/Test seed만 존재하고, Audit 배열은 검출 기준상 Production 21행이다.

## 중요한 운영 판단
원격 Activity/Action 배열을 즉시 빈 배열로 삭제하지 않았다. 이유는 원격 Demo-only 배열을 단순 `[]`로 바꾸면 기존 브라우저의 로컬 Production 데이터가 다음 Pull에서 빈 배열로 덮일 위험이 있기 때문이다.

따라서 안전한 순서는 다음과 같다.
1. 원격 Demo-only payload 감지
2. 브라우저 로컬에 Production 데이터가 있으면 로컬 Production을 보존
3. Demo/Test를 제거한 clean snapshot을 원격으로 Push
4. Push 성공 이후에만 최초 hydrate reload

## 수정
`supabase-sync.js`의 최초 boot 동기화에서 기존에는 sanitize Push를 예약한 뒤 80ms 후 reload할 수 있었다. 네트워크가 느리면 reload가 Push 완료 전에 발생할 가능성이 있었다.

수정 후:
- `needsSanitizedPush(outcome)`가 true이면 `await push()` 수행
- clean snapshot Push가 끝난 뒤 hydrate reload 진행
- 원격 Demo-only + 로컬 Production 조합에서 로컬 Production 보존 원칙 유지

## Commit
- `45bb83dc240baf5483e2f6d1ebca12e25c0ca9ec` — `fix: await production sanitization before initial reload`

## 2026-09-15 후속 실행검증
### 최신 배포 확인
- main/cache refresh SHA: `f7bbbf88e57c4402d27532bdb491adfcba7cc66d`
- Pages run: `34814541541`
- Build / Deploy / Report 모두 성공
- 배포 대상 head SHA가 `f7bbbf88e57c4402d27532bdb491adfcba7cc66d`와 일치
- `index.html`에서 최신 sync cache `supabase-sync.js?v=20260914-prodguard-awaitpush-2` 로딩 확인
- `고도화 작업장 추이`의 `<div class="cardBody"><div class="trendBox"></div></div>` 구조 보존 확인

### 원격 DB 재검증
최신 배포 이후 Supabase를 동일 Production 판정 규칙으로 재조회했다.
- remote `updated_at`: `2026-09-08 02:11:47.106+00`
- Activity: 120 / non-production 120
- Action: 86 / non-production 86
- Audit: 21 / non-production 0

판정:
- 최신 sanitize 로직과 cache bust는 Pages에 배포됨.
- 그러나 원격 `updated_at`이 9/8에서 변하지 않았으므로 배포 이후 인증된 브라우저 세션이 아직 sanitize Push를 완료한 흔적이 없다.
- 따라서 원격 배열을 서버에서 강제 삭제하지 않고 로컬 Production 보존 원칙을 계속 유지한다.

### 운영 가시성 보완
원격 Production 무결성을 운영 화면에서 직접 확인하기 위해 `hd20-db-production-health.js`를 추가했다.
- Activity / Action / Audit 원격 배열을 production 판정 규칙으로 재검사
- 이상 시 `DB 정리 대기 N건` 표시
- 정상 시 `DB Production 정상` 표시
- tooltip에 원격 갱신시각 및 배열별 total/non-production 건수 표시
- 삭제/수정 작업은 수행하지 않는 read-only Health Guard

관련 커밋:
- `ebb4149cfd597020afc72ca36405d631ecbd26eb` — Production Health Guard 추가
- `0f8f7ba79554c6b31266a3dee440410381c4c64c` — `final-layout-polish.js` 동적 로더 연결

### 최신 main 배포 재확인 — 2026-09-15
- 당시 main SHA: `2a00a852cc28671e17fb1c3137ac602ff71e00cc`
- Pages run: `34907228765`
- 결과: `completed / success`
- Pages run의 `head_sha`가 위 main SHA와 정확히 일치
- Health Guard 및 관련 로그 커밋이 포함된 main이 Pages 배포 대상에 포함됨

배포 성공 직후 원격 DB를 다시 직접 조회했다.
- remote `updated_at`: `2026-09-08 02:11:47.106+00`
- Activity: 120 / non-production 120
- Action: 86 / non-production 86
- Audit: 21 / non-production 0

결론:
- 배포 성공 후에도 원격 DB 값과 갱신시각은 변하지 않았다.
- 따라서 현 시점 병목은 Pages 코드 배포가 아니라 인증된 실제 브라우저에서 sanitize Push가 실행되는 단계이다.
- 로컬 Production 존재 여부가 검증되지 않은 상태에서 서버측 강제 삭제/빈 배열 치환은 계속 금지한다.

### Health Guard 인증대기 안정화 — 2026-09-15
추가 실행검증에서 `HD20_DB_SYNC.fetchRemote`가 준비되지 않은 동안 250ms 무한 재시도할 수 있는 잔여위험을 확인했다.

수정:
- 최대 40회까지만 250ms polling
- `hd20-auth-ready`, `hd20-db-status ready`, `hd20-db-synced` 이벤트에서 재기동
- 인증 우회 모드에서는 원격검사를 실행하지 않고 `DB 무결성 비활성` 표시
- 준비 완료 시 retry timer 정리 후 정상 remote check

관련 커밋:
- `46a9de6193ec9c6957e2fcb69847c760b8dc7da7` — 유한 재시도 + 이벤트 기반 재기동
- `360b824eb0494cdf809df272cad0b923c4ee8ddd` — `hd20-db-production-health.js?v=20260915-2` cache 갱신

### Health Guard v2 최신 Pages 배포 및 DB 재검증 — 2026-09-15
- 기준 main SHA: `5d016af36904e56414bb4ff00f10dad47bdc6b97`
- Pages run: `34907958296`
- run 결과: `completed / success`
- build job `104188877901`: success
- deploy job `104189002591`: success
- report-build-status job `104189002693`: success
- 세 job 모두 `head_sha = 5d016af36904e56414bb4ff00f10dad47bdc6b97`

배포 완료 후 Supabase `canonical_v1`을 다시 동일 판정 규칙으로 조회했다.
- remote `updated_at`: `2026-09-08 02:11:47.106+00`
- Activity: 120 / non-production 120
- Action: 86 / non-production 86
- Audit: 21 / non-production 0

최종 판정:
- Health Guard v2와 sync production guard는 최신 Pages artifact에 포함됐다.
- 그러나 원격 row가 9/8 이후 갱신되지 않아 인증된 실제 브라우저에서 sanitize Push가 아직 완료되지 않은 상태가 계속된다.
- 이 시점에도 서버측 강제 비우기는 수행하지 않는다.

## 잔여 검증
- 인증된 실제 HD-20 브라우저에서 최신 sync 코드가 실행된 뒤 원격 payload가 clean Production snapshot으로 교체되는지 재확인 필요.
- 교체 후 Supabase SQL로 Activity/Action/Audit non-production = 0을 확인해야 한다.
- 새 Health Guard가 실제 브라우저에서 `DB 정리 대기` → `DB Production 정상`으로 전환되는지 확인한다.
- `index.html`의 `final-layout-polish.js` cache key는 기존 v38이므로 장기 캐시 환경에서 새 동적 로더가 즉시 반영되는지 추가 확인한다. 전체 index 재기록은 회귀 위험 때문에 이번 배치에서는 수행하지 않았다.

## 회귀 방지 원칙
- Demo/Test 원천을 Production으로 간주하지 않는다.
- Production 데이터가 확인되지 않은 상태에서 원격 배열을 빈 배열로 강제 삭제하지 않는다.
- Activity/Audit/Action exact ID 정책과 기존 KPI production filter는 유지한다.
- Supabase 변경은 실제 DB 검증 후 진행한다.
- 모든 변경은 개발일지와 코딩일지에 Commit/배포/잔여위험까지 기록한다.
