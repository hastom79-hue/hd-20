(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ACTION_STORE='hd20ActionCasesV2';
let scheduled=false,running=false;
function read(){try{const v=JSON.parse(localStorage.getItem(ACTION_STORE)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function txt(v){return String(v??'').trim()}
function status(x){return txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState)}
function isDone(x){return /완료|확정|종료|종결|close|done/i.test(status(x))}
function seoulDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function utcDate(){return new Date().toISOString().slice(0,10)}
function overdue(x){const d=txt(x?.due||x?.targetDate||x?.deadline);return !!d&&!isDone(x)&&d<seoulDate()}
function effectVerified(x){if(x?.effectVerified===true)return true;const v=txt(x?.effectState||x?.effectResult);if(!v||/대기|미검증|미흡|부적합|무효|false|^0$|^N$/i.test(v))return false;return /^(유효|적합|효과확인|효과확인완료|검증완료|완료|true|1|Y)$/i.test(v)}
function recurrence(x){if(x?.recurrence===true)return true;const v=txt(x?.recurrenceState);if(!v||/^(미발생|없음|미재발|false|0|N)$/i.test(v))return false;return /^(재발|발생|true|1|Y)$/i.test(v)}
function completedVerified(rows){return rows.filter(x=>isDone(x)&&effectVerified(x))}
function completedRecurrence(rows){return rows.filter(x=>isDone(x)&&effectVerified(x)&&recurrence(x))}
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
function setHtml(el,value){if(el&&el.innerHTML!==value)el.innerHTML=value}
function metricValue(button,value){const b=button?.querySelector('b');if(b)setHtml(b,`${value}<em>건</em>`)}
function patchActivityDate(){const input=$('#awDate');if(!input)return;const seoul=seoulDate(),utc=utcDate();if(!input.dataset.hd20KstChecked){if(!input.value||input.value===utc)input.value=seoul;input.dataset.hd20KstChecked='1'}}
function ensureActivitySaveDate(e){const b=e.target?.closest?.('[data-aw="save"]');if(!b)return;const input=$('#awDate');if(input&&!input.value)input.value=seoulDate()}
function patchNativeActionSummary(actions){const total=$('[data-am-sum="total"]'),doneEl=$('[data-am-sum="done"]'),waitEl=$('[data-am-sum="wait"]'),overEl=$('[data-am-sum="over"]');if(!total&&!doneEl&&!waitEl&&!overEl)return;const done=actions.filter(isDone),over=actions.filter(overdue),wait=actions.filter(x=>!isDone(x)&&!overdue(x));setText(total,actions.length+'건');setText(doneEl,done.length+'건');setText(waitEl,wait.length+'건');setText(overEl,over.length+'건')}
function patchMetrics(){const st=window.HD20_SUBNAV?.state?.();const actions=read();patchNativeActionSummary(actions);if(!st)return;const buttons=$$('#hd20OpsMetrics button');if(!buttons.length)return;if(st.area==='dashboard'&&st.sub==='summary'&&buttons[3])metricValue(buttons[3],actions.filter(overdue).length);if(st.area==='action'&&st.sub==='manage'&&buttons[3])metricValue(buttons[3],actions.filter(overdue).length);if(st.area==='action'&&st.sub==='verify'){const done=actions.filter(isDone),verified=completedVerified(actions),recur=completedRecurrence(actions),vals=[done.length,verified.length,done.length-verified.length,recur.length];buttons.forEach((b,i)=>{if(vals[i]!==undefined)metricValue(b,vals[i])})}}
function patchTrace(){const modal=$('#hd20TraceModal.on');if(!modal)return;const actions=read(),summary=$$('.hd20TraceSummary b',modal);if(summary[2])setText(summary[2],`효과검증 완료 ${completedVerified(actions).length}건`);if(summary[3])setText(summary[3],`재발 ${completedRecurrence(actions).length}건`)}
function patchActionDetailGrid(){const modal=$('#hd20UniversalGridModal.on');if(!modal)return;const actions=read();$$('.hd20GridSection',modal).forEach(sec=>{const title=txt(sec.querySelector('h3')?.textContent);if(!/개선조치 원천목록|효과·재발 검증 원천목록/.test(title))return;const table=$('table',sec);if(!table)return;const head=$('thead tr',table);if(!head)return;const headers=$$('th',head).map(th=>txt(th.textContent));const idIndex=headers.indexOf('Action ID');if(idIndex<0||headers.includes('담당'))return;['담당','기한','BEFORE','AFTER'].forEach(label=>{const th=document.createElement('th');th.textContent=label;head.appendChild(th)});$$('tbody tr',table).forEach(tr=>{const cells=$$('td',tr),id=txt(cells[idIndex]?.textContent),a=actions.find(x=>txt(x?.id)===id);const values=a?[a.owner||a.manager||a.team||'—',a.due||a.targetDate||a.deadline||'—',(a.before||a.evidence)?'등록됨':'미등록',(a.after||a.afterEvidence)?'등록됨':'미등록']:['—','—','—','—'];values.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td)})})})}
function run(){if(running)return;running=true;try{patchActivityDate();patchMetrics();patchTrace();patchActionDetailGrid()}finally{running=false}}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;run()})}
function bind(){['hd20-subtab-changed','hd20-action-updated','hd20-refresh-requested','storage'].forEach(ev=>window.addEventListener(ev,schedule));document.addEventListener('click',ensureActivitySaveDate,true);const mo=new MutationObserver(schedule);mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setTimeout(schedule,300)}
window.HD20_OPERATIONAL_INTEGRITY={seoulDate,utcDate,overdue,effectVerified,recurrence,completedVerified,completedRecurrence,patchActivityDate,patchNativeActionSummary,patchActionDetailGrid,run,schedule};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();