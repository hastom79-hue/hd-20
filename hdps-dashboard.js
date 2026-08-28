(()=>{'use strict';
/* HDPS 5S 고도화 사례 관리 시스템 — dashboard #2.
 * Reads from the same canonical sources as index.html's approved dashboard
 * (window.HD20KPIData / window.HD20MaturityFollowup / hd20ActionCasesV2) so
 * the two dashboards never disagree about what a KPI means. No numbers are
 * invented here — every metric that lacks a real source renders as "—".
 */
const CATS=[
  {key:'정리',cls:'t-blue',ico:'🗑'},
  {key:'정돈',cls:'t-orange',ico:'📦'},
  {key:'청소',cls:'t-green',ico:'🧹'},
  {key:'시각화',cls:'t-purple',ico:'👁'},
  {key:'위험구역관리',cls:'t-red',ico:'⚠'},
  {key:'5S 고도화',cls:'t-teal',ico:'⊕'}
];
const ACTION_KEY='hd20ActionCasesV2';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const pick=(x,keys)=>{for(const k of keys){if(x?.[k]!==undefined&&x[k]!==null&&x[k]!=='')return x[k]}return null};
const asDate=v=>{if(!v)return null;const d=new Date(v);return Number.isNaN(d.getTime())?null:d};
const daysBetween=(a,b)=>{a=asDate(a);b=asDate(b);return a&&b?Math.max(0,Math.round((b-a)/86400000)):null};
const levelOf=x=>{const v=String(x?.level||x?.maturityLevel||x?.lv||'').match(/[1-5]/);return v?+v[0]:null};
const pct=(n,d)=>d?Math.round(n/d*1000)/10:null;
const catOf=x=>{let v=String(x.type||x.category||x.sType||x['5S구분']||x['활동유형']||'정리');if(v==='자주보전'||v==='습관화')v='위험구역관리';if(v==='고도화')v='5S 고도화';if(v==='시각화관리')v='시각화';return CATS.some(c=>c.key===v)?v:'정리'};

function actions(){try{const v=JSON.parse(localStorage.getItem(ACTION_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}

function snap(){
  if(window.HD20KPIData?.snapshot)return window.HD20KPIData.snapshot();
  return{rows:[],activities:[],candidates:[],newSecured:[],confirmed:[],maintained:[],headcount:null,perPerson:null,year:new Date().getFullYear()};
}

/* Ported from approved-landing-v2.js `operational()` so both dashboards
 * compute the six operating metrics identically. */
function operational(s){
  const rows=s.rows||[];
  const judgmentScope=rows.filter(x=>x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim());
  const judged=judgmentScope.filter(x=>['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&pick(x,['judgedAt','judgeDate','confirmedAt']));
  const lead=judged.map(x=>daysBetween(pick(x,['createdAt','regDate','date','importedAt']),pick(x,['judgedAt','judgeDate','confirmedAt']))).filter(Number.isFinite);
  const levels=(s.confirmed||[]).map(levelOf).filter(Number.isFinite);
  const sixResults=(s.confirmed||[]).map(x=>String(pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState'])||'').trim()).filter(Boolean);
  const sixPass=sixResults.filter(v=>/적합|유효|유지|완료|pass|ok/i.test(v)&&!/부적합|실패|해제|중지/i.test(v)).length;
  const act=actions();
  const recRows=act.filter(x=>pick(x,['recurrence','recurrent','recurrenceState','재발여부'])!==null);
  const recurred=recRows.filter(x=>/true|1|yes|재발|발생/i.test(String(pick(x,['recurrence','recurrent','recurrenceState','재발여부'])))).length;
  const completed=act.filter(x=>pick(x,['doneDate','completedDate','finishDate']));
  const ontime=completed.filter(x=>{const done=asDate(pick(x,['doneDate','completedDate','finishDate'])),due=asDate(pick(x,['targetDate','due','dueDate']));return done&&due&&done<=due}).length;
  return{
    judgmentRate:pct(judged.length,judgmentScope.length),
    avgLead:lead.length?Math.round(lead.reduce((a,b)=>a+b,0)/lead.length*10)/10:null,
    maturity:levels.length?Math.round(levels.reduce((a,b)=>a+b,0)/levels.length*10)/10:null,
    sixRetention:pct(sixPass,sixResults.length),
    recurrence:pct(recurred,recRows.length),
    actionOnTime:pct(ontime,completed.filter(x=>pick(x,['targetDate','due','dueDate'])).length)
  };
}

function fmt(v,unit){return v===null||v===undefined?'—':`${v}${unit||''}`}

function renderKpis(s){
  const m=operational(s);
  const cards=[
    {label:'공식 판정 완료율',val:fmt(m.judgmentRate,'%'),color:'#6bb0ff'},
    {label:'평균 판정 Lead Time',val:fmt(m.avgLead,'일'),color:'#f2c14e'},
    {label:'고도화 수준 (클릭)',val:m.maturity==null?'—':`Lv.${m.maturity}`,color:'#4fd07c'},
    {label:'6개월 유지율',val:fmt(m.sixRetention,'%'),color:'#c79bff'},
    {label:'Audit 부적합 재발률',val:fmt(m.recurrence,'%'),color:'#ff8a80'},
    {label:'기한 내 개선조치 완료율',val:fmt(m.actionOnTime,'%'),color:'#6bb0ff'}
  ];
  $('#hpKpis').innerHTML=cards.map(c=>`<div class="hpKpi"><small>${c.label}</small><b style="color:${c.color}">${c.val}</b><span class="hpSub">실데이터 미연결 시 — 표시 · 전월대비 비교는 이력 축적 후 제공</span></div>`).join('');
}

function renderTypes(s){
  const rows=s.activities&&s.activities.length?s.activities:s.rows||[];
  const byType=new Map(CATS.map(c=>[c.key,0]));
  rows.forEach(x=>{const k=catOf(x);byType.set(k,(byType.get(k)||0)+1)});
  $('#hpTypes').innerHTML=CATS.map(c=>{
    const n=byType.get(c.key)||0;
    return `<div class="hpType ${c.cls}"><div class="hpTypeIco">${c.ico}</div><b>${esc(c.key)}</b><span class="hpTypeVal">${n}건</span><span class="hpTypeGoal">목표 미설정</span><div class="hpTypeTrack"><i style="width:0%"></i></div><span class="hpTypeRate">달성률 —</span></div>`;
  }).join('');
}

function renderMap(s){
  const confirmed=s.confirmed||[];
  const map=$('#hpMap');
  [...map.querySelectorAll('.hpMapDot')].forEach(d=>d.remove());
  if(!confirmed.length){
    if(!map.querySelector('.hpMapEmpty')){
      const e=document.createElement('div');e.className='hpMapEmpty';e.textContent='공식 확정된 고도화 사례가 없어 표시할 데이터가 없습니다.';map.appendChild(e);
    }
    return;
  }
  map.querySelector('.hpMapEmpty')?.remove();
  const byTeamLevel=new Map();
  confirmed.forEach(x=>{const team=String(x.team||'').trim();const lv=levelOf(x);if(!team||!lv)return;const k=team+'|'+lv;byTeamLevel.set(k,(byTeamLevel.get(k)||0)+1)});
  const groups=[...byTeamLevel.entries()].map(([k,count])=>{const[team,lv]=k.split('|');return{team,lv:+lv,count}});
  const maxCount=Math.max(1,...groups.map(g=>g.count));
  groups.forEach(g=>{
    const x=6+Math.min(92,(g.count/maxCount)*86);
    const y=6+((g.lv-1)/4)*88;
    const dot=document.createElement('div');
    dot.className='hpMapDot';
    dot.style.left=x+'%';dot.style.bottom=y+'%';
    dot.innerHTML=`<span>${esc(g.team)}</span>`;
    map.appendChild(dot);
  });
}

function renderDist(s){
  const confirmed=s.confirmed||[];
  const byLevel=new Map([5,4,3,2,1].map(n=>[n,{teams:new Set(),count:0}]));
  confirmed.forEach(x=>{const lv=levelOf(x);if(!lv||!byLevel.has(lv))return;const e=byLevel.get(lv);e.count++;if(x.team)e.teams.add(x.team)});
  const total=confirmed.length;
  const rows=[5,4,3,2,1].map(lv=>{const e=byLevel.get(lv);return{lv,teams:e.teams.size,count:e.count,pct:total?Math.round(e.count/total*1000)/10:0}});
  const allTeams=new Set(confirmed.map(x=>x.team).filter(Boolean));
  $('#hpDistBody').innerHTML=[
    ...rows.map(r=>`<tr><td>Lv.${r.lv}</td><td>${r.teams||'—'}</td><td>${r.count||'—'}</td><td>${total?r.pct+'%':'—'}</td></tr>`),
    `<tr class="hpDistSum"><td>합계</td><td>${allTeams.size||'—'}</td><td>${total||'—'}</td><td>${total?'100%':'—'}</td></tr>`
  ].join('');
}

function renderActionSummary(){
  const f=window.HD20MaturityFollowup?.summary?.();
  const act=actions();
  const notDone=act.filter(x=>String(x.status||'')!=='완료').length;
  $('#hpActionAsOf').textContent=`기준일 : ${new Date().toISOString().slice(0,10)}`;
  const rows=[
    {label:'1개월 점검 대상',n:f?.one?.length,due:f?.one?.filter(x=>x.state==='기한임박').length,over:f?.one?.filter(x=>x.state==='경과').length},
    {label:'3개월 Audit 대상',n:f?.three?.length,due:f?.three?.filter(x=>x.state==='기한임박').length,over:f?.three?.filter(x=>x.state==='경과').length},
    {label:'6개월 Audit 대상',n:f?.six?.length,due:f?.six?.filter(x=>x.state==='기한임박').length,over:f?.six?.filter(x=>x.state==='경과').length},
    {label:'개선조치 미완료',n:notDone,due:null,over:null}
  ];
  $('#hpActionRows').innerHTML=rows.map(r=>`<div class="hpActionRow"><span>${esc(r.label)}</span><span><b>${r.n==null?'—':r.n+'건'}</b>${r.due?`<span class="hpBadge due">기한임박 ${r.due}</span>`:''}${r.over?`<span class="hpBadge over">경과 ${r.over}</span>`:''}</span></div>`).join('');
}

function renderSideStats(s){
  const rawTotal=(s.candidates?.length||0)+(s.confirmed?.length||0)+(s.maintained?.length||0);
  $('#hpRawTotal').textContent=rawTotal?`전체 ${rawTotal}건`:'—';
  $('#hpGmesTotal').textContent=s.confirmed?.length?`전체 ${s.confirmed.length}건`:'—';
}

function renderNotice(){
  $('#hpNotice').innerHTML=`<li>2026년 5S 고도화 사례 관리 운영 가이드 v1.8 (2026-08-20)</li>`;
}

function renderFooter(){
  $('#hpFootDate').textContent=`※ 데이터 기준일 : ${new Date().toISOString().slice(0,10)}`;
  $('#hpAsOfOpt').textContent=new Date().toISOString().slice(0,10);
}

function csvDownload(filename,rows){
  const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),400);
}
function wireDownloads(s){
  const m=operational(s);
  $$('[data-hp-download]').forEach(btn=>btn.onclick=()=>{
    const kind=btn.dataset.hpDownload;
    if(kind==='kpi')return csvDownload('HDPS_KPI_요약.csv',[['지표','값'],['공식 판정 완료율',fmt(m.judgmentRate,'%')],['평균 판정 Lead Time',fmt(m.avgLead,'일')],['고도화 수준',m.maturity==null?'—':'Lv.'+m.maturity],['6개월 유지율',fmt(m.sixRetention,'%')],['Audit 부적합 재발률',fmt(m.recurrence,'%')],['기한 내 개선조치 완료율',fmt(m.actionOnTime,'%')]]);
    if(kind==='metrics')return csvDownload('HDPS_운영지표.csv',[['생산팀','작업장','유형','등록일','판정상태','판정일'],...(s.rows||[]).map(x=>[x.team||'',x.workplace||x.title||'',catOf(x),x.date||x.regDate||'',x.judgeState||'',x.judgedAt||''])]);
    if(kind==='raw')return csvDownload('HDPS_Portfolio_RawData.csv',[['구분','생산팀','작업장','유형','판정상태'],...[...(s.candidates||[]),...(s.confirmed||[]),...(s.maintained||[])].map(x=>['원천',x.team||'',x.workplace||x.title||'',catOf(x),x.judgeState||''])]);
    if(kind==='gmes')return csvDownload('HDPS_공식확정_GMES사례.csv',[['생산팀','작업장','유형','판정일','판정자'],...(s.confirmed||[]).map(x=>[x.team||'',x.workplace||x.title||'',catOf(x),x.judgedAt||'',x.judgeOwner||''])]);
  });
}

/* Minimal, non-fabricated AI panel wiring: reuses the same Prototype error
 * log store as expert-chatbot-final.js (hd20ExpertBotErrorsV1) so entries
 * made from either dashboard show up in the same place. */
const ERR_KEY='hd20ExpertBotErrorsV1';
function wireAi(){
  $('#hpAiOpen').onclick=()=>alert('HDPS · 5S Expert AI는 Prototype 단계입니다. 실제 OpenAI API 연동 전으로, 이 화면에서는 오류 접수/이력만 지원합니다.');
  $('#hpAiErrReport').onclick=()=>{
    const text=prompt('발생한 오류 현상을 입력해 주세요 (예: 고도화 수준 팝업이 열리지 않음)');
    if(!text)return;
    let v=[];try{v=JSON.parse(localStorage.getItem(ERR_KEY)||'[]')}catch{}
    v.unshift({text,at:new Date().toLocaleString('ko-KR'),page:'HDPS 대시보드'});
    localStorage.setItem(ERR_KEY,JSON.stringify(v.slice(0,100)));
    alert('오류가 접수되었습니다. (Prototype: 이 브라우저 LocalStorage에 저장)');
  };
  $('#hpAiErrHistory').onclick=()=>{
    let v=[];try{v=JSON.parse(localStorage.getItem(ERR_KEY)||'[]')}catch{}
    if(!v.length)return alert('접수된 오류 이력이 없습니다.');
    alert(v.slice(0,10).map(x=>`• ${x.text} (${x.at})`).join('\n'));
  };
}

function wireNavGuard(){
  $$('.hpNav button[data-hp-nav]').forEach(btn=>btn.onclick=()=>{
    if(btn.dataset.hpNav==='dashboard'){$$('.hpNav button').forEach(b=>b.classList.toggle('on',b===btn));return}
    alert('이 메뉴는 아직 HDPS 대시보드에 연결되지 않았습니다. 기존 대시보드(index.html)의 해당 메뉴를 이용해 주세요.');
  });
  $$('[data-hp-detail]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();alert('상세 Grid는 검토 단계에서 기존 대시보드의 Grid 팝업과 통합 예정입니다.')}));
  $('#hpRefresh').onclick=()=>location.reload();
  $('#hpFullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.()};
  $('#hpLogout').onclick=()=>alert('Prototype 단계에서는 별도 로그인/로그아웃 세션이 연결되어 있지 않습니다.');
  $$('.hpToggle button').forEach(b=>b.onclick=()=>{$$('.hpToggle button').forEach(x=>x.classList.toggle('on',x===b))});
}

function render(){
  const s=snap();
  renderKpis(s);
  renderTypes(s);
  renderMap(s);
  renderDist(s);
  renderActionSummary();
  renderSideStats(s);
  renderNotice();
  renderFooter();
  wireDownloads(s);
}

function boot(){
  render();
  wireNavGuard();
  wireAi();
  ['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-followup-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(render,30)));
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
