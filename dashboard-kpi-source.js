(()=>{'use strict';
const KEY='hd20GMES5SAutoImproveRawV1',HEADCOUNT_KEY='hd20TeamHeadcountMasterV1',AUDIT_KEY='hd20AuditRandomDrawsV1';
const LEGACY_TEST_IDS=new Set('DRAW-1788010755791,DRAW-1788010759290,DRAW-1788010760070,DRAW-1788010760500,DRAW-1788010760921,DRAW-1788010761360,DRAW-1788011635587,DRAW-1788011636106,DRAW-1788011636356,DRAW-1788011636538,DRAW-1788011636773,DRAW-1788011636931,DRAW-1788011637126,DRAW-1788011637396,DRAW-1788011637597,DRAW-1788011637788,DRAW-1788011637966,DRAW-1788011638138,DRAW-1788011638487,DRAW-1788011638656,DRAW-1788011638846'.split(','));
/* 검증 모드(?validation=1)에서는 web-validation-fixture 행을 정상 데이터로 취급한다.
   (supabase-sync.js 는 자체 isNonProdRow 를 쓰므로 DB 반입 차단은 그대로 유지됨) */
function isNonProdRow(x){if(x&&typeof x==='object'&&validationMode()&&x.source==='web-validation-fixture')return false;return isNonProdRowBase(x)}
function isNonProdRowBase(x){if(!x||typeof x!=='object')return false;const source=String(x.source||'').toLowerCase(),id=String(x.id||'').toUpperCase(),sourceCaseId=String(x.sourceCaseId||'').toUpperCase(),email=String(x.email||'').toLowerCase(),legacySeedEmail=/^teamlead\d+@example\.com$/i.test(email);return x.isDemo===true||x.isTest===true||source==='demo-seed'||source==='e2e-fixture'||source==='web-validation-fixture'||id.startsWith('DEMO-')||id.startsWith('E2E-')||id.startsWith('VALID-')||id.includes('AUTO-DEMO-')||sourceCaseId.startsWith('DEMO-')||sourceCaseId.startsWith('E2E-')||sourceCaseId.startsWith('VALID-')||email.endsWith('@hd-hyundai-demo.co.kr')||legacySeedEmail||LEGACY_TEST_IDS.has(id)}
function validationMode(){const v=new URL(location.href).searchParams.get('validation');return v!=='0'&&v!=='off'}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?(validationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>!isNonProdRow(x))):[]}catch{return[]}}
function yearOf(v){const m=String(v??'').match(/(20\d{2})/);return m?Number(m[1]):null}
function selectedYear(){const txt=document.querySelector('.controls select')?.textContent||'';const y=yearOf(txt);return y||new Date().getFullYear()}
function isAdvancementType(x){const v=String(x?.type||x?.category||x?.sType||x?.['5S구분']||x?.['활동유형']||'').trim();return v==='5S 고도화'||v==='고도화'||v==='5S고도화'}
function isCandidate(x){if(!x||!isAdvancementType(x))return false;if(x.candidate===true||x.isCandidate===true)return true;const s=String(x.judgeState||x.status||'').trim();if(!s||s==='미확정')return false;return /판정대기|보완요청|확정|후보|검토|대기/.test(s)}
function isConfirmed(x){return !!x&&isAdvancementType(x)&&x.confirmed===true&&String(x.judgeState||'').trim()==='확정'}
function isMaintained(x){if(!isConfirmed(x))return false;return !/중지|부적합|해제|실패/.test(String(x.maintainState||x.auditState||x.status||''))&&x.valid!==false}
function num(v){const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)&&n>0?n:null}
function masterHeadcount(master){const byTeam=new Map();if(Array.isArray(master)){master.forEach((x,i)=>{if(typeof x==='number'){byTeam.set(String(i),x);return}if(!x||typeof x!=='object')return;const team=String(x.team||x.name||x.조직||x.생산팀||i),n=num(x.headcount??x.people??x.head??x.인원??x.현원??x.재적인원);if(n)byTeam.set(team,n)})}else if(master&&typeof master==='object'){Object.entries(master).forEach(([team,v])=>{const n=typeof v==='object'?num(v.headcount??v.people??v.head??v.인원??v.현원??v.재적인원):num(v);if(n)byTeam.set(team,n)})}return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function rowHeadcount(rows){const byTeam=new Map(),keys=['headcount','people','head','인원','현원','재적인원','재직인원'];rows.forEach(x=>{const team=String(x.team||'').trim();if(!team)return;let n=null;for(const k of keys){n=num(x[k]);if(n)break}if(!n&&x.raw&&typeof x.raw==='object'){for(const [k,v] of Object.entries(x.raw)){if(/^(인원|현원|재적인원|재직인원|headcount|people)$/i.test(String(k).replace(/\s/g,''))){n=num(v);if(n)break}}}if(n&&!byTeam.has(team))byTeam.set(team,n)});return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function headcount(rows){let master=null;try{master=JSON.parse(localStorage.getItem(HEADCOUNT_KEY)||'null')}catch{}const fromMaster=masterHeadcount(master)||masterHeadcount(window.HD20_HEADCOUNT_MASTER);return fromMaster||rowHeadcount(rows)||null}
function rowDate(x){return x.date||x.regDate||x.createdAt||x.importedAt||''}
function confirmedDate(x){return x.judgedAt||x.confirmedAt||x.judgeDate||rowDate(x)}
function snapshot(){const rows=load(),year=selectedYear(),activities=rows.filter(x=>yearOf(rowDate(x))===year),candidates=rows.filter(x=>isCandidate(x)&&yearOf(rowDate(x))===year),confirmed=rows.filter(isConfirmed),newSecured=confirmed.filter(x=>yearOf(confirmedDate(x))===year),maintained=confirmed.filter(isMaintained),people=headcount(rows);return{source:KEY,headcountSource:people?HEADCOUNT_KEY:'unavailable',year,rows,activities,candidates,newSecured,confirmed,maintained,headcount:people,perPerson:people?activities.length/people:null}}
function pickField(x,keys){for(const k of keys){if(x?.[k]!==undefined&&x[k]!==null&&x[k]!=='')return x[k]}return null}
function asDate(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function daysBetween(a,b){a=asDate(a);b=asDate(b);return a&&b?Math.max(0,Math.round((b-a)/86400000)):null}
function levelOf(x){const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);return v?+v[0]:null}
function pct(n,d){return d?Math.round(n/d*1000)/10:null}
function txt(v){return String(v??'').trim()}
function actionDone(x){return /완료|확정|종료|종결|close|done/i.test(txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState))}
function actionCompleted(x){return !!pickField(x,['doneDate','completedDate','finishDate'])&&!!txt(x?.action||x?.improvement)&&!!(x?.after||x?.afterEvidence)}
function effectVerified(x){if(x?.effectVerified===true)return true;const v=txt(x?.effectState||x?.effectResult);if(!v||/대기|미검증|미흡|부적합|무효|false|^0$|^N$/i.test(v))return false;return /^(유효|적합|효과확인|효과확인완료|검증완료|완료|true|1|Y)$/i.test(v)}
function recurrenceState(x){if(x?.recurrence===true)return true;if(x?.recurrence===false)return false;const v=txt(x?.recurrenceState??x?.recurrent??x?.['재발여부']);if(!v||/^(미발생|없음|미재발|false|0|no|n)$/i.test(v))return false;return /^(재발|발생|true|1|yes|y)$/i.test(v)}
function recurrenceObserved(x){const v=txt(x?.recurrenceState??x?.recurrent??x?.['재발여부']);if(v)return /^(재발|발생|미발생|없음|미재발|true|false|1|0|yes|no|y|n)$/i.test(v);return typeof x?.recurrence==='boolean'}
function closedLoopRecurrence(x){return actionDone(x)&&effectVerified(x)&&recurrenceState(x)}
function actionCases(){try{const v=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]');return Array.isArray(v)?(validationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>!isNonProdRow(x))):[]}catch{return[]}}
function auditDraws(){try{const v=JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]');return Array.isArray(v)?(validationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>!isNonProdRow(x))):[]}catch{return[]}}
function seoulDateKey(v=new Date()){if(typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v.trim()))return v.trim();const d=v instanceof Date?v:new Date(v);if(Number.isNaN(d.getTime()))return'';return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
function addMonthsKey(v,n){const m=seoulDateKey(v).match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return'';const y=+m[1],mo=+m[2],d=+m[3],total=y*12+(mo-1)+n,ny=Math.floor(total/12),nm=total%12+1,last=new Date(Date.UTC(ny,nm,0)).getUTCDate();return `${ny}-${String(nm).padStart(2,'0')}-${String(Math.min(d,last)).padStart(2,'0')}`}
function auditId(d){return txt(d?.id||d?.drawId||d?.auditDrawId)}
function actionAuditId(a){return txt(a?.auditDrawId||a?.sourceCaseId)}
function sixMonthRetention(){const today=seoulDateKey(),rows=auditDraws().filter(d=>d.auditDate),closed=rows.filter(d=>{const end=addMonthsKey(d.auditDate,6);return !!end&&end<today});if(!closed.length)return null;const act=actionCases();let pass=0;for(const d of closed){const id=auditId(d),linked=id?act.filter(a=>actionAuditId(a)===id):[];const unresolved=linked.some(a=>!actionDone(a));const recurrent=linked.some(closedLoopRecurrence);const finalState=txt(d.finalEvaluation||d.auditFinalState);const failed=finalState==='미흡'||['부적합','실패','해제','중지'].includes(finalState);if(!unresolved&&!recurrent&&!failed)pass++}return pct(pass,closed.length)}
function operational(s){
  const rows=(s?.rows||[]).filter(isAdvancementType);
  const judgmentScope=rows.filter(x=>x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim());
  const judged=judgmentScope.filter(x=>['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&pickField(x,['judgedAt','judgeDate','confirmedAt']));
  const lead=judged.map(x=>daysBetween(pickField(x,['createdAt','regDate','date','importedAt']),pickField(x,['judgedAt','judgeDate','confirmedAt']))).filter(Number.isFinite);
  const levels=(s?.confirmed||[]).map(levelOf).filter(Number.isFinite);
  const act=actionCases(),verified=act.filter(x=>actionDone(x)&&effectVerified(x)),recurrenceScope=verified.filter(recurrenceObserved);
  const recurred=recurrenceScope.filter(recurrenceState).length;
  const completed=act.filter(actionCompleted);
  const ontime=completed.filter(x=>{const done=asDate(pickField(x,['doneDate','completedDate','finishDate'])),due=asDate(pickField(x,['targetDate','due','dueDate','deadline']));return done&&due&&done<=due}).length;
  const timedCompleted=completed.filter(x=>pickField(x,['targetDate','due','dueDate','deadline']));
  return{judgmentRate:pct(judged.length,judgmentScope.length),avgLead:lead.length?Math.round(lead.reduce((a,b)=>a+b,0)/lead.length*10)/10:null,maturity:levels.length?Math.round(levels.reduce((a,b)=>a+b,0)/levels.length*10)/10:null,sixRetention:sixMonthRetention(),recurrence:pct(recurred,recurrenceScope.length),actionOnTime:pct(ontime,timedCompleted.length)}
}
function signal(){window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated',{detail:snapshot()}))}
window.HD20KPIData={KEY,HEADCOUNT_KEY,AUDIT_KEY,load,isNonProdRow,yearOf,selectedYear,isCandidate,isConfirmed,isMaintained,isAdvancementType,rowDate,confirmedDate,headcount,snapshot,operational,sixMonthRetention,recurrenceState,recurrenceObserved,effectVerified,actionCompleted,closedLoopRecurrence,seoulDateKey,signal};
['hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated'].forEach(e=>window.addEventListener(e,()=>setTimeout(signal,0)));window.addEventListener('storage',e=>{if(e.key===KEY||e.key===HEADCOUNT_KEY||e.key===AUDIT_KEY||e.key==='hd20ActionCasesV2')signal()});
})();