(()=>{'use strict';
const KEY='hd20GMES5SAutoImproveRawV1',HEADCOUNT_KEY='hd20TeamHeadcountMasterV1';
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function yearOf(v){const m=String(v??'').match(/(20\d{2})/);return m?Number(m[1]):null}
function selectedYear(){const txt=document.querySelector('.controls select')?.textContent||'';const y=yearOf(txt);return y||new Date().getFullYear()}
function isAdvancementType(x){
  const v=String(x?.type||x?.category||x?.sType||x?.['5S구분']||x?.['활동유형']||'').trim();
  return v==='5S 고도화'||v==='고도화'||v==='5S고도화';
}
function isCandidate(x){if(!x)return false;if(!isAdvancementType(x))return false;if(x.candidate===true||x.isCandidate===true)return true;const s=String(x.judgeState||x.status||'').trim();if(!s)return false;if(s==='미확정')return false;return /판정대기|보완요청|확정|후보|검토|대기/.test(s)}
function isConfirmed(x){return !!x&&isAdvancementType(x)&&x.confirmed===true&&String(x.judgeState||'').trim()==='확정'}
function isMaintained(x){if(!isConfirmed(x))return false;return !/중지|부적합|해제|실패/.test(String(x.maintainState||x.auditState||x.status||''))&&x.valid!==false}
function num(v){const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)&&n>0?n:null}
function masterHeadcount(master){const byTeam=new Map();if(Array.isArray(master)){master.forEach((x,i)=>{if(typeof x==='number'){byTeam.set(String(i),x);return}if(!x||typeof x!=='object')return;const team=String(x.team||x.name||x.조직||x.생산팀||i),n=num(x.headcount??x.people??x.head??x.인원??x.현원??x.재적인원);if(n)byTeam.set(team,n)})}else if(master&&typeof master==='object'){Object.entries(master).forEach(([team,v])=>{const n=typeof v==='object'?num(v.headcount??v.people??v.head??v.인원??v.현원??v.재적인원):num(v);if(n)byTeam.set(team,n)})}return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function rowHeadcount(rows){const byTeam=new Map(),keys=['headcount','people','head','인원','현원','재적인원','재직인원'];rows.forEach(x=>{const team=String(x.team||'').trim();if(!team)return;let n=null;for(const k of keys){n=num(x[k]);if(n)break}if(!n&&x.raw&&typeof x.raw==='object'){for(const [k,v] of Object.entries(x.raw)){if(/^(인원|현원|재적인원|재직인원|headcount|people)$/i.test(String(k).replace(/\s/g,''))){n=num(v);if(n)break}}}if(n&&!byTeam.has(team))byTeam.set(team,n)});return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function headcount(rows){let master=null;try{master=JSON.parse(localStorage.getItem(HEADCOUNT_KEY)||'null')}catch{}const fromMaster=masterHeadcount(master)||masterHeadcount(window.HD20_HEADCOUNT_MASTER);return fromMaster||rowHeadcount(rows)||null}
function rowDate(x){return x.date||x.regDate||x.createdAt||x.importedAt||''}
function confirmedDate(x){return x.judgedAt||x.confirmedAt||x.judgeDate||rowDate(x)}
function snapshot(){const rows=load(),year=selectedYear(),activities=rows.filter(x=>yearOf(rowDate(x))===year),candidates=rows.filter(x=>isCandidate(x)&&yearOf(rowDate(x))===year),confirmed=rows.filter(isConfirmed),newSecured=confirmed.filter(x=>yearOf(confirmedDate(x))===year),maintained=confirmed.filter(isMaintained),people=headcount(rows);return{source:KEY,headcountSource:people?HEADCOUNT_KEY:'unavailable',year,rows,activities,candidates,newSecured,confirmed,maintained,headcount:people,perPerson:people?activities.length/people:null}}
/* 운영지표 6종(판정완료율/평균 판정 Lead Time/고도화 수준/6개월 유지율/
 * Audit 부적합 재발률/기한 내 개선조치 완료율)의 단일 정본 계산 함수.
 * approved-landing-v2.js와 hdps-dashboard.js가 각자 이 로직을 복사해
 * 쓰다가, 후자만 5S 고도화 타입 게이트를 우회하는 드리프트가 생겼던 적이
 * 있어(judgmentScope가 isCandidate()가 아니라 원본 필드를 직접 확인) 이
 * 파일 하나로 합친다. 판정완료율은 "5S 고도화로 등록된 건 중 판정이
 * 완료된 비율"만 의미하며, 정리·정돈·청소 등은 애초에 판정 대상이 아니다. */
function pickField(x,keys){for(const k of keys){if(x?.[k]!==undefined&&x[k]!==null&&x[k]!=='')return x[k]}return null}
function asDate(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function daysBetween(a,b){a=asDate(a);b=asDate(b);return a&&b?Math.max(0,Math.round((b-a)/86400000)):null}
function levelOf(x){const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);return v?+v[0]:null}
function pct(n,d){return d?Math.round(n/d*1000)/10:null}
function actionCases(){try{const v=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function operational(s){
  const rows=(s?.rows||[]).filter(isAdvancementType);
  const judgmentScope=rows.filter(x=>x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim());
  const judged=judgmentScope.filter(x=>['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&pickField(x,['judgedAt','judgeDate','confirmedAt']));
  const lead=judged.map(x=>daysBetween(pickField(x,['createdAt','regDate','date','importedAt']),pickField(x,['judgedAt','judgeDate','confirmedAt']))).filter(Number.isFinite);
  const levels=(s?.confirmed||[]).map(levelOf).filter(Number.isFinite);
  const sixResults=(s?.confirmed||[]).map(x=>String(pickField(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState'])||'').trim()).filter(Boolean);
  const sixPass=sixResults.filter(v=>/적합|유효|유지|완료|pass|ok/i.test(v)&&!/부적합|실패|해제|중지/i.test(v)).length;
  const act=actionCases();
  const recRows=act.filter(x=>pickField(x,['recurrence','recurrent','recurrenceState','재발여부'])!==null);
  const recurred=recRows.filter(x=>/true|1|yes|재발|발생/i.test(String(pickField(x,['recurrence','recurrent','recurrenceState','재발여부'])))).length;
  const completed=act.filter(x=>pickField(x,['doneDate','completedDate','finishDate']));
  const ontime=completed.filter(x=>{const done=asDate(pickField(x,['doneDate','completedDate','finishDate'])),due=asDate(pickField(x,['targetDate','due','dueDate']));return done&&due&&done<=due}).length;
  return{
    judgmentRate:pct(judged.length,judgmentScope.length),
    avgLead:lead.length?Math.round(lead.reduce((a,b)=>a+b,0)/lead.length*10)/10:null,
    maturity:levels.length?Math.round(levels.reduce((a,b)=>a+b,0)/levels.length*10)/10:null,
    sixRetention:pct(sixPass,sixResults.length),
    recurrence:pct(recurred,recRows.length),
    actionOnTime:pct(ontime,completed.filter(x=>pickField(x,['targetDate','due','dueDate'])).length)
  };
}
function signal(){window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated',{detail:snapshot()}))}
window.HD20KPIData={KEY,HEADCOUNT_KEY,load,yearOf,selectedYear,isCandidate,isConfirmed,isMaintained,isAdvancementType,rowDate,confirmedDate,headcount,snapshot,operational,signal};
['hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(e=>window.addEventListener(e,()=>setTimeout(signal,0)));window.addEventListener('storage',e=>{if(e.key===KEY||e.key===HEADCOUNT_KEY)signal()});
})();