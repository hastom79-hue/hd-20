(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ACTION_STORE='hd20ActionCasesV2';
function read(){try{const v=JSON.parse(localStorage.getItem(ACTION_STORE)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function txt(v){return String(v??'').trim()}
function status(x){return txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState)}
function isDone(x){return /완료|확정|종료/.test(status(x))}
function seoulDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function overdue(x){const d=txt(x?.due||x?.targetDate||x?.deadline);return !!d&&!isDone(x)&&d<seoulDate()}
function effectVerified(x){return x?.effectVerified===true||/유효|효과확인|검증완료|완료/.test(txt(x?.effectState))}
function recurrence(x){return x?.recurrence===true||/재발|발생/.test(txt(x?.recurrenceState))}
function completedVerified(rows){return rows.filter(x=>isDone(x)&&effectVerified(x))}
function completedRecurrence(rows){return rows.filter(x=>isDone(x)&&effectVerified(x)&&recurrence(x))}
function patchMetrics(){const st=window.HD20_SUBNAV?.state?.();if(!st)return;const actions=read(),buttons=$$('#hd20OpsMetrics button');if(!buttons.length)return;if(st.area==='dashboard'&&st.sub==='summary'&&buttons[3])buttons[3].querySelector('b').innerHTML=`${actions.filter(overdue).length}<em>건</em>`;if(st.area==='action'&&st.sub==='manage'&&buttons[3])buttons[3].querySelector('b').innerHTML=`${actions.filter(overdue).length}<em>건</em>`;if(st.area==='action'&&st.sub==='verify'){const done=actions.filter(isDone),verified=completedVerified(actions),recur=completedRecurrence(actions),vals=[done.length,verified.length,done.length-verified.length,recur.length];buttons.forEach((b,i)=>{if(vals[i]!==undefined)b.querySelector('b').innerHTML=`${vals[i]}<em>건</em>`})}}
function patchTrace(){const modal=$('#hd20TraceModal.on');if(!modal)return;const actions=read(),summary=$$('.hd20TraceSummary b',modal);if(summary[2])summary[2].textContent=`효과검증 완료 ${completedVerified(actions).length}건`;if(summary[3])summary[3].textContent=`재발 ${completedRecurrence(actions).length}건`}
function run(){patchMetrics();patchTrace()}
function bind(){['hd20-subtab-changed','hd20-action-updated','hd20-refresh-requested','storage'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(run,40)));const mo=new MutationObserver(()=>run());mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setTimeout(run,300)}
window.HD20_OPERATIONAL_INTEGRITY={seoulDate,overdue,completedVerified,completedRecurrence,run};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();