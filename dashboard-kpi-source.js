(()=>{'use strict';
const KEY='hd20GMES5SAutoImproveRawV1',HEADCOUNT_KEY='hd20TeamHeadcountMasterV1',AUDIT_KEY='hd20AuditRandomDrawsV1';
const LEGACY_TEST_IDS=new Set('DRAW-1788010755791,DRAW-1788010759290,DRAW-1788010760070,DRAW-1788010760500,DRAW-1788010760921,DRAW-1788010761360,DRAW-1788011635587,DRAW-1788011636106,DRAW-1788011636356,DRAW-1788011636538,DRAW-1788011636773,DRAW-1788011636931,DRAW-1788011637126,DRAW-1788011637396,DRAW-1788011637597,DRAW-1788011637788,DRAW-1788011637966,DRAW-1788011638138,DRAW-1788011638487,DRAW-1788011638656,DRAW-1788011638846'.split(','));
/* 검증 모드(?validation=1)에서는 web-validation-fixture 행을 정상 데이터로 취급한다.
   (supabase-sync.js 는 자체 isNonProdRow 를 쓰므로 DB 반입 차단은 그대로 유지됨) */
/* isNonProdRow는 16개 파일(audit-close-evaluation.js·hd20-action-verify-canonical-guard.js·
   hd20-trace-production-guard.js 등)이 window.HD20KPIData.isNonProdRow로 공유하는 중앙 판정 함수인데,
   정작 이 함수 자체는 데모 모드(window.HD20_DEMO_MODE)를 전혀 몰라 demo-seed 행을 항상 '비운영(제외
   대상)'으로 판정하고 있었음. load()/actionCases()/auditDraws() 등 이 파일 자신의 조회 함수들은 이미
   데모 모드일 때 demo-seed를 포함하도록 별도 처리돼 있었지만, 이 함수를 그대로 가져다 쓰는 다른 16개
   파일은 그 보정을 받지 못해 '종료평가 대기 0건' 등으로 계속 비어 보였음(사용자 지적: "가상데이터가
   여전히 부족하다") — 근본 원인은 이 한 함수였으므로 여기서 데모 모드 보정을 추가해 모든 참조처에
   일괄 적용되도록 함. 실제 운영 환경(HD20_DEMO_MODE 미설정)에서는 동작이 전혀 바뀌지 않음. */
function isNonProdRow(x){if(x&&typeof x==='object'&&validationMode()&&x.source==='web-validation-fixture')return false;if(x&&typeof x==='object'&&window.HD20_DEMO_MODE===true&&x.source==='demo-seed')return false;return isNonProdRowBase(x)}
function isNonProdRowBase(x){if(!x||typeof x!=='object')return false;const source=String(x.source||'').toLowerCase(),id=String(x.id||'').toUpperCase(),sourceCaseId=String(x.sourceCaseId||'').toUpperCase(),email=String(x.email||'').toLowerCase(),legacySeedEmail=/^teamlead\d+@example\.com$/i.test(email);return x.isDemo===true||x.isTest===true||source==='demo-seed'||source==='e2e-fixture'||source==='web-validation-fixture'||id.startsWith('DEMO-')||id.startsWith('E2E-')||id.startsWith('VALID-')||id.includes('AUTO-DEMO-')||sourceCaseId.startsWith('DEMO-')||sourceCaseId.startsWith('E2E-')||sourceCaseId.startsWith('VALID-')||email.endsWith('@hd-hyundai-demo.co.kr')||legacySeedEmail||LEGACY_TEST_IDS.has(id)}
function validationMode(){return new URL(location.href).searchParams.get('validation')==='1'}
function load(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?(validationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>window.HD20_DEMO_MODE===true&&x?.source==='demo-seed'||!isNonProdRow(x))):[]}catch{return[]}}
function yearOf(v){const m=String(v??'').match(/(20\d{2})/);return m?Number(m[1]):null}
function selectedYear(){const txt=document.querySelector('.controls select')?.textContent||'';const y=yearOf(txt);return y||new Date().getFullYear()}
function isAdvancementType(x){const v=String(x?.type||x?.category||x?.sType||x?.['5S구분']||x?.['활동유형']||'').trim();return v==='5S 고도화'||v==='고도화'||v==='5S고도화'}
function isCandidate(x){if(!x||!isAdvancementType(x))return false;if(x.candidate===true||x.isCandidate===true)return true;const judge=String(x.judgeState||'').trim(),status=String(x.status||'').trim();if(!judge&&!status)return false;if(judge==='미확정')return /판정대기|보완요청|후보|검토|대기/.test(status);const s=judge||status;return /판정대기|보완요청|확정|후보|검토|대기/.test(s)}
function isConfirmed(x){return !!x&&isAdvancementType(x)&&x.confirmed===true&&String(x.judgeState||'').trim()==='확정'}
function isMaintained(x){if(!isConfirmed(x))return false;return !/중지|미흡|이탈|재점검|부적합|해제|실패/.test(String(x.maintainState||x.auditState||x.status||''))&&x.attrition!==true&&x.valid!==false}
function num(v){const n=Number(String(v??'').replace(/[^0-9.\-]/g,''));return Number.isFinite(n)&&n>0?n:null}
function masterHeadcount(master){const byTeam=new Map();if(Array.isArray(master)){master.forEach((x,i)=>{if(typeof x==='number'){byTeam.set(String(i),x);return}if(!x||typeof x!=='object')return;const team=String(x.team||x.name||x.조직||x.생산팀||i),n=num(x.headcount??x.people??x.head??x.인원??x.현원??x.재적인원);if(n)byTeam.set(team,n)})}else if(master&&typeof master==='object'){Object.entries(master).forEach(([team,v])=>{const n=typeof v==='object'?num(v.headcount??v.people??v.head??v.인원??v.현원??v.재적인원):num(v);if(n)byTeam.set(team,n)})}return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function rowHeadcount(rows){const byTeam=new Map(),keys=['headcount','people','head','인원','현원','재적인원','재직인원'];rows.forEach(x=>{const team=String(x.team||'').trim();if(!team)return;let n=null;for(const k of keys){n=num(x[k]);if(n)break}if(!n&&x.raw&&typeof x.raw==='object'){for(const [k,v] of Object.entries(x.raw)){if(/^(인원|현원|재적인원|재직인원|headcount|people)$/i.test(String(k).replace(/\s/g,''))){n=num(v);if(n)break}}}if(n&&!byTeam.has(team))byTeam.set(team,n)});return [...byTeam.values()].reduce((a,b)=>a+b,0)||null}
function headcount(rows){let master=null;try{master=JSON.parse(localStorage.getItem(HEADCOUNT_KEY)||'null')}catch{}const fromMaster=masterHeadcount(master)||masterHeadcount(window.HD20_HEADCOUNT_MASTER);return fromMaster||rowHeadcount(rows)||null}
function rowDate(x){return x.date||x.regDate||x.createdAt||x.importedAt||''}
function confirmedDate(x){return x.judgedAt||x.confirmedAt||x.judgeDate||rowDate(x)}
function snapshot(){const rows=load(),year=selectedYear(),activities=rows.filter(x=>yearOf(rowDate(x))===year),candidates=rows.filter(x=>isCandidate(x)),/* 판정 대기 목록은 등록 연도로 제한하지 않음 — 전년도 이전에 등록되어 아직 미확정인 후보도 계속 보여야 함(정체 방지). 연도별 실적은 confirmed/newSecured로 별도 확인 */confirmed=rows.filter(isConfirmed),newSecured=confirmed.filter(x=>yearOf(confirmedDate(x))===year),maintained=confirmed.filter(isMaintained),people=headcount(rows);return{source:KEY,headcountSource:people?HEADCOUNT_KEY:'unavailable',year,rows,activities,candidates,newSecured,confirmed,maintained,headcount:people,perPerson:people?activities.length/people:null}}
function pickField(x,keys){for(const k of keys){if(x?.[k]!==undefined&&x[k]!==null&&x[k]!=='')return x[k]}return null}
function asDate(v){if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d}
function daysBetween(a,b){a=asDate(a);b=asDate(b);return a&&b?Math.max(0,Math.round((b-a)/86400000)):null}
function levelOf(x){const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);if(v)return+v[0];
  /* 확정 사례에 level/maturityLevel/lv 필드가 전혀 없는 현재 데이터 모델에서는 항상 null이 되어
     '고도화 수준' KPI가 분모 0으로 영원히 '—'였던 결함을 발견 — 실제로 존재하는 3대 요건 충족 개수
     (criteriaMatched, 0~3)를 그대로 수준값으로 대체 사용(조건을 모두 충족할수록 높은 수준이라는
     기존 '고도화 3대 판정기준' 의미와 일치) */
  const cm=Number(x?.criteriaMatched);
  return Number.isFinite(cm)&&cm>0?cm:null}
