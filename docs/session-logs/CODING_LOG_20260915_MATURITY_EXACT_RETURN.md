# HD-20 코딩일지 — 고도화 맵 Exact 복귀 강화 2026-09-15

## 변경 코드
`hd20-maturity-map-operational-guard.js`

기존 복귀는 다음처럼 Activity ID의 첫 DOM match를 사용했다.
```js
$(`[data-activity-id="${CSS.escape(r.id)}"]`,root)
```

변경 후 `returnCandidates()`가 저장된 return context의 `id`와 `team`을 동시에 검사한다. `restoreReturnFocus()`는 match가 정확히 1건인 경우에만 복귀한다.

```js
const matches=returnCandidates(r,root);
if(matches.length!==1)return false;
const btn=matches[0];
```

`validate()`에 아래 런타임 검증값을 추가했다.
- `returnMatches`
- `returnExactSafe`

## Cache chain
- operational guard `v=20260915-1`
- final layout loader `v=20260915-2`

## Commit
- `8ef85351c5bc923e67036105b8b43174aca1ac03`
- `01e5e62a2e97914e06c8cd431b2eb64dd83068e2`
- `674f7804da27132dfe2f1e6064a6339500324361`
- `cbc27fe85aafedd93c12ebb7f0c5c75fa467557a`

`01e5e62...` 작성 중 Action Audit Prefill loader 경로가 잘못 입력된 것을 즉시 검출했고 다음 commit `674f780...`에서 원래 `action-audit-prefill-guard.js` 경로로 복구했다. 최종 loader에는 해당 회귀가 남아 있지 않다.

## 불변조건
Production 보호, sanitize 정책, exact Audit lineage, 중복 Activity ID 차단 로직은 변경하지 않았다. 서버측 강제 빈 배열 write는 추가하지 않았다.