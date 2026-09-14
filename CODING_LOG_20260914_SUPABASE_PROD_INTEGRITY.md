# HD-20 코딩일지 — Supabase Production 무결성 (2026-09-14)

## 대상
- `supabase-sync.js`
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

## 캐시 상태
- 현재 index 참조: `supabase-sync.js?v=20260914-prodguard-1`
- sync 파일 본문은 위 commit으로 최신화됨.
- query cache key 자체는 아직 prodguard-1이므로 다음 배치에서 cache bust 여부를 별도 처리/검증한다.

## 다음 코드 검증 체크리스트
1. 최신 sync script 실제 브라우저 로드 확인
2. local Production Activity/Action 보존 확인
3. sanitize Push 완료 후 reload 확인
4. Supabase `canonical_v1` 재조회
5. Activity/Action/Audit non-production = 0 확인
6. KPI/Trace/Cases production-only 재검증
7. 개발일지·코딩일지에 최종 DB row counts와 deployed SHA 기록
