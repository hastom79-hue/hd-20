# Coding Log — 2026-09-15 Action exact-create lineage

## action-audit-linkage.js
기존 신규 Action 선택:
- `all.find(c => !beforeIds.has(String(c.id)))`

수정 후:
- click capture 시 registration attempt 생성
- `hd20-action-updated.detail.id`를 exact created ID로 사용
- `patchCreated(beforeIds, sourceSnapshot, manualDue, createdId)`는 `createdId`와 일치하면서 beforeIds에 없던 행만 선택
- createdId가 없는 fallback은 `unseen.length === 1`일 때만 허용
- 복수 unseen 행은 patch하지 않아 잘못된 Audit lineage 연결을 차단
- `source === 'audit-action-linkage'` 이벤트는 recursion 방지를 위해 제외

## Cache chain
- `action-audit-linkage.js?v=20260915-1`
- `final-layout-polish.js?v=20260915-3`

## Commits
- functional: `a98e619559e5f23a56af5077378f92af9ba96e90`
- loader: `4fcbeb1d2428b0de424e57eedd43f2749416ae60`
- top-level cache: `7d0d4b6b894b55b499abcc3362466b386d8bbea8`

## Safety
서버 강제 empty write, fuzzy team/workplace lineage, Production sanitize 정책은 변경하지 않았다.