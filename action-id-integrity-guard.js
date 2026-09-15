(()=>{'use strict';
const KEY='hd20ActionCasesV2';
const txt=v=>String(v??'').trim();
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v))}
function nextId(rows,baseId){const m=txt(baseId).match(/^(IMP-\d{8}-)(\d+)$/);if(!m)return'';const prefix=m[1];let max=0;rows.forEach(x=>{const mm=txt(x?.id).match(/^(IMP-\d{8}-)(\d+)$/);if(mm&&mm[1]===prefix)max=Math.max(max,Number(mm[2])||0)});let n=max+1,id;do{id=prefix+String(n++).padStart(3,'0')}while(rows.some(x=>txt(x?.id)===id));return id}
function repairCreated(e){if(e.detail?.source!=='action-mail-register')return;const id=txt(e.detail?.id);if(!id)return;const rows=load(),matches=[];rows.forEach((x,i)=>{if(txt(x?.id)===id)matches.push(i)});if(matches.length<=1)return;const createdIndex=matches[0],newId=nextId(rows,id);if(!newId)return;rows[createdIndex].id=newId;save(rows);window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'action-id-integrity-guard',id:newId,replacedId:id}}))}
function validate(){const rows=load(),seen=new Set(),duplicates=[];rows.forEach(x=>{const id=txt(x?.id);if(!id)return;if(seen.has(id)&&!duplicates.includes(id))duplicates.push(id);seen.add(id)});return{rows:rows.length,duplicates,exactSafe:duplicates.length===0}}
window.addEventListener('hd20-action-updated',repairCreated);
window.HD20_ACTION_ID_INTEGRITY={validate,repairCreated};
})();