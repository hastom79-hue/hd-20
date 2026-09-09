(()=>{'use strict';
const CASE_KEY='hd20ActionCasesV2';
let normalizing=false;
function load(){try{const v=JSON.parse(localStorage.getItem(CASE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(v){localStorage.setItem(CASE_KEY,JSON.stringify(v))}
function currentCaseId(){return document.getElementById('amResponse')?.dataset?.id||''}
function hasAfterEvidence(c){const after=document.getElementById('amAfter')?.dataset?.data||'',extra=document.getElementById('amAfterEv')?.dataset?.data||'';return !!(after||extra||c?.after||c?.afterEvidence)}
function guardCompletion(e){const btn=e.target?.closest?.('#amSaveResponse');if(!btn)return;const status=document.getElementById('amDoneStatus')?.value||'',id=currentCaseId();if(status!=='완료'||!id)return;const c=load().find(x=>String(x.id)===String(id));if(hasAfterEvidence(c))return;e.preventDefault();e.stopImmediatePropagation();alert('완료 처리하려면 AFTER Evidence를 등록해 주세요. 진행/부분완료 상태는 Evidence 없이 저장할 수 있습니다.')}
function normalizeResponse(e){if(normalizing||e.detail?.source!=='action-mail-response')return;const id=e.detail?.id;if(!id)return;const rows=load(),c=rows.find(x=>String(x.id)===String(id));if(!c)return;let changed=false;if(String(c.status||'')!=='완료'){
  if(c.doneDate){c.responseDate=c.doneDate;delete c.doneDate;changed=true}
  if(c.completedDate){delete c.completedDate;changed=true}
}else if(c.doneDate&&!c.completedDate){c.completedDate=c.doneDate;changed=true}
if(!changed)return;normalizing=true;try{save(rows);window.dispatchEvent(new CustomEvent('hd20-action-updated',{detail:{source:'action-data-integrity-guard',id:c.id}}))}finally{normalizing=false}}
function bind(){document.addEventListener('click',guardCompletion,true);window.addEventListener('hd20-action-updated',normalizeResponse)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();