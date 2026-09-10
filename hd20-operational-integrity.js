(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ACTION_STORE='hd20ActionCasesV2';
function read(){try{const v=JSON.parse(localStorage.getItem(ACTION_STORE)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function txt(v){return String(v??'').trim()}
function status(x){return txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState)}
function isDone(x){return /완료|확정|종료|종결|close|done/i.test(status(x))}
function seoulDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function overdue(x){const d=txt(x?.due||x?.targetDate||x?.deadline);return !!d&&!isDone(x)&&d<seoulDate()}
function effectVerified(x){if(x?.effectVerified===true)return true;const v=txt(x?.effectState||x?.effectResult);if(!v||/대기|미검증|미흡|부적합|무효|false|^0$|^N$/i.test(v))return false;return /^(유효|적합|효과확인|효과확인완료|검증완료|완료|true|1|Y)$/i.test(v)}
function recurrence(x){if(x?.recurrence===true)return true;const v=txt(x?.recurrenceState);if(!v||/^(미발생|없음|미재발|false|0|N)$/i.test(v))return false;return /^(재발|발생|true|1|Y)$/i.test(v)}
function completedVerified(rows){return rows.filter(x=>isDone(x)&&effectVerified(x))}
function completedRecurrence(rows){return rows.filter(x=>isDone(x)&&effectVerified(x)&&recurrence(x))}
function patchNativeActionSummary(actions){const total=$('[data-am-sum="total"]'),doneEl=$('[data-am-sum="done"]'),waitEl=$('[data-am-sum="wait"]'),overEl=$('[data-am-sum="over"]');if(!total&&!doneEl&&!waitEl&&!overEl)return;const done=actions.filter(isDone),over=actions.filter(overdue),wait=actions.filter(x=>!isDone(x)&&!overdue(x));if(total)total.textContent=actions.length+'건';if(doneEl)doneEl.textContent=done.length+'건';if(waitEl)waitEl.textContent=wait.length+'건';if(overEl)overEl.textContent=over.length+'건'}
function patchMetrics(){const st=window.HD20_SUBNAV?.state?.();const actions=read();patchNativeActionSummary(actions);if(!st)return;const buttons=$$('#hd20OpsMetrics button');if(!buttons.length)return;if(st.area==='dashboard'&&st.sub==='summary'&&buttons[3])buttons[3].querySelector('b').innerHTML=`${actions.filter(overdue).length}<em>건</em>`;if(st.area==='action'&&st.sub==='manage'&&buttons[3])buttons[3].querySelector('b').innerHTML=`${actions.filter(overdue).length}<em>건</em>`;if(st.area==='action'&&st.sub==='verify'){const done=actions.filter(isDone),verified=completedVerified(actions),recur=completedRecurrence(actions),vals=[done.length,verified.length,done.length-verified.length,recur.length];buttons.forEach((b,i)=>{if(vals[i]!==undefined)b.querySelector('b').innerHTML=`${vals[i]}<em>건</em>`})}}
function patchTrace(){const modal=$('#hd20TraceModal.on');if(!modal)return;const actions=read(),summary=$$('.hd20TraceSummary b',modal);if(summary[2])summary[2].textContent=`효과검증 완료 ${completedVerified(actions).length}건`;if(summary[3])summary[3].textContent=`재발 ${completedRecurrence(actions).length}건`}
function run(){patchMetrics();patchTrace()}
function bind(){['hd20-subtab-changed','hd20-action-updated','hd20-refresh-requested','storage'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(run,40)));const mo=new MutationObserver(()=>run());mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setTimeout(run,300)}
window.HD20_OPERATIONAL_INTEGRITY={seoulDate,overdue,effectVerified,recurrence,completedVerified,completedRecurrence,patchNativeActionSummary,run};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();