function pct(n,d){return d?Math.round(n/d*1000)/10:null}
function txt(v){return String(v??'').trim()}
function actionDone(x){return /완료|확정|종료|종결|close|done/i.test(txt(x?.status||x?.activityStatus||x?.judgeState||x?.auditState))}
function actionCompleted(x){return !!pickField(x,['doneDate','completedDate','finishDate'])&&!!txt(x?.action||x?.improvement)&&!!(x?.after||x?.afterEvidence)}
function effectVerified(x){if(x?.effectVerified===true)return true;const v=txt(x?.effectState||x?.effectResult);if(!v||/대기|미검증|미흡|부적합|무효|false|^0$|^N$/i.test(v))return false;return /^(유효|적합|효과확인|효과확인완료|검증완료|완료|true|1|Y)$/i.test(v)}
function recurrenceState(x){if(x?.recurrence===true)return true;if(x?.recurrence===false)return false;const v=txt(x?.recurrenceState??x?.recurrent??x?.['재발여부']);if(!v||/^(미발생|없음|미재발|false|0|no|n)$/i.test(v))return false;return /^(재발|발생|true|1|yes|y)$/i.test(v)}
function recurrenceObserved(x){const v=txt(x?.recurrenceState??x?.recurrent??x?.['재발여부']);if(v)return /^(재발|발생|미발생|없음|미재발|true|false|1|0|yes|no|y|n)$/i.test(v);return typeof x?.recurrence==='boolean'}
function closedLoopRecurrence(x){return actionDone(x)&&effectVerified(x)&&recurrenceState(x)}
function actionCases(){try{const v=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]');return Array.isArray(v)?(validationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>window.HD20_DEMO_MODE===true&&x?.source==='demo-seed'||!isNonProdRow(x))):[]}catch{return[]}}
function auditDraws(){try{const v=JSON.parse(localStorage.getItem(AUDIT_KEY)||'[]');return Array.isArray(v)?(validationMode()?v.filter(x=>x?.source==='web-validation-fixture'):v.filter(x=>window.HD20_DEMO_MODE===true&&x?.source==='demo-seed'||!isNonProdRow(x))):[]}catch{return[]}}
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
/* 월별 추이(읽기 전용): operational()과 같은 정의를 월 단위로 나눈 값. 기존 산식은 변경하지 않음.
   판정완료율=등록월 기준, Lead Time·수준=판정/확정월 기준, 6개월 유지율=6개월 종료월 기준,
   재발률·기한 내 완료율=조치 완료월 기준. 각 값에 표본 수(n)를 함께 반환. */
function monthlyOperational(n=6){
  const s=snapshot(),today=seoulDateKey(),ty=+today.slice(0,4),tm=+today.slice(5,7),months=[];
  for(let i=n-1;i>=0;i--){const t=ty*12+(tm-1)-i;months.push(`${Math.floor(t/12)}-${String(t%12+1).padStart(2,'0')}`)}
  const mk=v=>{if(!v)return'';const k=seoulDateKey(v);return /^\d{4}-\d{2}-\d{2}$/.test(k)?k.slice(0,7):''};
  const avg=a=>a.length?Math.round(a.reduce((x,y)=>x+y,0)/a.length*10)/10:null;
  const rows=(s.rows||[]).filter(isAdvancementType),scope=rows.filter(x=>x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim());
  const regOf=x=>pickField(x,['createdAt','regDate','date','importedAt']),judgeOf=x=>pickField(x,['judgedAt','judgeDate','confirmedAt']);
  const isJudged=x=>['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&!!judgeOf(x);
  const act=actionCases(),verified=act.filter(x=>actionDone(x)&&effectVerified(x)),recScope=verified.filter(recurrenceObserved),completed=act.filter(actionCompleted);
  const doneOf=x=>pickField(x,['doneDate','completedDate','finishDate']),dueOf=x=>pickField(x,['targetDate','due','dueDate','deadline']);
  const timed=completed.filter(x=>dueOf(x));
  const passOf=d=>{const id=auditId(d),linked=id?act.filter(a=>actionAuditId(a)===id):[];const unresolved=linked.some(a=>!actionDone(a)),recurrent=linked.some(closedLoopRecurrence),fs=txt(d.finalEvaluation||d.auditFinalState),failed=fs==='미흡'||['부적합','실패','해제','중지'].includes(fs);return !unresolved&&!recurrent&&!failed};
  const closed=auditDraws().filter(d=>d.auditDate).map(d=>({d,end:addMonthsKey(d.auditDate,6)})).filter(x=>x.end&&x.end<today);
  const cell=(v,c)=>({v:v??null,n:c});
  const out={months,judgmentRate:[],avgLead:[],maturity:[],sixRetention:[],recurrence:[],actionOnTime:[]};
  months.forEach(m=>{
    const sc=scope.filter(x=>mk(regOf(x))===m);out.judgmentRate.push(cell(pct(sc.filter(isJudged).length,sc.length),sc.length));
    const jm=scope.filter(x=>isJudged(x)&&mk(judgeOf(x))===m).map(x=>daysBetween(regOf(x),judgeOf(x))).filter(Number.isFinite);out.avgLead.push(cell(avg(jm),jm.length));
    const lv=(s.confirmed||[]).filter(x=>mk(confirmedDate(x))===m).map(levelOf).filter(Number.isFinite);out.maturity.push(cell(avg(lv),lv.length));
    const cl=closed.filter(x=>x.end.slice(0,7)===m);out.sixRetention.push(cell(pct(cl.filter(x=>passOf(x.d)).length,cl.length),cl.length));
    const rc=recScope.filter(x=>mk(doneOf(x))===m);out.recurrence.push(cell(pct(rc.filter(recurrenceState).length,rc.length),rc.length));
    const tm2=timed.filter(x=>mk(doneOf(x))===m);out.actionOnTime.push(cell(pct(tm2.filter(x=>{const d=asDate(doneOf(x)),u=asDate(dueOf(x));return d&&u&&d<=u}).length,tm2.length),tm2.length));
  });
  return out;
}
function signal(){window.dispatchEvent(new CustomEvent('hd20-kpi-source-updated',{detail:snapshot()}))}
window.HD20KPIData={actionCases,monthlyOperational,KEY,HEADCOUNT_KEY,AUDIT_KEY,load,isNonProdRow,yearOf,selectedYear,isCandidate,isConfirmed,isMaintained,isAdvancementType,rowDate,confirmedDate,headcount,snapshot,operational,sixMonthRetention,recurrenceState,recurrenceObserved,effectVerified,actionCompleted,closedLoopRecurrence,seoulDateKey,signal};
['hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-audit-updated','hd20-action-updated'].forEach(e=>window.addEventListener(e,()=>setTimeout(signal,0)));window.addEventListener('storage',e=>{if(e.key===KEY||e.key===HEADCOUNT_KEY||e.key===AUDIT_KEY||e.key==='hd20ActionCasesV2')signal()});
})();