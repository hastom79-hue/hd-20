# HD-20 개발일지 — DB Sync API 조기 노출 보완

작성일: 2026-09-15

## 배경
연속 실행·검증 중 `hd20-db-production-health.js`와 `supabase-sync.js` 초기화 순서를 교차검증했다.

기존 구조에서는 인증 사용자가 확인된 뒤에도 `window.HD20_DB_SYNC`가 최초 원격 fetch/apply/sanitize push/hydration 처리 이후에만 노출되었다. 따라서 원격 응답 또는 sanitize push가 지연될 경우 Health Guard의 유한 재시도 구간과 겹쳐 `DB 무결성 대기` 상태가 불필요하게 길어지거나 조기 retry가 소진될 수 있는 race 가능성이 있었다.

## 수정
`supabase-sync.js`에 `exposeSync()`를 추가했다.

- 인증 사용자 확인 직후 `exposeSync()` 실행
- 최초 원격 hydration 전부터 `fetchRemote`, `pull`, `push`, `manualSync`, 상태 API를 공개
- 기존 초기 hydration 완료 후에도 다시 `exposeSync()`하여 최신 상태 accessor 유지
- sanitize 기준, conflict 처리, local Production 보존 로직은 변경하지 않음
- 서버측 강제 empty write 로직은 추가하지 않음

## 기대효과
Health Guard가 초기 원격 hydration이 느린 경우에도 DB Sync API를 즉시 발견할 수 있어 초기화 race를 줄인다.

## 배포 커밋
- `84113306bc0c002898b0e02c170eed53c5c12c3e` — `fix: expose DB sync API before initial remote hydration`

## 잔여 검증
- Pages build/deploy exact SHA 확인
- 인증 세션에서 Health Guard가 `DB 무결성 대기`에 고착되지 않는지 확인
- sanitize Push 후 remote `updated_at` 갱신 및 Activity/Action/Audit non-production 0건 재확인
- 기존 Production 데이터 보존 재확인
