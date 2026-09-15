(()=>{'use strict';
const KEY='hd20AuditRandomDrawsV1';
const txt=v=>String(v??'').trim();
const auditId=x=>txt(x?.id||x?.drawId||x?.auditDrawId);
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function duplicates(rows=load()){const seen=new Map(),dups=new Set();for(const row of rows){const id=auditId(row);if(!id)continue;const n=(seen.get(id)||0)+1;seen.set(id,n);if(n>1)dups.add(id)}return[...dups]}
function unique(id,rows=load()){id=txt(id);return !!id&&rows.filter(r=>auditId(r)===id).length===1}
function validate(){const rows=load(),duplicateIds=duplicates(rows);return{rows:rows.length,duplicateIds,exactSafe:duplicateIds.length===0}}
function exact(id,rows=load()){id=txt(id);if(!id)return null;const matches=rows.filter(r=>auditId(r)===id);return matches.length===1?matches[0]:null}
function sourceId(action){return txt(action?.auditDrawId||action?.sourceCaseId)}
function auditForAction(action,audits=load()){const id=sourceId(action);return id?exact(id,Array.isArray(audits)?audits:[]):null}
function patchTraceApi(){const api=window.HD20_TRACE_PRODUCTION;if(api)api.auditForAction=auditForAction;const exactApi=window.HD20_TRACE_EXACT;if(exactApi)exactApi.auditForAction=auditForAction}
function boot(){patchTraceApi();queueMicrotask(patchTraceApi);setTimeout(patchTraceApi,0);setTimeout(patchTraceApi,250)}
window.addEventListener('hd20-action-updated',patchTraceApi);window.addEventListener('hd20-audit-updated',patchTraceApi);document.addEventListener('DOMContentLoaded',boot,{once:true});if(document.readyState!=='loading')boot();
window.HD20_AUDIT_ID_INTEGRITY={validate,duplicates,unique,exact,auditForAction,patchTraceApi};
})();