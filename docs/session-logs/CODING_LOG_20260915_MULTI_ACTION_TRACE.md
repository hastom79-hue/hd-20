# CODING LOG — 2026-09-15 Multi Action Trace

## `audit-action-case-trace.js`
기존:
```js
function linkedAction(draw,actions){
  const id=auditId(draw);
  return id?actions.find(a=>actionSourceId(a)===id)||null:null
}
function rows(){
  const actions=load(ACTION_KEY);
  return load(DRAW_KEY).filter(d=>d.auditDate).map(d=>({draw:d,action:linkedAction(d,actions)}))
}
```

변경:
```js
function linkedActions(draw,actions){
  const id=auditId(draw);
  return id?actions.filter(a=>actionSourceId(a)===id):[]
}
function linkedAction(draw,actions){
  return linkedActions(draw,actions)[0]||null
}
function rows(){
  const actions=load(ACTION_KEY);
  return load(DRAW_KEY).filter(d=>d.auditDate).flatMap(draw=>{
    const links=linkedActions(draw,actions);
    return links.length?links.map(action=>({draw,action})):[{draw,action:null}]
  })
}
```

Exact key는 그대로 유지한다.
- Audit: `id || drawId || auditDrawId`
- Action source: `auditDrawId || sourceCaseId`
- 비교: `===`

따라서 1 Audit : N Action에서도 모든 Action이 별도 row로 노출되며, 0 Action Audit도 사라지지 않는다.

## `hd20-maturity-map-operational-guard.js` cache chain
현재 source의 `returnCandidates(r, root)`는 저장된 `team`이 존재하면 동일 Activity ID 후보 중 동일 team만 허용한다. `restoreReturnFocus()`는 후보 수가 정확히 1일 때만 포커스 후 return context를 지운다. 이 최신 source 적용을 위해 `final-layout-polish.js`의 loader를 다음처럼 갱신했다.

```text
hd20-maturity-map-operational-guard.js?v=20260915-2
```

## 안전성
- fuzzy lineage 없음.
- production-only guard 변경 없음.
- DB write path 변경 없음.
- server forced empty write 없음.

## 커밋
- `80a8a1a7b18966534ecc4f2f99a72acaf2b055a4`
- `cd6c5e3a7cda8340cb11d255b497e78a3114aba0`
