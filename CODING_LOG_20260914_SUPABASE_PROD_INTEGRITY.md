# HD-20 코딩일지 — Supabase Production 무결성 (2026-09-14)

## 대상
- `supabase-sync.js`
- `hd20-db-production-health.js`
- `final-layout-polish.js`
- `index.html`의 Supabase sync cache reference
- Supabase table: `public.hd20_app_state`, row `canonical_v1`

## Production 판정 로직
`isNonProdRow(x)`에서 다음을 non-production으로 제외한다.
- `isDemo === true`
- `isTest === true`
- `source === 'demo-seed'`
- `source === 'e2e-fixture'`
- ID prefix `DEMO-`, `E2E-`
- ID 내 `AUTO-DEMO-`
- sourceCaseId prefix `DEMO-`, `E2E-`
- `@hd-hyundai-demo.co.kr`
- legacy `teamleadN@example.com`
- 과거 테스트 Audit ID allowlist

## 기존 위험
최초 boot에서 `apply(remote.payload)`가 Demo-only 원격 배열을 감지하면 로컬 Production을 보존하고 sanitize Push를 예약했다. 그러나 이후 hydrate reload가 80ms timer로 예약되어, 비동기 Push 완료 전에 reload될 수 있었다.

## 코드 수정
### 1. `needsSanitizedPush(outcome)` 사용
`preservedKeys` 또는 `sanitizedUnsafeKeys`가 존재하는지 단일 함수로 판정한다.

### 2. 최초 boot 순서 변경
기존 개념:
`apply -> scheduleSanitizedPush -> reload timer`

수정:
`apply -> if(needsSanitizedPush) await push() -> reload timer`

목적:
- clean Production snapshot 원격 저장 완료 전 reload 방지
- Demo-only 원격이 로컬 Production을 다시 오염시키는 반복루프 방지

### 3. 기존 conflict 처리 유지
`push()` 시 원격 `updated_at`과 local meta가 다르면 우선 remote pull/apply 후 sanitize Push를 재예약한다. exact row `canonical_v1`만 사용한다.

## 실제 DB fixture 성격 검증
SQL 집계 결과:
- Activity 120 / nonprod 120
- Action 86 / nonprod 86
- Audit 21 / nonprod 0

따라서 현재 원격 Activity/Action은 production source로 사용할 수 없다.

## 직접 삭제를 하지 않은 이유
현재 원격 Demo-only 배열을 SQL로 `[]` 처리하면 구버전 또는 일반 Pull 클라이언트가 이를 정상 빈 원격값으로 받아 로컬 Production 배열을 지울 수 있다. 따라서 clean local snapshot을 가진 클라이언트가 production guard를 통해 Push하는 순서를 우선한다.

## Commit
- `45bb83dc240baf5483e2f6d1ebca12e25c0ca9ec`

## 2026-09-15 코드/배포 재검증
### Cache bust 확인
`index.html` 현재 참조:
- `supabase-sync.js?v=20260914-prodguard-awaitpush-2`

즉 초기 기록의 `prodguard-1` 잔여사항은 해소됐다.

배포 기준:
- SHA `f7bbbf88e57c4402d27532bdb491adfcba7cc66d`
- Pages run `34814541541`
- build/deploy/report success
- workflow job의 `head_sha` 역시 `f7bbbf88e57c4402d27532bdb491adfcba7cc66d`

### 원격 상태 재검증
앱과 동일한 non-production 규칙에 legacy `teamleadN@example.com`까지 포함해 SQL로 재집계했다.
- Activity 120 / nonprod 120
- Action 86 / nonprod 86
- Audit 21 / nonprod 0
- remote `updated_at = 2026-09-08 02:11:47.106+00`

따라서 최신 코드 배포와 별개로 인증 브라우저가 sanitize Push를 실행한 원격 변경 흔적은 아직 없다.

## 신규 코드 — `hd20-db-production-health.js`
목적: 원격 상태를 DB 삭제 없이 브라우저에서 즉시 확인한다.

구성:
- `nonProd(x)` — `supabase-sync.js`와 같은 핵심 production 제외 규칙 사용
- `inspect(payload)` — Activity/Action/Audit 별 total/unsafe 집계
- `ensureBadge()` — 상단 controls에 운영 상태 버튼 생성
- `check()` — `HD20_DB_SYNC.fetchRemote()`로 원격 read-only 조회 후 상태 표시

표시:
- unsafe > 0: `DB 정리 대기 N건`
- unsafe = 0: `DB Production 정상`
- tooltip: 원격 갱신시각 + 배열별 total/non-production 건수

이벤트:
- `hd20-db-status` ready 이후 재검사
- `hd20-db-synced` 이후 재검사
- 버튼 클릭 시 수동 재검사

API:
- `window.HD20_DB_PRODUCTION_HEALTH.last`
- `window.HD20_DB_PRODUCTION_HEALTH.check()`
- `window.HD20_DB_PRODUCTION_HEALTH.inspect()`

Commit:
- `ebb4149cfd597020afc72ca36405d631ecbd26eb` — Health Guard 파일 생성
- `0f8f7ba79554c6b31266a3dee440410381c4c64c` — `final-layout-polish.js` 동적 로더에 `hd20-db-production-health.js?v=20260915-1` 연결

## 2026-09-15 최신 main/DB 재검증
- 당시 main SHA: `2a00a852cc28671e17fb1c3137ac602ff71e00cc`
- Pages run: `34907228765`
- 상태: `completed / success`
- Pages `head_sha` = `2a00a852cc28671e17fb1c3137ac602ff71e00cc`

배포 성공 직후 동일 SQL을 재실행한 결과:
- `updated_at = 2026-09-08 02:11:47.106+00`
- Activity 120 / nonprod 120
- Action 86 / nonprod 86
- Audit 21 / nonprod 0

코드 관점 결론:
- 최신 `supabase-sync.js` 및 Health Guard 계열 소스는 main/Pages에 포함되어 있다.
- remote row timestamp가 변하지 않았으므로 sanitize `push()`가 실제 인증 세션에서 아직 성공 실행되지 않았다.
- 서버에서 `[]`로 직접 덮는 방식은 로컬 Production 손실 가능성 때문에 사용하지 않는다.

## Cache/로더 잔여위험
- `index.html`의 `final-layout-polish.js?v=20260914-38` cache key 자체는 이번 배치에서 변경하지 않았다.
- 이유: index가 한 줄 전체 파일이며 기존 외부 설정 문자열과 다수 script cache version을 포함하고 있어, Health Guard 1개를 위해 전체 파일 재기록 시 회귀 범위가 커진다.
- 새 방문/캐시 갱신 환경에서는 최신 final-layout 파일이 로드된다. 장기 캐시 환경의 즉시 반영 여부는 별도 검증한다.

## 다음 코드 검증 체크리스트
1. 인증 세션에서 Health Guard 표시 확인
2. local Production Activity/Action 보존 확인
3. sanitize Push 완료 후 remote `updated_at` 변경 확인
4. Supabase Activity/Action/Audit non-production = 0 확인
5. Health Guard가 `DB Production 정상`으로 전환되는지 확인
6. KPI/Trace/Cases production-only 재검증
7. 이후 모든 코드 변경 시 개발일지·코딩일지 동시 갱신
