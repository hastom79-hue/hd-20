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
const dateOnly=(x,keys)=>{const v=pick(x,keys);return v?String(v).slice(0,10):null};
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
function operational(s){return window.HD20KPIData?.operational?.(s)||{judgmentRate:null,avgLead:null,maturity:null,sixRetention:null,recurrence:null,actionOnTime:null}}

function fmt(v,unit){return v===null||v===undefined?'—':`${v}${unit||''}`}

/* ---- Raw-data grid popup: every clickable card/row on this dashboard
 * opens this with the underlying rows, per explicit instruction that
 * everything selectable should reveal raw data, not just a number. */
function gridOpen(title,headers,rows2d,note){
  const m=$('#hpGridModal');if(!m)return;
  $('#hpGridTitle').textContent=title+' · 상세 Grid';
  $('#hpGridBody').innerHTML=`<div class="hpGridNote">${esc(note||'')} · GMES 업로드/판정 원천이력 기준</div><div class="hpGridTools"><span>총 ${rows2d.length}건</span><button type="button" id="hpGridExport">⇩ Raw Data 추출</button></div>${rows2d.length?`<table class="hpGridTable"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows2d.map(r=>`<tr>${r.map((v,i)=>`<td>${i===0?'<b>'+esc(v)+'</b>':esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<div class="hpGridEmpty">현재 원천데이터에 해당 실적이 없습니다.</div>'}`;
  $('#hpGridExport')?.addEventListener('click',()=>csvDownload(title.replace(/[^0-9A-Za-z가-힣]/g,'_')+'.csv',[headers,...rows2d]));
  m.classList.add('on');
}
function gridClose(){$('#hpGridModal')?.classList.remove('on')}
function wireGridModal(){
  $('#hpGridClose')?.addEventListener('click',gridClose);
  $('#hpGridModal')?.addEventListener('click',e=>{if(e.target.id==='hpGridModal')gridClose()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')gridClose()});
}

function renderKpis(s){
  const m=operational(s);
  const cards=[
    {label:'5S 고도화 판정 완료율',val:fmt(m.judgmentRate,'%'),color:'#2f80ed'},
    {label:'평균 판정 Lead Time',val:fmt(m.avgLead,'일'),color:'#cf8618'},
    {label:'고도화 수준 (클릭)',val:m.maturity==null?'—':`Lv.${m.maturity}`,color:'#27ae60'},
    {label:'6개월 유지율',val:fmt(m.sixRetention,'%'),color:'#7a5af8'},
    {label:'Audit 부적합 재발률',val:fmt(m.recurrence,'%'),color:'#e45757'},
    {label:'기한 내 개선조치 완료율',val:fmt(m.actionOnTime,'%'),color:'#2f80ed'}
  ];
  $('#hpKpis').innerHTML=cards.map(c=>`<div class="hpKpi" data-hp-grid="kpi" tabindex="0" role="button"><small>${c.label}</small><b style="color:${c.color}">${c.val}</b><span class="hpSub">실데이터 미연결 시 — 표시 · 전월대비 비교는 이력 축적 후 제공</span></div>`).join('');
  const act=actions();
  const kpiHandlers=[
    ()=>{const scope=(s.rows||[]).filter(x=>x.candidate===true||x.isCandidate===true||String(x.judgeState||'').trim());gridOpen('5S 고도화 판정 완료율',['생산팀','작업장/사례','현장 등록일','판정상태','판정일','판정자'],scope.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['date','regDate','createdAt'])||'-',x.judgeState||'판정대기',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',x.judgeOwner||'-']),'판정대상 전체 원천 기준')},
    ()=>{const judged=(s.rows||[]).filter(x=>['확정','보완요청','미확정'].includes(String(x.judgeState||'').trim())&&pick(x,['judgedAt','judgeDate','confirmedAt']));gridOpen('평균 판정 Lead Time',['생산팀','작업장/사례','등록일','판정일','Lead Time(일)'],judged.map(x=>{const regd=dateOnly(x,['createdAt','regDate','date','importedAt']),jd=dateOnly(x,['judgedAt','judgeDate','confirmedAt']);return[x.team||'-',x.workplace||x.title||'-',regd||'-',jd||'-',regd&&jd?daysBetween(regd,jd):'—']}),'등록일→판정완료일 소요일 개별 사례')},
    ()=>{const confirmed=(s.confirmed||[]).filter(x=>levelOf(x));gridOpen('고도화 수준',['생산팀','작업장/사례','고도화 Level','판정일'],confirmed.map(x=>[x.team||'-',x.workplace||x.title||'-','Lv.'+levelOf(x),dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-']),'공식확정 사례 중 Level 부여 건')},
    ()=>{const six=(s.confirmed||[]).filter(x=>pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState']));gridOpen('6개월 유지율',['생산팀','작업장/사례','판정일','6개월 Audit 결과'],six.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',pick(x,['audit6Result','audit6mResult','sixMonthAuditResult','audit6State','sixMonthState'])||'-']),'6개월 Audit 결과가 있는 확정 사례')},
    ()=>{const rec=act.filter(x=>pick(x,['recurrence','recurrent','recurrenceState','재발여부'])!==null);gridOpen('Audit 부적합 재발률',['생산팀','작업장','재발여부','등록일'],rec.map(x=>[x.team||'-',x.workplace||'-',pick(x,['recurrence','recurrent','recurrenceState','재발여부'])||'-',x.date||x.startDate||'-']),'재발여부가 기록된 개선조치 건')},
    ()=>{const done=act.filter(x=>pick(x,['doneDate','completedDate','finishDate'])&&pick(x,['targetDate','due','dueDate']));gridOpen('기한 내 개선조치 완료율',['생산팀','작업장','목표기한','완료일','기한준수'],done.map(x=>{const d=pick(x,['doneDate','completedDate','finishDate']),due=pick(x,['targetDate','due','dueDate']);return[x.team||'-',x.workplace||'-',due||'-',d||'-',(d&&due&&new Date(d)<=new Date(due))?'준수':'지연']}),'목표기한·완료일이 모두 있는 개선조치 건')}
  ];
  $$('#hpKpis .hpKpi').forEach((c,i)=>{c.addEventListener('click',()=>kpiHandlers[i]());c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();kpiHandlers[i]()}})});
}

function renderTypes(s){
  const rows=s.activities&&s.activities.length?s.activities:s.rows||[];
  const byType=new Map(CATS.map(c=>[c.key,0]));
  const rowsByType=new Map(CATS.map(c=>[c.key,[]]));
  rows.forEach(x=>{const k=catOf(x);byType.set(k,(byType.get(k)||0)+1);rowsByType.get(k).push(x)});
  $('#hpTypes').innerHTML=CATS.map(c=>{
    const n=byType.get(c.key)||0;
    return `<div class="hpType ${c.cls}" data-hp-grid="type" tabindex="0" role="button"><div class="hpTypeIco">${c.ico}</div><b>${esc(c.key)}</b><span class="hpTypeVal">${n}건</span><span class="hpTypeGoal">목표 미설정</span><div class="hpTypeTrack"><i style="width:0%"></i></div><span class="hpTypeRate">달성률 —</span></div>`;
  }).join('');
  const HEAD=['생산팀','작업장/공정','등록일','판정상태'];
  $$('#hpTypes .hpType').forEach((c,i)=>{
    const key=CATS[i].key;
    const run=()=>{const list=rowsByType.get(key)||[];gridOpen(`5S 활동유형 · ${key}`,HEAD,list.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['date','regDate','createdAt'])||'-',x.judgeState||x.status||'-']),`${key} 유형 활동 전체`)};
    c.addEventListener('click',run);c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();run()}})
  });
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
  confirmed.forEach(x=>{const team=String(x.team||'').trim();const lv=levelOf(x);if(!team||!lv)return;const k=team+'|'+lv;if(!byTeamLevel.has(k))byTeamLevel.set(k,{team,lv,count:0,rows:[]});const e=byTeamLevel.get(k);e.count++;e.rows.push(x)});
  const groups=[...byTeamLevel.values()];
  const maxCount=Math.max(1,...groups.map(g=>g.count));
  const placedByLevel=new Map();
  const HEAD=['생산팀','작업장/사례','판정일','판정자'];
  groups.sort((a,b)=>b.count-a.count).forEach(g=>{
    let x=6+Math.min(92,(g.count/maxCount)*86);
    const y=6+((g.lv-1)/4)*88;
    const taken=placedByLevel.get(g.lv)||[];
    let guard=0;
    while(taken.some(px=>Math.abs(px-x)<7)&&guard<20){x=Math.max(4,Math.min(96,x+ (guard%2?1:-1)*(4+guard)));guard++}
    taken.push(x);placedByLevel.set(g.lv,taken);
    const dot=document.createElement('div');
    dot.className=`hpMapDot hpMapDot-lv${g.lv}`;
    dot.style.left=x+'%';dot.style.bottom=y+'%';
    dot.title=`${g.team} · Lv.${g.lv} · 확정 ${g.count}건`;
    dot.tabIndex=0;dot.setAttribute('role','button');
    dot.innerHTML=`<span class="hpMapTip">${esc(g.team)} · Lv.${g.lv} · ${g.count}건</span>`;
    dot.addEventListener('click',()=>gridOpen(`${g.team} · Lv.${g.lv}`,HEAD,g.rows.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',x.judgeOwner||'-']),`${g.team} · Level ${g.lv} 공식확정 사례`));
    map.appendChild(dot);
  });
}

function renderDist(s){
  const confirmed=s.confirmed||[];
  const byLevel=new Map([5,4,3,2,1].map(n=>[n,{teams:new Set(),count:0,rows:[]}]));
  confirmed.forEach(x=>{const lv=levelOf(x);if(!lv||!byLevel.has(lv))return;const e=byLevel.get(lv);e.count++;e.rows.push(x);if(x.team)e.teams.add(x.team)});
  const total=confirmed.length;
  const rows=[5,4,3,2,1].map(lv=>{const e=byLevel.get(lv);return{lv,teams:e.teams.size,count:e.count,pct:total?Math.round(e.count/total*1000)/10:0,rows:e.rows}});
  const allTeams=new Set(confirmed.map(x=>x.team).filter(Boolean));
  $('#hpDistBody').innerHTML=[
    ...rows.map(r=>`<tr data-hp-grid="dist" data-lv="${r.lv}"><td>Lv.${r.lv}</td><td>${r.teams||'—'}</td><td>${r.count||'—'}</td><td>${total?r.pct+'%':'—'}</td></tr>`),
    `<tr class="hpDistSum"><td>합계</td><td>${allTeams.size||'—'}</td><td>${total||'—'}</td><td>${total?'100%':'—'}</td></tr>`
  ].join('');
  const HEAD=['생산팀','작업장/사례','판정일','판정자'];
  $$('#hpDistBody tr[data-hp-grid]').forEach((tr,i)=>{
    tr.style.cursor='pointer';
    const r=rows[i];
    tr.addEventListener('click',()=>gridOpen(`5S 고도화 수준 Lv.${r.lv}`,HEAD,r.rows.map(x=>[x.team||'-',x.workplace||x.title||'-',dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',x.judgeOwner||'-']),`Level ${r.lv} 공식확정 사례`));
  });
}

function renderActionSummary(){
  const f=window.HD20MaturityFollowup?.summary?.();
  const act=actions();
  const notDoneList=act.filter(x=>String(x.status||'')!=='완료');
  $('#hpActionAsOf').textContent=`기준일 : ${new Date().toISOString().slice(0,10)}`;
  const rows=[
    {label:'1개월 점검 대상',n:f?.one?.length,due:f?.one?.filter(x=>x.state==='기한임박').length,over:f?.one?.filter(x=>x.state==='경과').length,list:f?.one},
    {label:'3개월 Audit 대상',n:f?.three?.length,due:f?.three?.filter(x=>x.state==='기한임박').length,over:f?.three?.filter(x=>x.state==='경과').length,list:f?.three},
    {label:'6개월 Audit 대상',n:f?.six?.length,due:f?.six?.filter(x=>x.state==='기한임박').length,over:f?.six?.filter(x=>x.state==='경과').length,list:f?.six},
    {label:'개선조치 미완료',n:notDoneList.length,due:null,over:null,list:null}
  ];
  $('#hpActionRows').innerHTML=rows.map((r,i)=>`<div class="hpActionRow" data-hp-grid="action" data-i="${i}"><span>${esc(r.label)}</span><span><b>${r.n==null?'—':r.n+'건'}</b>${r.due?`<span class="hpBadge due">기한임박 ${r.due}</span>`:''}${r.over?`<span class="hpBadge over">경과 ${r.over}</span>`:''}</span></div>`).join('');
  $$('#hpActionRows .hpActionRow').forEach((el,i)=>{
    el.style.cursor='pointer';
    el.addEventListener('click',()=>{
      const r=rows[i];
      if(r.list){gridOpen(r.label,['생산팀','작업장/사례','후속단계','기준일','D-day','상태'],r.list.map(x=>[x.team||'-',x.workplace||x.title||'-',x.label||'-',x.date instanceof Date?x.date.toISOString().slice(0,10):(x.date||'-'),x.diff>=0?'D-'+x.diff:'D+'+Math.abs(x.diff),x.state||'-']),`${r.label} Lifecycle 원천`)}
      else{gridOpen(r.label,['생산팀','작업장','문제점','기한','상태'],notDoneList.map(x=>[x.team||'-',x.workplace||'-',x.problem||'-',x.due||x.targetDate||'-',x.status||'-']),'완료 상태가 아닌 개선조치 전체')}
    });
  });
}

function renderSideStats(s){
  const rawTotal=(s.candidates?.length||0)+(s.confirmed?.length||0)+(s.maintained?.length||0);
  $('#hpRawTotal').textContent=rawTotal?`전체 ${rawTotal}건`:'—';
  $('#hpGmesTotal').textContent=s.confirmed?.length?`전체 ${s.confirmed.length}건`:'—';
  const HEAD=['구분','생산팀','작업장/사례','유형','판정상태'];
  $('#hpRawTotal').closest('.hpSideCard').style.cursor='pointer';
  $('#hpRawTotal').closest('.hpSideCard').addEventListener('click',()=>{
    const rows=[...(s.candidates||[]).map(x=>['후보',x]),...(s.confirmed||[]).map(x=>['확정',x]),...(s.maintained||[]).map(x=>['유지',x])];
    gridOpen('Portfolio Raw Data (후보+확정+유지 전체)',HEAD,rows.map(([label,x])=>[label,x.team||'-',x.workplace||x.title||'-',catOf(x),x.judgeState||'-']),'후보·확정·유지 전체 원천 합산');
  });
  $('#hpGmesTotal').closest('.hpSideCard').style.cursor='pointer';
  $('#hpGmesTotal').closest('.hpSideCard').addEventListener('click',()=>{
    gridOpen('공식 확정 GMES 사례',['생산팀','작업장/사례','유형','판정일','판정자'],(s.confirmed||[]).map(x=>[x.team||'-',x.workplace||x.title||'-',catOf(x),dateOnly(x,['judgedAt','judgeDate','confirmedAt'])||'-',x.judgeOwner||'-']),'공식확정 전체');
  });
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
    if(kind==='kpi')return csvDownload('HDPS_KPI_요약.csv',[['지표','값'],['5S 고도화 판정 완료율',fmt(m.judgmentRate,'%')],['평균 판정 Lead Time',fmt(m.avgLead,'일')],['고도화 수준',m.maturity==null?'—':'Lv.'+m.maturity],['6개월 유지율',fmt(m.sixRetention,'%')],['Audit 부적합 재발률',fmt(m.recurrence,'%')],['기한 내 개선조치 완료율',fmt(m.actionOnTime,'%')]]);
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
  const ROUTES={activity:'activity',workplace:'workplace',audit:'audit',action:'action',master:'master'};
  $$('.hpNav button[data-hp-nav]').forEach(btn=>btn.onclick=()=>{
    const key=btn.dataset.hpNav;
    if(key==='dashboard'){$$('.hpNav button').forEach(b=>b.classList.toggle('on',b===btn));return}
    if(ROUTES[key]){location.href='index.html?tab='+ROUTES[key];return}
  });
  $$('[data-hp-detail]').forEach(el=>el.addEventListener('click',e=>{
    e.preventDefault();
    const kind=el.dataset.hpDetail;
    const s=snap();
    if(kind==='kpi'){
      const m=operational(s);
      gridOpen('HDPS 5S 고도화 운영지표 (KPI) 요약',['지표','값'],[['5S 고도화 판정 완료율',fmt(m.judgmentRate,'%')],['평균 판정 Lead Time',fmt(m.avgLead,'일')],['고도화 수준',m.maturity==null?'—':'Lv.'+m.maturity],['6개월 유지율',fmt(m.sixRetention,'%')],['Audit 부적합 재발률',fmt(m.recurrence,'%')],['기한 내 개선조치 완료율',fmt(m.actionOnTime,'%')]],'6개 운영지표 요약');
      return;
    }
    if(kind==='action'){
      const f=window.HD20MaturityFollowup?.summary?.();
      const flat=[...(f?.one||[]),...(f?.three||[]),...(f?.six||[])].sort((a,b)=>a.diff-b.diff);
      gridOpen('Action Summary 전체 (추적점검/개선)',['생산팀','작업장/사례','후속단계','기준일','D-day','상태'],flat.map(x=>[x.team||'-',x.workplace||x.title||'-',x.label||'-',x.date instanceof Date?x.date.toISOString().slice(0,10):(x.date||'-'),x.diff>=0?'D-'+x.diff:'D+'+Math.abs(x.diff),x.state||'-']),'1·3·6개월 Lifecycle 전체');
      return;
    }
    if(kind==='raw'||kind==='gmes')return; // handled by the parent card's own click
    alert('상세 Grid는 검토 단계에서 기존 대시보드의 Grid 팝업과 통합 예정입니다.');
  }));
  $('#hpRefresh').onclick=()=>location.reload();
  $('#hpFullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen?.()};
  $('#hpLogout').onclick=()=>alert('Prototype 단계에서는 별도 로그인/로그아웃 세션이 연결되어 있지 않습니다.');
  $('#hpPrint')?.addEventListener('click',()=>window.print());
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
  wireGridModal();
  render();
  wireNavGuard();
  wireAi();
  ['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-followup-updated','hd20-action-updated'].forEach(ev=>window.addEventListener(ev,()=>setTimeout(render,30)));
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();
