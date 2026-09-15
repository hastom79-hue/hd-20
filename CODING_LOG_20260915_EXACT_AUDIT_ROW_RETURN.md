# HD-20 코딩일지 — Exact Audit Row Return 강화 (2026-09-15)

## 변경 전
```js
const rows=$$('tbody tr',root);
const row=rows.find(tr=>$$('td',tr).some(td=>txt(td.textContent)===id));
```
행 전체 셀에서 exact text를 찾았기 때문에 Audit ID가 아닌 다른 셀이 우연히 같은 문자열이면 잘못된 행을 선택할 여지가 있었다.

## 변경 후
`audit-close-evaluation.js`가 각 실제 row에 canonical Audit ID를 명시한다.
```html
<tr data-audit-id="...">
```

`hd20-trace-backlink-guard.js`는 row identity만 비교한다.
```js
const row=$$('tbody tr[data-audit-id]',root)
  .find(tr=>txt(tr.dataset.auditId)===id);
```

## Commit
- Audit row identity: `75330c8f134403d4d15f7b1aa6d6fc6b1f1f305d`
- Trace backlink exact selector: `675e919bc1802b7504d5fc9f46df0e8b37ec1dc2`
- Dynamic cache refresh: `be7aa15e22901ba5afa69bee18f5403752e3a728`

## 회귀 방지
- `sourceAuditId()`는 `원천 Audit ID` 필드만 읽는다.
- `goBack()`은 Audit/retention으로 이동 후 최대 30회 bounded retry한다.
- Audit row rendering의 사용자 표시값과 종료평가 저장 로직은 유지한다.
- non-production 제외 규칙은 유지한다.
- Supabase 관련 코드는 수정하지 않았다.
