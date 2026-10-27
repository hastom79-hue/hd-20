# DEVELOPMENT LOG — Action ID Integrity (2026-09-15)

## 검증 배경
Action 등록 ID가 `cases().length + 1`로 생성되어, 삭제/과거 데이터 공백/중복 상태에서 기존 `IMP-YYYYMMDD-NNN`과 충돌할 수 있는 잔여 위험을 확인했다.

## 반영
- `action-id-integrity-guard.js` 신규 추가.
- `action-mail-register` 이벤트에서 방금 생성된 ID가 저장소에 2건 이상 존재할 때만 동작한다.
- Action 등록 로직이 `unshift`로 신규 Case를 첫 위치에 저장하는 현재 계약을 사용해 신규 행을 특정한다.
- 동일 날짜 prefix의 실제 기존 suffix 최대값 + 1로 신규 고유 ID를 재할당한다.
- 재할당 후 `hd20-action-updated`를 새 정확 ID로 다시 발생시켜 `action-audit-linkage.js`의 fail-closed 등록 시도와 연결한다.
- 기존 정상 ID는 변경하지 않는다.
- `validate()`로 현재 중복 ID 목록과 exactSafe를 확인할 수 있다.

## 안전성
서버 강제 빈 쓰기 없음. Supabase 쓰기 로직 변경 없음. 기존 데이터 전체 재번호 부여 없음. 신규 등록 중 실제 중복이 발생한 경우에만 로컬 Case ID를 보정한다.

## 잔여 한계
서로 다른 브라우저/탭이 완전히 동시에 stale localStorage 상태에서 등록하고 한쪽 저장이 다른 쪽을 덮어쓰는 lost-update는 클라이언트 단독 ID guard로 원자적으로 해결할 수 없다. 이번 수정은 저장소에 중복 행이 실제 공존하는 경우의 Exact Trace 모호성을 제거한다.