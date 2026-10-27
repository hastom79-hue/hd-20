# CODING LOG — Activity Import Remote Verification

## File
`activity-excel-preview-import.js`

## Code changes
- `esc()` double quote entity: `&quot;` 정상화.
- `pendingRemoteIds`로 현재 Excel Import batch 추적.
- `apply()` 반환값을 `{count, ids}`로 확장하고 import event detail에도 IDs 전달.
- `verifyRemote()` 추가:
  - `HD20_DB_SYNC.fetchRemote()` read
  - remote `payload.hd20GMES5SAutoImproveRawV1` ID Set 생성
  - pending IDs 전건 포함 여부 확인
  - 전건 확인 시에만 `DB 반영 검증 완료`
- `dbStatus()`는 pending batch가 있을 때만 push 상태를 Import UI에 반영.

## Non-regression
- Canonical key 변경 없음.
- duplicate/date validation 변경 없음.
- explicit confirm 유지.
- non-production filter 계약 유지.
- Supabase write 구현은 기존 `supabase-sync.js` 소유권 유지.
- forced empty write 없음.

## Validation boundary
정적 코드 반영 완료. 실제 Supabase 인증 세션을 포함한 Browser E2E 성공은 별도 실행 증거가 필요하다.