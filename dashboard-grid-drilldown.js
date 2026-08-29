(()=>{'use strict';
/* Extends the existing rgModal raw-data-grid popup (wired for the top 5
 * KPI cards by top-kpi-drilldown.js) to every other clickable surface on
 * the approved-landing dashboard: the 6 operating-metric cards, the 5
 * maturity-level Map bars, 최근 고도화 작업장, 기한임박 점검 대상, and the
 * 5 월별 추이 cards. Per explicit instruction: every selectable thing on
 * the dashboard should open a raw-data grid, not just show a static number. */
function grid(){return window.HD20TopKPIGrid}
function source(){return window.HD20KPIData?.snapshot?.()||{rows:[],activities:[],candidates:[],newSecured:[],confirmed:[],maintained:[]}}
function levelOf(x){const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);return v?+v[0]:null}
function pick(x,keys){for(const k of keys){if(x?.[k]!==undefined&&x[k]!==null&&x[k]!=='')return x[k]}return null}
function dateOnly(x,keys){const v=pick(x,keys);return v?String(v).slice(0,10):null}

function style(){
  if(document.getElementById('gridDrillExtraStyle'))return;
  const s=document.createElement('style');s.id='gridDrillExtraStyle';
  s.textContent=`.hd20ALMetric,.hd20Level,.hd20Trend{cursor:pointer;transition:.15s}.hd20ALMetric:hover,.hd20Level:hover,.hd20Trend:hover{transform:translateY(-2px)}.hd20ALPanel:has(.hd20Recent)>h3,.hd20ALPanel:has(.hd20Due)>h3{cursor:pointer}`;
  document.head.appendChild(s);
}

/* ---- 6 operating metric cards ---- */
function wireMetrics(){
  const cards=[...document.querySelectorAll('.hd20ALMetric')];
  if(cards.length!==6||cards[0].dataset.metricDrill==='1')return cards.length===6;
  cards.forEach(c=>c.dataset.metricDrill='1');
  const HEAD_JUDGE=['생산팀','작업장/사례','현장 등록일','판정상태','판정일','판정자'];
  const HEAD_LEAD=['생산팀','작업장/사례','등록일','판정일','Lead Time(일)'];
  const HEAD_LEVEL=['생산팀','작업장/사례','고도화 Level','판정일'];
  const HEAD_SIX=['생산팀','작업장/사례','판정일','6개월 Audit 결과'];
  const HEAD_REC=['생산팀','작업장','재발여부','등록일'];
  const HEAD_ONTIME=['생산팀','작업장','목표기한','완료일','기한준수'];
  const daysBetween=(a,b)=>{a=new Date(a);b=new Date(b);return isNaN(a)||isNaN(b)?'—':Math.max(0,Math.round((b-a)/86400000))};
  const actions=()=>{try{const v=JSON.parse(localStorage.getItem('hd20ActionCasesV2')||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const handlers=[
    ()=>{const s=source(),scope=(s.rows||[]).filter(x=>window.HD20KPIData?.isAdvancementType?.(x)&&(x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim()));grid().showCustom('5S 고도화 판정 완료율',HEAD_JUDGE,scope.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['date','regDate','createdAt'])||'-',x.judgeState||'판정대기',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',x.judgeOwner||'-']),'판정대상 전체 (현장등록~판정) 원천 기준')},
    ()=>{const s=source(),judged=(s.rows||[]).filter(x=>window.HD20KPIData?.isAdvancementType?.(x)&&['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&pick(x,['judgedAt','judgeDate','confirmedAt']));grid().showCustom('평균 판정 Lead Time',HEAD_LEAD,judged.map(x=>{const regd=dateOnly(x,['createdAt','regDate','date','importedAt']),jd=dateOnly(x,['judgedAt','judgeDate','confirmedAt']);return[x.team||'-',x.workplace||x.title||'-',regd||'-',jd||'-',regd&&jd?daysBetween(regd,jd):'—']}),'등록일→판정완료일 소요일 개별 사례')},
    ()=>{const s=source(),confirmed=(s.confirmed||[]).filter(x=>levelOf(x));grid().showCustom('고도화 수준',HEAD_LEVEL,confirmed.map(x=>[x.team||'-',x.workplace||x.title||'-','Lv.'+levelOf(x),dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-']),'공식확정 사례 중 Level 부여 건')},
    ()=>{const s=source(),six=(s.confirmed||[]).filter(x=>pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState']));grid().showCustom('6개월 유지율',HEAD_SIX,six.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState'])||'-']),'6개월 Audit 결과가 등록된 확정 사례')},
    ()=>{const rec=actions().filter(x=>pick(x,['recurrence','recurrent','recurrenceState','재발여부'])!==null);grid().showCustom('Audit 부적합 재발률',HEAD_REC,rec.map(x=>[x.team||'-',x.workplace||'-',pick(x,['recurrence','recurrent','recurrenceState','재발여부'])||'-',x.date||x.startDate||'-']),'재발여부가 기록된 개선조치 건')},
    ()=>{const done=actions().filter(x=>pick(x,['doneDate','completedDate','finishDate'])&&pick(x,['targetDate','due','dueDate']));grid().showCustom('기한 내 개선조치 완료율',HEAD_ONTIME,done.map(x=>{const d=pick(x,['doneDate','completedDate','finishDate']),due=pick(x,['targetDate','due','dueDate']);return[x.team||'-',x.workplace||'-',due||'-',d||'-',(d&&due&&new Date(d)<=new Date(due))?'준수':'지연']}),'목표기한·완료일이 모두 있는 개선조치 건')}
  ];
  cards.forEach((c,i)=>{c.tabIndex=0;c.setAttribute('role','button');c.addEventListener('click',()=>handlers[i]());c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handlers[i]()}})});
  return true;
}

/* ---- 5 maturity-level Map bars ---- */
function wireLevels(){
  const cards=[...document.querySelectorAll('.hd20Level')];
  if(cards.length!==5||cards[0].dataset.levelDrill==='1')return cards.length===5;
  cards.forEach(c=>c.dataset.levelDrill='1');
  const HEAD=['생산팀','작업장/사례','판정일','판정자'];
  cards.forEach((c,i)=>{
    const lv=i+1;
    c.tabIndex=0;c.setAttribute('role','button');
    const run=()=>{const s=source(),rows=(s.confirmed||[]).filter(x=>levelOf(x)===lv);grid().showCustom(`5S 고도화 수준 Lv.${lv}`,HEAD,rows.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',x.judgeOwner||'-']),`Level ${lv} 공식확정 사례`)};
    c.addEventListener('click',run);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})
  });
  return true;
}

/* ---- 최근 고도화 작업장 / 기한임박 점검 대상 panels ---- */
function wireListPanels(){
  const recentPanel=document.querySelector('.hd20Recent')?.closest('.hd20ALPanel');
  const duePanel=document.querySelector('.hd20Due')?.closest('.hd20ALPanel');
  let ok=true;
  if(recentPanel&&recentPanel.dataset.listDrill!=='1'){
    recentPanel.dataset.listDrill='1';
    const h3=recentPanel.querySelector('h3');if(h3)h3.tabIndex=0;
    const HEAD=['생산팀','작업장/사례','고도화 Level','판정일'];
    const run=()=>{const s=source(),rows=[...(s.confirmed||[])].sort((a,b)=>String(b.judgedAt||0).localeCompare(String(a.judgedAt||0)));grid().showCustom('최근 고도화 작업장 (공식확정)',HEAD,rows.map(x=>[x.team||'-',x.workplace||x.title||'-',levelOf(x)?'Lv.'+levelOf(x):'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-']),'공식확정 전체, 최신 판정일순')};
    h3?.addEventListener('click',run);
    document.querySelectorAll('.hd20RecentRow').forEach(r=>{r.style.cursor='pointer';r.addEventListener('click',run)});
  }else if(!recentPanel)ok=false;
  if(duePanel&&duePanel.dataset.listDrill!=='1'){
    duePanel.dataset.listDrill='1';
    const h3=duePanel.querySelector('h3');if(h3)h3.tabIndex=0;
    const HEAD=['생산팀','작업장/사례','후속단계','기준일','D-day','상태'];
    const run=()=>{const f=window.HD20MaturityFollowup?.summary?.();const rows=(f?.due||[]).sort((a,b)=>a.diff-b.diff);grid().showCustom('기한임박 점검 대상 (3개월 AUDIT 등)',HEAD,rows.map(x=>[x.team||'-',x.workplace||x.title||'-',x.label||'-',x.date instanceof Date?x.date.toISOString().slice(0,10):(x.date||'-'),x.diff>=0?'D-'+x.diff:'D+'+Math.abs(x.diff),x.state||'-']),'1·3·6개월 Lifecycle 중 기한임박 상태')};
    h3?.addEventListener('click',run);
    document.querySelectorAll('.hd20DueRow').forEach(r=>{r.style.cursor='pointer';r.addEventListener('click',run)});
  }else if(!duePanel)ok=false;
  return ok;
}

/* ---- 5 월별 추이 cards: reuse the same grids as the matching top-KPI card ---- */
function wireTrends(){
  const cards=[...document.querySelectorAll('.hd20Trend')];
  if(cards.length!==5||cards[0].dataset.trendDrill==='1')return cards.length===5;
  cards.forEach(c=>c.dataset.trendDrill='1');
  const HEAD=['생산팀','작업장/사례','판정일','6개월 Audit 결과'];
  cards.forEach((c,i)=>{
    c.tabIndex=0;c.setAttribute('role','button');
    const run=()=>{
      const s=source();
      if(i===4){const rows=(s.confirmed||[]).filter(x=>pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState']));grid().showCustom('AUDIT 6개월 유지율',HEAD,rows.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState'])||'-']),'6개월 Audit 결과가 있는 확정 사례');return}
      const sets=grid().sets(s),titles=['고도화 후보 발굴','고도화 작업장 신규 확보','누적 고도화 작업장 확보','현재 유지 작업장'],idx=[1,2,3,4][i];
      grid().show(titles[i],sets[idx],titles[i]+' (월별 추이 카드 기준)',idx);
    };
    c.addEventListener('click',run);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})
  });
  return true;
}

function boot(){
  if(!grid()){setTimeout(boot,150);return}
  style();
  let n=0;
  const run=()=>{
    const a=wireMetrics(),b=wireLevels(),c=wireListPanels(),d=wireTrends();
    if(a&&b&&c&&d)return;
    if(++n<60)setTimeout(run,150);
  };
  run();
  ['hd20-gmes-5s-judged','hd20-gmes-5s-imported','hd20-followup-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(run,80)));
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
