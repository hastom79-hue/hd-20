# Development Log — 2026-09-15 Audit Identity UI Fail-Closed

자동 위험제거 순환에서 Trace 원본 lexical `auditForAction()`의 first-match 위험이 public API patch만으로는 완전히 차단되지 않는 잔여위험을 확인했다.

조치:
- `audit-id-integrity-guard.js`를 v3로 강화.
- Exact Case Detail의 `원천 Audit ID`가 canonical Audit store에서 정확히 1건이 아니면 상세창을 닫고 `hd20-audit-identity-blocked` 이벤트를 발생시킨다.
- Exact Trace 행의 Audit ID가 유일하지 않으면 해당 행을 `Audit ID 중복` 상태로 표시하고 행 내 버튼을 비활성화한다.
- Trace public API의 `auditForAction`은 계속 exactly-one contract로 재패치한다.
- DB sync / Audit / Action 갱신 및 modal mutation 이후 재검증한다.

이 조치는 기존 Audit 데이터를 자동 삭제/재번호화하지 않으며 ambiguous identity의 사용만 fail-closed한다. 서버 강제 empty write는 추가하지 않았다.

잔여: 대형 minified `hd20-trace-production-guard.js` lexical 함수 자체는 아직 first-match 구현이므로, 안전한 전체 원본 교체가 가능할 때 제거 대상이다. 현재 UI/public API 경로는 별도 guard로 차단한다.