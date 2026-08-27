(()=>{'use strict';
const KEY='hd20GMES5SAutoImproveRawV1',HEADCOUNT_KEY='hd20TeamHeadcountMasterV1';
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function yearOf(v){const m=String(v??'').match(/(20\d{2})/);return m?Number(m[1]):null}
function selectedYear(){const txt=document.querySelector('.controls select')?.textContent||'';const y=yearOf(txt);return y||new Date().getFullYear()}
function isCandidate(x){if(!x)return false;if(x.candidate===true||x.isCandidate===true)return true;const s=String(x.judgeState||x.status||'').trim();if(!s)return false;if(s==='미확정')return false;return /판정대기|보완요청|확정|후보|검토|대기/.test(s)}
function isConfirmed(x){return !!x&&x.confirmed===true&&String(x.judgeState||'').trim()==='확정'}
function isMaintained(x){if(!isConfirmed(x))return false;return !/중지|부적합|해제|실패/.test(String(x.maintainState||x.auditState||x.status||''))&&x.valid!==false}
function num(v){const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)&&n>0?n:null}
function masterHeadcount(master){const byTeam=new Map();if(Array.isArray(master)){master.forEach((x,i)=>{if(typeof x==='number'){byTeam.set(String(i),x);return}if(!x||typeof x!=='object')return;const team=String(x.team||x.name||x.조직||x.생산팀||i),n=num(x.headcount??x.people??x.head??x.인원??x.현원??x.재적인원);if(n)byTeam.set(team,n)})}else if(master&&typeof master==='object'){Object.entries(master).forEach(([team,v])=>{const n=typeof v==='object'?num(v.headcount??v.people??v.head??v.인원??v.현원??v.재적인원):num(v);if(n)byTeam.set(team,n)})}return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function rowHeadcount(rows){const byTeam=new Map(),keys=['headcount','people','head','인원','현원','재적인원','재직인원'];rows.forEach(x=>{const team=String(x.team||'').trim();if(!team)return;let n=null;for(const k of keys){n=num(x[k]);if(n)break}if(!n&&x.raw&&typeof x.raw==='object'){for(const [k,v] of Object.entries(x.raw)){if(/^(인원|현원|재적인원|재직인원|headcount|people)$/i.test(String(k).replace(/\s/g,''))){n=num(v);if(n)break}}}if(n&&!byTeam.has(team))byTeam.set(team,n)});return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function headcount(rows){let master=null;try{master=JSON.parse(localStorage.getItem(HEADCOUNT_KEY)||'null')}catch{}const fromMaster=masterHeadcount(master)||masterHeadcount(window.HD20_HEADCOUNT_MASTER);return fromMaster||rowHeadcount(rows)||null}
function rowDate(x){return x.date||x.regDate||x.createdAt||x.importedAt||''}
function confirmedDate(x){return x.judgedAt||x.confirmedAt||x.judgeDate||rowDate(x)}
function snapshot(){const rows=load(),year=selectedYear(),activities=rows.filter(x=>yearOf(rowDate(x))===year),candidates=rows.filter(x=>isCandidate(x)&&yearOf(rowDate(x))===year),confirmed=rows.filter(isConfirmed),newSecured=confirmed.filter(x=>yearOf(confirmedDate(x))===year),maintained=confirmed.filter(isMaintained),people=headcount(rows);return{source:KEY,headcountSource:people?HEADCOUNT_KEY:'unavailable',year,rows,activities,candidates,newSecured,confirmed,maintained,headcount:people,perPerson:people?activities.length/people:null}}
function signal(){window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated',{detail:snapshot()}))}
window.HD20KPIData={KEY,HEADCOUNT_KEY,load,yearOf,selectedYear,isCandidate,isConfirmed,isMaintained,rowDate,confirmedDate,headcount,snapshot,signal};
['hd20-gmes-5s-imported','hd20-gmes-5s-judged'].forEach(e=>window.addEventListener(e,()=>setTimeout(signal,0)));window.addEventListener('storage',e=>{if(e.key===KEY||e.key===HEADCOUNT_KEY)signal()});
})();