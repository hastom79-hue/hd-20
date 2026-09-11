(()=>{'use strict';
const STORE='hd20ActionCasesV2',$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],txt=v=>String(v??'').trim();
function nonProd(x){if(window.HD20KPIData?.isNonProdRow)return window.HD20KPIData.isNonProdRow(x);const source=txt(x?.source).toLowerCase(),id=txt(x?.id).toUpperCase(),sid=txt(x?.sourceCaseId).toUpperCase();return x?.isDemo===true||x?.isTest===true||source==='demo-seed'||source==='e2e-fixture'||id.startsWith('DEMO-')||id.startsWith('E2E-')||sid.startsWith('DEMO-')||sid.startsWith('E2E-')}
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a.filter(x=>!nonProd(x)):[]}catch{return[]}}
function done(x){return /완료|확정|종료|종결|close|done/i.test(txt(x?.status))}
function seoulDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function due(x){return txt(x?.due||x?.targetDate||x?.deadline).slice(0,10)}
function overdue(x){const d=due(x);return !!d&&!done(x)&&d<seoulDate()}
function effect(x){if(x?.effectVerified===true)return true;const v=txt(x?.effectState||x?.effectResult);if(!v||/대기|미검증|미흡|부적합|무효|false|^0$|^N$/i.test(v))return false;return /^(유효|적합|효과확인|효과확인완료|검증완료|완료|true|1|Y)$/i.test(v)}
function recur(x){if(x?.recurrence===true)return true;const v=txt(x?.recurrenceState);if(!v||/^(미발생|없음|미재발|false|0|N)$/i.test(v))return false;return /^(재발|발생|true|1|Y)$/i.test(v)}
function setText(el,v){if(el&&el.textContent!==v)el.textContent=v}
function patchNative(all){const doneRows=all.filter(done),over=all.filter(overdue),wait=all.filter(x=>!done(x)&&!overdue(x));setText($('[data-am-sum="total"]'),`${all.length}건`);setText($('[data-am-sum="done"]'),`${doneRows.length}건`);setText($('[data-am-sum="wait"]'),`${wait.length}건`);setText($('[data-am-sum="over"]'),`${over.length}건`)}
function patchVerify(all){const host=$('#hd20ActionVerifyStatus');if(!host)return false;const doneRows=all.filter(done),verified=doneRows.filter(effect),pending=doneRows.filter(x=>!effect(x)),recurRows=verified.filter(recur),vals=[all.length,all.length-doneRows.length,doneRows.length,verified.length,recurRows.length],cards=$$('.awKpis>div b',host);cards.forEach((b,i)=>{if(vals[i]!==undefined)setText(b,`${vals[i]}건`)});const hint=$('.awHint',host),text=pending.length?`완료 ${doneRows.length}건 중 효과검증 미입력 ${pending.length}건은 검증 대기 상태입니다.`:doneRows.length?'완료된 개선조치는 모두 효과검증 결과가 입력되어 있습니다.':'완료된 개선조치가 없어 효과검증 대상이 없습니다.';setText(hint,text);host.dataset.canonicalProduction='1';return true}
function patch(){const all=rows();patchNative(all);patchVerify(all);return true}
let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;patch()})}
function bind(){['hd20-subtab-changed','hd20-action-updated','hd20-refresh-requested','storage'].forEach(ev=>window.addEventListener(ev,schedule));new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});schedule()}
window.HD20_ACTION_VERIFY_CANONICAL={patch,rows,done,overdue,effect,recur};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',bind,{once:true}):bind();
})();