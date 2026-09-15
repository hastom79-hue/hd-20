(()=>{'use strict';
const KEY='hd20AuditRandomDrawsV1';
const txt=v=>String(v??'').trim();
const auditId=x=>txt(x?.id||x?.drawId||x?.auditDrawId);
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function duplicates(rows=load()){const seen=new Map(),dups=new Set();for(const row of rows){const id=auditId(row);if(!id)continue;const n=(seen.get(id)||0)+1;seen.set(id,n);if(n>1)dups.add(id)}return[...dups]}
function unique(id,rows=load()){id=txt(id);return !!id&&rows.filter(r=>auditId(r)===id).length===1}
function validate(){const rows=load(),duplicateIds=duplicates(rows);return{rows:rows.length,duplicateIds,exactSafe:duplicateIds.length===0}}
function exact(id){const rows=load();return unique(id,rows)?rows.find(r=>auditId(r)===txt(id))||null:null}
window.HD20_AUDIT_ID_INTEGRITY={validate,duplicates,unique,exact};
})();