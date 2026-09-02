(()=>{'use strict';
const AUDIT_KEY='hd20AuditRandomDrawsV1',ACTION_KEY='hd20ActionCasesV2';
function load(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function date(v){if(!v)return null;const d=new Date(v);if(Number.isNaN(d.getTime()))return null;d.setHours(0,0,0,0);return d}
function addMonths(v,n=6){const d=date(v);if(!d)return null;const day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));return d}
function actionDone(a){return /완료|종결|close|done/i.test(String(a.status||''))}
function actionOverdue(a){const due=date(a.due||a.targetDate||a.dueDate);return !actionDone(a)&&due&&due<date(new Date())}
function calc(){const now=date(new Date());return load(AUDIT_KEY).map(d=>{const start=date(d.auditDate),end=start?addMonths(start,6):null;return{...d,label:start?(end>=now?'Audit 후 6개월 지속관리':'6개월 관리 종료'):'Audit 실시 대기',date:start||date(d.date),start,end,state:start?(end>=now?'관리중':'종료평가'):'실시대기',diff:end?Math.ceil((end-now)/86400000):null}})}
function summary(){const all=calc(),acts=load(ACTION_KEY),flat=all.map(x=>({...x,team:x.team||'',workplace:x.workplace||'',title:x.title||''}));return{all,flat,one:[],three:[],six:[],due:acts.filter(a=>!actionDone(a)&&!actionOverdue(a)),over:acts.filter(actionOverdue),pending:flat.filter(x=>x.state==='실시대기'),active:flat.filter(x=>x.state==='관리중'),closed:flat.filter(x=>x.state==='종료평가')}}
function run(){const s=summary();window.dispatchEvent(new CustomEvent('hd20-followup-updated',{detail:s}));return s}
window.HD20MaturityFollowup={AUDIT_KEY,ACTION_KEY,load,addMonths,calc,summary,run,compatibilityAdapter:true};
['hd20-audit-draw','hd20-audit-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(run,0)));
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>setTimeout(run,0),{once:true}):setTimeout(run,0);
})();