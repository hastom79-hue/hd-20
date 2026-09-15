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
function linkedActionIdFromCaseModal(m){if(!m)return'';const fields=[...m.querySelectorAll('.hd20ExactFields>div')];const f=fields.find(x=>txt(x.querySelector('small')?.textContent)==='원천 Audit ID');return txt(f?.querySelector('b')?.textContent)}
function guardExactCaseModal(){const m=document.querySelector('#hd20ExactCaseDetail.on');if(!m)return true;const id=linkedActionIdFromCaseModal(m);if(!id)return true;if(unique(id))return true;m.classList.remove('on');window.dispatchEvent(new CustomEvent('hd20-audit-identity-blocked',{detail:{id,source:'exact-case'}}));return false}
function guardTraceRows(){document.querySelectorAll('#hd20ExactTraceModal.on .hd20ExactTable tbody tr').forEach(tr=>{const cells=tr.children;if(cells.length<5)return;const id=txt(cells[0]?.textContent);if(!id||unique(id))return;tr.dataset.auditIdentityBlocked='1';tr.querySelectorAll('button').forEach(b=>{b.disabled=true;b.setAttribute('aria-disabled','true')});const state=cells[5]?.querySelector?.('.hd20TraceState');if(state){state.textContent='Audit ID 중복';state.className='hd20TraceState hd20TraceState-unverified'}})}
function reconcile(){patchTraceApi();guardExactCaseModal();guardTraceRows()}
function boot(){reconcile();queueMicrotask(reconcile);setTimeout(reconcile,0);setTimeout(reconcile,250)}
window.addEventListener('hd20-action-updated',reconcile);window.addEventListener('hd20-audit-updated',reconcile);window.addEventListener('hd20-db-synced',reconcile);document.addEventListener('click',e=>{if(e.target?.closest?.('[data-hd20-trace],[data-prod-case],[data-key="audit"],[data-key="action"]'))setTimeout(reconcile,0)},true);const mo=new MutationObserver(()=>{if(document.querySelector('#hd20ExactTraceModal.on,#hd20ExactCaseDetail.on'))setTimeout(reconcile,0)});mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});document.addEventListener('DOMContentLoaded',boot,{once:true});if(document.readyState!=='loading')boot();
window.HD20_AUDIT_ID_INTEGRITY={validate,duplicates,unique,exact,auditForAction,patchTraceApi,reconcile};
})();