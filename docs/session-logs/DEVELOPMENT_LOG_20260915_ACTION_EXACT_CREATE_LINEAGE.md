# 2026-09-15 Action exact-create lineage 검증/수정

## 발견 결함
`action-audit-linkage.js`의 기존 `patchCreated()`는 등록 직전 Action ID 집합과 등록 직후 배열을 비교한 뒤 `find()`로 첫 신규 행을 선택했다. 따라서 동일한 짧은 구간에 별도 Action 생성이 겹치면 Audit 원천 ID가 이번 클릭으로 생성된 Action이 아닌 다른 신규 Action에 연결될 수 있는 동시성 위험이 있었다.

## 수정
- 등록 클릭 capture 단계에서 `beforeIds`, Audit source snapshot, due 수동지정 여부를 하나의 registration attempt로 고정한다.
- 실제 `action-mail-workflow.js`가 Action 저장 직후 발생시키는 `hd20-action-updated`의 `detail.id`를 받아 해당 ID의 신규 Action만 exact patch한다.
- event ID를 사용할 수 없는 fallback에서는 신규 행이 정확히 1건일 때만 patch한다. 신규 행이 복수이면 임의 첫 행을 선택하지 않고 fail-closed 한다.
- linkage 자체가 재발행하는 `source=audit-action-linkage` 이벤트는 재처리하지 않는다.
- 기존 `auditDrawId/sourceCaseId`, sourceStage, 자동 due 정책 및 pending clear 동작은 유지한다.

## 배포/cache
- 기능 수정 commit: `a98e619559e5f23a56af5077378f92af9ba96e90`
- `final-layout-polish.js`: `action-audit-linkage.js?v=20260915-1`
- `index.html`: `final-layout-polish.js?v=20260915-3`

## 불변조건
- server-side forced empty write 추가 없음.
- Production/non-production sanitize 정책 변경 없음.
- team/workplace fuzzy matching을 lineage 식별에 사용하지 않음.

## 검증 판단
Action 등록 구현은 저장 직후 `hd20-action-updated`에 실제 생성 ID를 제공하므로 exact ID 결합 경로가 성립한다. GitHub Actions runner 선행 장애가 지속 중이므로 브라우저 E2E 통과로 표현하지 않는다.