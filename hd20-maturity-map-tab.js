(()=>{'use strict';
const ID='hd20MaturityMapTab',STYLE='hd20MaturityMapTabStyle';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],txt=v=>String(v??'').trim(),esc=v=>txt(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function api(){return window.HD20KPIData||null}
function data(){const a=api();if(!a)return{rows:[],candidates:[],confirmed:[],maintained:[],teams:[]};const rows=a.load().filter(a.isAdvancementType),candidates=rows.filter(a.isCandidate),confirmed=rows.filter(a.isConfirmed),maintained=confirmed.filter(a.isMaintained),teams=[...new Set(rows.map(x=>txt(x.team)).filter(Boolean))];return{rows,candidates,confirmed,maintained,teams}}
function teamStats(d){return d.teams.map(team=>{const same=x=>txt(x.team)===team,c=d.candidates.filter(same),f=d.confirmed.filter(same),m=d.maintained.filter(same),rate=f.length?Math.round(m.length/f.length*1000)/10:null;return{team,candidates:c.length,confirmed:f.length,maintained:m.length,rate,cases:f}}).sort((a,b)=>(b.maintained-a.maintained)||(b.confirmed-a.confirmed)||(b.candidates-a.candidates)||a.team.localeCompare(b.team,'ko'))}
function css(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=`#${ID}{display:none;margin:0 0 18px}#${ID}.on{display:block}.mmtHero{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin:0 0 12px;padding:18px;border:1px solid #d6e2ea;border-radius:14px;background:linear-gradient(135deg,#f9fcfd,#eef6fa)}.mmtHero small{display:block;color:#0e6d9d;font-size:10px;font-weight:900;letter-spacing:.12em}.mmtHero h2{margin:4px 0 3px;color:#153247;font-size:22px}.mmtHero p{margin:0;color:#6c8292;font-size:12px}.mmtKpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:12px}.mmtKpi{padding:12px 13px;border:1px solid #dce6ec;border-radius:10px;background:#fff}.mmtKpi small{display:block;color:#6e8392;font-size:11px;font-weight:850}.mmtKpi b{display:block;margin-top:4px;color:#173a57;font-size:23px}.mmtWrap{display:grid;grid-template-columns:1fr;gap:12px}.mmtCaseCard{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}.mmtMapCard,.mmtCaseCard{min-width:0;border:1px solid #dce6ec;border-radius:12px;background:#fff;overflow:hidden}.mmtHead{display:flex;justify-content:space-between;gap:12px;padding:11px 13px;border-bottom:1px solid #e4ebef;background:#fafcfd}.mmtHead b{color:#173a57;font-size:13px}.mmtHead span{color:#768b99;font-size:10.5px}.mmtBars{padding:10px 13px}
.mmtTreeSvg{display:block;border-radius:8px;overflow:hidden}
.mmtTreeCell{cursor:pointer}
.mmtTreeCell rect{stroke:#fff;stroke-width:2;transition:opacity .12s}
.mmtTreeCell:hover rect{opacity:.85}
.mmtTreeCell.on rect{stroke:#14304c;stroke-width:3}
.mmtTreeCell text{pointer-events:none}.mmtTreeLeg{display:flex;gap:14px;flex-wrap:wrap;padding:8px 13px 12px;font-size:11px;color:#5c6b7a;font-weight:800}.mmtTreeLeg span{display:flex;align-items:center;gap:5px}.mmtTreeLeg i{width:10px;height:10px;border-radius:3px;display:inline-block}.mmtBarRow{display:grid;grid-template-columns:110px 1fr 64px 52px;align-items:center;gap:10px;width:100%;padding:8px 6px;border:0;border-bottom:1px solid #eef2f5;background:#fff;text-align:left;cursor:pointer}
.mmtBarRow:hover{background:#f7fbff}
.mmtBarRow.on{background:#eef7fd}
.mmtBarName{font-size:12.5px;font-weight:850;color:#17394f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mmtBarTrack{position:relative;height:16px;background:#eef2f5;border-radius:4px;overflow:hidden;display:flex}
.mmtBarKeep{display:block;height:100%;background:#2f8f63}
.mmtBarLost{display:block;height:100%;background:#d7dee3}
.mmtBarRow.none .mmtBarTrack{background:repeating-linear-gradient(45deg,#eef2f5,#eef2f5 4px,#f5f7f8 4px,#f5f7f8 8px)}
.mmtBarNum{font-size:11.5px;font-weight:850;color:#3d5a6c;text-align:right;white-space:nowrap}
.mmtBarPct{font-size:12px;font-weight:900;color:#153a55;text-align:right}
.mmtBarRow.maintained .mmtBarPct{color:#2f8f63}.mmtBarRow.warn .mmtBarKeep{background:#c0392b}.mmtBarRow.warn .mmtBarPct{color:#c0392b}#mmtCasePopup{position:fixed;inset:0;z-index:99990;display:none;align-items:center;justify-content:center;background:rgba(12,35,51,.5);padding:16px}
#mmtCasePopup.on{display:flex}
#mmtCasePopup .mcpBox{width:min(640px,96vw);max-height:86vh;background:#fff;border-radius:14px;display:flex;flex-direction:column;box-shadow:0 24px 70px rgba(6,31,49,.35);overflow:hidden}
#mmtCasePopup .mcpHead{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid #e3eaf0}
#mmtCasePopup .mcpHead b{font-size:16px;color:#14304c}
#mmtCasePopup .mcpHead span{font-size:12.5px;color:#5c6b7a;font-weight:800}
#mmtCasePopup .mcpHead button{margin-left:auto;width:30px;height:30px;border:1px solid #d7e2e8;border-radius:8px;background:#fff;color:#5d7484;font-size:16px;cursor:pointer}
#mmtCasePopup .mcpBody{overflow:auto;padding:10px}.mmtCases{max-height:548px;overflow:auto;padding:10px}.mmtTeam{display:grid;grid-template-columns:1fr repeat(4,70px);gap:6px;align-items:center;width:100%;padding:8px 9px;border:0;border-bottom:1px solid #edf2f5;background:#fff;text-align:left;cursor:pointer}.mmtTeam.on{background:#edf7ff}.mmtTeam b{color:#173a57;font-size:12px}.mmtTeam span{color:#536f82;font-size:11px;text-align:right}.mmtCase{margin-top:8px;padding:9px;border:1px solid #e1e9ee;border-radius:8px;background:#fbfcfd}.mmtCase button{width:100%;padding:0;border:0;background:transparent;text-align:left;cursor:pointer}.mmtCase b{display:block;color:#173a57;font-size:12px}.mmtCase small{display:block;margin-top:3px;color:#748997;font-size:10.5px}.mmtEmpty{display:grid;place-items:center;min-height:250px;padding:20px;color:#7a8e9c;text-align:center}.mmtDetail{position:fixed;inset:0;z-index:100700;display:none;place-items:center;padding:20px;background:rgba(16,43,67,.36)}.mmtDetail.on{display:grid}.mmtDetailBox{width:min(760px,94vw);max-height:86vh;overflow:auto;border-radius:14px;background:#fff;box-shadow:0 24px 70px rgba(8,30,49,.24)}.mmtDetailHead{display:flex;justify-content:space-between;gap:12px;padding:13px 15px;border-bottom:1px solid #e1e9ef}.mmtDetailHead button{width:32px;height:32px;border:1px solid #d5dee7;border-radius:8px;background:#fff;cursor:pointer}.mmtDetailGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;padding:14px}.mmtField{padding:9px;border:1px solid #e4ebef;border-radius:8px}.mmtField small{display:block;color:#7b8d99;font-size:10px}.mmtField b{display:block;margin-top:3px;color:#25475d;font-size:12px;word-break:break-word}@media(max-width:1100px){.mmtWrap{grid-template-columns:1fr}.mmtKpis{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.mmtHero{align-items:flex-start;flex-direction:column}.mmtKpis{grid-template-columns:1fr 1fr}.mmtTeam{grid-template-columns:1fr repeat(4,52px);padding:8px 6px}.mmtDetailGrid{grid-template-columns:1fr}}`;document.head.appendChild(s)}
function ensurePopup(){let m=document.getElementById('mmtCasePopup');if(m)return m;m=document.createElement('div');m.id='mmtCasePopup';m.innerHTML='<div class="mcpBox"><div class="mcpHead"><b></b><span></span><button type="button" data-mcp="close">×</button></div><div class="mcpBody"></div></div>';document.body.appendChild(m);
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-mcp="close"]'))m.classList.remove('on')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&m.classList.contains('on'))m.classList.remove('on')});
  return m}
function openTeamPopup(t){const m=ensurePopup();m.querySelector('.mcpHead b').textContent=t.team;m.querySelector('.mcpHead span').textContent=`확정 ${t.confirmed} · 유지 ${t.maintained} · 유지율 ${t.rate===null?'—':t.rate+'%'}`;
  const body=m.querySelector('.mcpBody');
  body.innerHTML=t.cases.length?t.cases.map((x,ci)=>`<div class="mmtCase"><button type="button" data-mcp-case="${ci}"><b>${esc(x.workplace||x.title||x.id||'공식확정 Case')}</b><small>${esc(txt(x.judgedAt||x.confirmedAt||x.judgeDate||x.date).slice(0,10)||'—')} · ${esc(x.maintainState||x.auditState||x.status||'유지상태 미기재')}</small></button></div>`).join(''):'<div class="mmtEmpty">공식 확정 Case 없음</div>';
  body.querySelectorAll('[data-mcp-case]').forEach((b,ci)=>b.onclick=()=>openCase(t.cases[ci]));
  m.classList.add('on')}
function ensure(){let el=document.getElementById(ID);if(el)return el;el=document.createElement('section');el.id=ID;el.dataset.dashboardSection='maturity';const anchor=document.querySelector('.beginnerHint')||document.querySelector('.beginnerNav');anchor?.insertAdjacentElement('afterend',el);return el}
function detailModal(){let m=$('.mmtDetail');if(m)return m;m=document.createElement('div');m.className='mmtDetail';m.innerHTML='<div class="mmtDetailBox"><div class="mmtDetailHead"><div><small>OFFICIAL ADVANCEMENT CASE</small><b>고도화 공식확정 Case</b></div><button type="button">×</button></div><div class="mmtDetailGrid"></div></div>';document.body.appendChild(m);const close=()=>m.classList.remove('on');m.querySelector('button').onclick=close;m.onclick=e=>{if(e.target===m)close()};return m}
function openCase(x){const m=detailModal(),g=$('.mmtDetailGrid',m),fields=[['Activity ID',x.id||x.activityId],['생산팀',x.team],['작업장/사례',x.workplace||x.title],['고도화 유형',x.type||x.category],['현장 등록일',txt(x.date||x.importedAt).slice(0,10)],['판정일',txt(x.judgedAt||x.confirmedAt||x.judgeDate).slice(0,10)],['판정자',x.judgeOwner||x.judgeBy||x.confirmedBy],['공식판정',x.judgeState],['유지상태',x.maintainState||x.auditState||x.status||'—'],['확정사유',x.judgeReason||'—']];g.innerHTML=fields.map(([k,v])=>`<div class="mmtField"><small>${esc(k)}</small><b>${esc(v||'—')}</b></div>`).join('');m.classList.add('on')}
function render(){css();const el=ensure(),d=data();
  /* 'Case 필터'(전체/유지미흡/재점검 필요)가 예전엔 화면에 상시 펼쳐져 있던 우측 Case 카드 목록만
     제어했는데, 그 목록을 팝업으로 옮기면서 필터를 눌러도 메인 화면(팀별 막대)엔 아무 변화가 없어
     사실상 죽은 버튼이 돼 있던 것을 발견 → 메인 막대 자체가 이 필터를 반영하도록 재연결.
     '유지미흡'/'재점검 필요' 선택 시: 팀별 막대를 '그 조건에 해당하는 Case 수' 기준으로 다시 계산하고,
     해당 건이 0건인 팀은 목록에서 제외(= 그 문제가 있는 팀만 바로 눈에 띔). */
  const filterMode=document.getElementById(ID)?.dataset.mmtFilter||'all',
    G=window.HD20_MATURITY_MAP_OPERATIONAL_GUARD,
    matchCase=x=>{if(filterMode==='all')return true;if(!G?.stateOf)return true;const st=G.stateOf(x);return filterMode==='weak'?st.performance==='유지미흡':filterMode==='review'?!!st.attention:true};
  let teams=teamStats(d);
  if(filterMode!=='all'){
    teams=teams.map(t=>{const matched=t.cases.filter(matchCase);return{...t,maintained:matched.length,confirmed:t.cases.length,rate:t.cases.length?Math.round(matched.length/t.cases.length*1000)/10:null,cases:matched}}).filter(t=>t.maintained>0).sort((a,b)=>b.maintained-a.maintained||a.team.localeCompare(b.team,'ko'));
  }
  const sumC=d.candidates.length,sumF=d.confirmed.length,sumM=d.maintained.length,rate=sumF?Math.round(sumM/sumF*1000)/10:null,newSecuredRows=window.HD20KPIData?.snapshot?.().newSecured||[],newF=newSecuredRows.length,maxMaintained=Math.max(1,...teams.map(x=>x.maintained),1);el.innerHTML=`<div class="mmtHero"><div><small>고도화 현황</small><h2>고도화 맵</h2><p>공식확정 · 현재 유지상태를 생산팀별로 비교하고 공식 확정 Case까지 Drill-down합니다. (후보는 성과가 아니므로 제외)</p></div><div><small>판정기준</small><b>KPI Canonical 동일판정 · 공식확정만 성과 반영</b></div></div><div class="mmtKpis"><button type="button" class="mmtKpi" data-mmtk="new"><small>올해 신규 공식확정</small><b>${newF}</b></button><button type="button" class="mmtKpi" data-mmtk="conf"><small>누적 공식확정</small><b>${sumF}</b></button><button type="button" class="mmtKpi" data-mmtk="keep"><small>현재 유지</small><b>${sumM}</b></button><div class="mmtKpi"><small>유지율 (현재 유지 ÷ 공식확정)</small><b>${rate===null?'—':rate+'%'}</b></div></div><div class="mmtWrap"><section class="mmtMapCard"><div class="mmtHead"><b>팀별 고도화 Portfolio Map</b><span>사각형 면적=확정 건수 · 색=유지율(초록 높음·빨강 낮음) · 칸을 누르면 Case 목록이 팝업으로 열립니다</span></div><div class="mmtBars"></div><div class="mmtTreeLeg"><span><i style="background:#1f6f6b"></i>유지율 90%↑</span><span><i style="background:#2f8f63"></i>70~90%</span><span><i style="background:#d9a441"></i>50~70%</span><span><i style="background:#c0392b"></i>50% 미만</span></div></section><section class="mmtCaseCard"><div class="mmtHead"><b>팀별 공식확정 Case</b><span>팀 선택 → Case 상세</span></div><div class="mmtCases"></div></section></div>`;const bars=$('.mmtBars',el),cases=$('.mmtCases',el);if(!teams.length){bars.innerHTML='<div class="mmtEmpty">고도화 공식확정 원천데이터가 없습니다.</div>';cases.innerHTML='<div class="mmtEmpty">공식 확정 Case가 없습니다.</div>';return el}
  const maxConfirmed=Math.max(1,...teams.map(x=>x.confirmed));const barFrag=document.createDocumentFragment(),rowFrag=document.createDocumentFragment();
  /* '고도화 맵'이라는 이름에 맞게 실제 지도(공간 분할)처럼 보이도록 트리맵으로 렌더링 — 각 팀을 사각형
     하나로, 면적=확정(또는 필터 조건 일치) 건수, 색=유지율(또는 필터 상태)로 동시에 표현. 이진 분할 방식이라
     사각형끼리 절대 겹치지 않음(막대/버블과 달리 '겹침' 자체가 구조적으로 불가능). */
  function treemapLayout(items,x,y,w,h){
    if(!items.length)return[];
    if(items.length===1)return[{...items[0],x,y,w,h}];
    const total=items.reduce((a,b)=>a+b.value,0);
    let best=Infinity,splitIdx=1,acc=0;
    for(let k=1;k<items.length;k++){acc+=items[k-1].value;const diff=Math.abs(acc/total-0.5);if(diff<best){best=diff;splitIdx=k}}
    const g1=items.slice(0,splitIdx),g2=items.slice(splitIdx),v1=g1.reduce((a,b)=>a+b.value,0);
    if(w>=h){const w1=Math.max(1,w*v1/total);return[...treemapLayout(g1,x,y,w1,h),...treemapLayout(g2,x+w1,y,w-w1,h)]}
    const h1=Math.max(1,h*v1/total);return[...treemapLayout(g1,x,y,w,h1),...treemapLayout(g2,x,y+h1,w,h-h1)]
  }
  const rateColor=t=>{if(isFilteredAll)return'#c0392b';if(t.rate===null)return'#9aa7af';if(t.rate>=90)return'#1f6f6b';if(t.rate>=70)return'#2f8f63';if(t.rate>=50)return'#d9a441';return'#c0392b'};
  const isFilteredAll=filterMode!=='all',TW=Math.max(280,(bars.clientWidth||bars.parentElement?.clientWidth||600)-4),TH=340;
  const items=teams.map(t=>({t,value:Math.max(0.0001,isFilteredAll?t.maintained:t.confirmed)}));
  const cellsLayout=treemapLayout(items,0,0,TW,TH);
  let svgCells='';
  cellsLayout.forEach((c,i)=>{const t=c.t,showText=c.w>46&&c.h>30,fs=c.w>90?12:10;
    const numLabel=isFilteredAll?`${t.maintained}건`:`${t.maintained}/${t.confirmed}`,
      pctLabel=isFilteredAll?(filterMode==='weak'?'유지미흡':'재점검 필요'):(t.rate===null?'—':t.rate+'%');
    svgCells+=`<g class="mmtTreeCell" data-i="${i}" tabindex="0"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="${rateColor(t)}" rx="3"></rect>`+
      (showText?`<text x="${c.x+6}" y="${c.y+16}" font-size="${fs}" font-weight="900" fill="#fff">${esc(t.team.length>10&&c.w<120?t.team.slice(0,9)+'…':t.team)}</text><text x="${c.x+6}" y="${c.y+c.h-8}" font-size="${Math.max(9,fs-1)}" font-weight="800" fill="#fff" opacity=".92">${numLabel} · ${pctLabel}</text>`:'')+
      `<title>${esc(t.team)} · 확정 ${t.confirmed} · 유지 ${t.maintained} · ${t.rate===null?'—':t.rate+'%'}</title></g>`});
  bars.innerHTML=`<svg viewBox="0 0 ${TW} ${TH}" width="100%" height="${TH}" class="mmtTreeSvg">${svgCells}</svg>`;
  const svgEl=$('svg',bars);
  teams.forEach((t,i)=>{
    const row=document.createElement('div');row.innerHTML=`<button type="button" class="mmtTeam"><b>${esc(t.team)}</b><span>확정 ${t.confirmed}</span><span>유지 ${t.maintained}</span><span>${t.rate===null?'—':t.rate+'%'}</span></button><div class="mmtTeamCases" hidden>${t.cases.length?t.cases.map((x,ci)=>`<div class="mmtCase"><button type="button" data-mmt-case="${ci}"><b>${esc(x.workplace||x.title||x.id||'공식확정 Case')}</b><small>${esc(txt(x.judgedAt||x.confirmedAt||x.judgeDate||x.date).slice(0,10)||'—')} · ${esc(x.maintainState||x.auditState||x.status||'유지상태 미기재')}</small></button></div>`).join(''):'<div class="mmtEmpty">공식 확정 Case 없음</div>'}</div>`;rowFrag.appendChild(row);
    const cellIdx=cellsLayout.findIndex(c=>c.t===t),cellG=svgEl?.querySelectorAll('.mmtTreeCell')[cellIdx];
    const teamBtn=$('.mmtTeam',row),list=$('.mmtTeamCases',row),activate=()=>{$$('.mmtTreeCell',bars).forEach(v=>v.classList.remove('on'));$$('.mmtTeam',cases).forEach(v=>v.classList.remove('on'));$$('.mmtTeamCases',cases).forEach(v=>v.hidden=true);cellG?.classList.add('on');teamBtn.classList.add('on');list.hidden=false};
    if(cellG){cellG.onclick=()=>{activate();openTeamPopup(t)};cellG.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();openTeamPopup(t)}}}
    teamBtn.onclick=activate;$$('[data-mmt-case]',row).forEach((b,ci)=>b.onclick=()=>openCase(t.cases[ci]));if(i===0)activate()});cases.appendChild(rowFrag);
  const kpiCols=['생산팀','작업장/사례','등록일','판정일','판정상태'],kpiMapR=x=>[x.team||'—',x.workplace||x.title||x.id||'—',txt(x.date||x.regDate||x.createdAt).slice(0,10)||'—',txt(x.judgedAt||x.confirmedAt||x.judgeDate).slice(0,10)||'—',x.judgeState||'—'];
  const KPI_EV={new:['올해 신규 공식확정 근거',newSecuredRows],conf:['누적 공식확정 근거',d.confirmed],keep:['현재 유지 근거',d.maintained]};
  $$('[data-mmtk]',el).forEach(b=>b.onclick=()=>{const [t,rows]=KPI_EV[b.dataset.mmtk];window.HD20_BOARD_KIT?.openRows?.({title:t,cols:kpiCols,rows:rows.map(kpiMapR),file:'고도화맵_'+b.dataset.mmtk})});
  return el}
function show(){const el=render();el.classList.add('on');el.hidden=false;return true}
function hide(){const el=ensure();el.classList.remove('on');el.hidden=true;$('.mmtDetail')?.classList.remove('on');return true}
function open(){return show()}
function close(){return hide()}
function refresh(){if(window.HD20_NAV?.active?.()==='dashboard'&&window.HD20_DASHBOARD_TABS?.active?.()==='maturity')show()}
window.HD20_MATURITY_MAP_TAB={show,hide,open,close,render,data,teamStats,openCase};
window.addEventListener('hd20-open-maturity-map-tab',show);window.addEventListener('hd20-close-maturity-map-tab',hide);['hd20-kpi-source-updated','hd20-gmes-5s-imported','hd20-gmes-5s-judged','hd20-refresh-requested'].forEach(e=>window.addEventListener(e,()=>setTimeout(refresh,0)));document.addEventListener('keydown',e=>{if(e.key==='Escape')$('.mmtDetail.on')?.classList.remove('on')});
function boot(){css();const el=ensure();el.hidden=true}document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();