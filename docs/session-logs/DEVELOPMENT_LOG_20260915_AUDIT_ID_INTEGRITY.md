# Development Log — 2026-09-15 Audit ID Integrity

자동 순환검증에서 Exact Trace의 Audit 역참조가 Audit ID 일치 후 첫 행을 선택하는 구조임을 확인했다. Action ID는 별도 integrity guard가 있으나 Audit ID 중복을 독립 검증하는 guard가 없어, 중복 Audit ID가 존재할 경우 exact lineage의 전제가 깨질 수 있었다.

조치:
- `audit-id-integrity-guard.js` 추가.
- `hd20AuditRandomDrawsV1`의 `id || drawId || auditDrawId` canonical Audit ID를 기준으로 중복을 검출한다.
- `unique(id)`와 `exact(id)`는 정확히 1건일 때만 성공하며 중복이면 fail-closed한다.
- `final-layout-polish.js`에서 guard를 로드한다.

이번 단계는 기존 Audit 데이터를 자동 수정/삭제하지 않는다. 서버 강제 empty write를 추가하지 않으며 production/Supabase 저장정책도 변경하지 않는다.

다음 단계: Trace 원본의 Audit 역참조가 이 integrity contract를 직접 사용하도록 연결하고, recurrence unknown 원천 판정도 fail-closed로 통합한다.