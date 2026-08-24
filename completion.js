const completionMonthly={
  '2026-01':{'조립1팀':[14,12],'Rear조립팀':[11,9],'가공1팀':[13,12],'자재운영팀':[10,8],'생산관리팀':[9,7]},
  '2026-02':{'조립1팀':[15,13],'Rear조립팀':[12,10],'가공1팀':[14,13],'자재운영팀':[10,8],'생산관리팀':[9,7]},
  '2026-03':{'조립1팀':[16,14],'Rear조립팀':[12,10],'가공1팀':[15,14],'자재운영팀':[11,8],'생산관리팀':[10,8]},
  '2026-04':{'조립1팀':[15,13],'Rear조립팀':[13,11],'가공1팀':[14,12],'자재운영팀':[11,9],'생산관리팀':[10,8]},
  '2026-05':{'조립1팀':[17,15],'Rear조립팀':[13,11],'가공1팀':[15,13],'자재운영팀':[12,10],'생산관리팀':[10,9]},
  '2026-06':{'조립1팀':[16,14],'Rear조립팀':[14,12],'가공1팀':[16,14],'자재운영팀':[12,10],'생산관리팀':[11,9]},
  '2026-07':{'조립1팀':[18,16],'Rear조립팀':[14,12],'가공1팀':[16,14],'자재운영팀':[13,11],'생산관리팀':[11,9]},
  '2026-08':{'조립1팀':[13,11],'Rear조립팀':[10,9],'가공1팀':[12,11],'자재운영팀':[9,8],'생산관리팀':[8,7]}
};
const completionTeams=['조립1팀','Rear조립팀','가공1팀','자재운영팀','생산관리팀'];

function pad2(n){return String(n).padStart(2,'0')}
function formatKoreanDate(d){return `${d.getFullYear()}.${pad2(d.getMonth()+1)}.${pad2(d.getDate())}`}
function getDashboardToday(){return new Date()}
function getDashboardStartMonth(){
  const el=document.getElementById('monthFilter');
  const currentMonth=getDashboardToday().getMonth()+1;
  const raw=Number(el?.value||1);
  if(!Number.isFinite(raw)||raw<1) return 1;
  return Math.min(Math.max(Math.trunc(raw),1),currentMonth);
}
function getDashboardRange(){
  const today=getDashboardToday();
  const startMonth=getDashboardStartMonth();
  return {year:today.getFullYear(),startMonth,start:new Date(today.getFullYear(),startMonth-1,1),end:today};
}
function dashboardMonthsInRange(){
  const r=getDashboardRange();
  const months=[];
  for(let m=r.startMonth;m<=r.end.getMonth()+1;m++) months.push(`${r.year}-${pad2(m)}`);
  return months;
}

function configureDashboardPeriodFilter(){
  const input=document.getElementById('monthFilter');
  if(!input)return;
  const label=input.closest('label');
  const now=getDashboardToday();
  input.type='number';
  input.min='1';
  input.max=String(now.getMonth()+1);
  input.step='1';
  input.value='';
  input.placeholder='미입력 = 1월';
  input.title='조회 시작월(1~현재월). 미입력 시 당해년도 1월 1일부터 오늘까지 누계 조회';
  input.setAttribute('inputmode','numeric');
  if(label){
    Array.from(label.childNodes).forEach(n=>{if(n.nodeType===3&&n.textContent.trim())n.textContent='조회 시작월 '});
    let hint=label.querySelector('.period-filter-hint');
    if(!hint){hint=document.createElement('small');hint.className='period-filter-hint';label.appendChild(hint)}
    hint.textContent='미입력 시 1월부터 누계';
  }
  const filters=document.querySelector('.dashboard-filter');
  if(filters&&!document.getElementById('dashboardScopeBadge')){
    const badge=document.createElement('div');
    badge.id='dashboardScopeBadge';
    badge.className='dashboard-scope-badge';
    filters.insertAdjacentElement('afterend',badge);
  }
  updateDashboardScopeText();
}

function updateDashboardScopeText(){
  const r=getDashboardRange();
  const badge=document.getElementById('dashboardScopeBadge');
  if(badge){
    badge.innerHTML=`<span>조회기간</span><strong>${formatKoreanDate(r.start)} ~ ${formatKoreanDate(r.end)}</strong><em>${r.startMonth===1?'당해년도 YTD 누계':`${r.startMonth}월 1일부터 현재일까지 누계`}</em>`;
  }
  document.querySelectorAll('.metric-grid .panel-head p').forEach(p=>{
    if(p.textContent.includes('당월')) p.textContent=p.textContent.replace('당월','조회기간 누계');
  });
}

function aggregateCompletion(months){
  const result={};completionTeams.forEach(t=>result[t]=[0,0]);
  months.forEach(m=>{const row=completionMonthly[m]||{};completionTeams.forEach(t=>{const v=row[t]||[0,0];result[t][0]+=v[0];result[t][1]+=v[1]})});
  return result;
}

function renderCompletion(){
  const r=getDashboardRange();
  const months=dashboardMonthsInRange();
  const data=aggregateCompletion(months);
  const totalReq=completionTeams.reduce((s,t)=>s+data[t][0],0);
  const totalDone=completionTeams.reduce((s,t)=>s+data[t][1],0);
  const totalOpen=totalReq-totalDone;
  const rate=totalReq?totalDone/totalReq*100:0;
  const label=`${formatKoreanDate(r.start)} ~ ${formatKoreanDate(r.end)} · 누계 요청건수 대비 완료건수`;
  const periodLabel=document.getElementById('completionPeriodLabel');
  if(periodLabel)periodLabel.textContent=label;
  const ids={completionRequested:totalReq,completionDone:totalDone,completionOpen:totalOpen};
  Object.entries(ids).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v});
  const rateEl=document.getElementById('completionRate');if(rateEl)rateEl.textContent=`${rate.toFixed(1)}%`;
  const formula=document.getElementById('completionFormula');if(formula)formula.textContent=`${totalDone} ÷ ${totalReq} × 100`;
  const kpi=document.getElementById('completionKpiValue');if(kpi)kpi.textContent=`${rate.toFixed(1)}%`;
  const meta=document.getElementById('completionKpiMeta');if(meta)meta.textContent=`누계 ${totalDone} / ${totalReq}건 완료`;
  const chart=document.getElementById('completionTeamChart');
  if(chart){chart.innerHTML=completionTeams.map(team=>{const [req,done]=data[team];const open=req-done;const pct=req?done/req*100:0;return `<div class="completion-row"><div class="completion-team"><strong>${team}</strong><span>${done}/${req}건 완료 · 미결 ${open}건</span></div><div class="completion-bar"><span class="completion-done" style="width:${pct}%"></span><span class="completion-open" style="width:${100-pct}%"></span></div><div class="completion-pct">${pct.toFixed(1)}%</div></div>`}).join('')}
  updateDashboardScopeText();
}

function renderMergedProductivityChart(){
  const grid=document.querySelector('.metric-grid');
  if(!grid || typeof perCapita==='undefined' || typeof standardPerCapita==='undefined') return;
  const standardMap=Object.fromEntries(standardPerCapita);
  const rows=perCapita.map(([team,improve])=>[team,improve,standardMap[team]||0]);
  const max=Math.max(...rows.flatMap(r=>[r[1],r[2]]),1);
  const r=getDashboardRange();
  grid.classList.add('metric-grid-merged');
  grid.innerHTML=`<article class="panel merged-productivity-panel"><div class="panel-head merged-productivity-head"><div><h2>팀별 인당 5S 개선성과</h2><p>${formatKoreanDate(r.start)} ~ ${formatKoreanDate(r.end)} 누계 · 팀 인원 기준 환산</p></div><div class="merged-legend"><span><i class="legend-improve"></i>인당 5S 개선건수</span><span><i class="legend-standard"></i>인당 5S 표준화 개선건수</span><b>단위: 건/인</b></div></div><div class="merged-productivity-chart">${rows.map(([team,improve,standard])=>`<div class="merged-team-group"><div class="merged-bars"><div class="merged-bar-wrap"><span>${improve.toFixed(1)}</span><div class="merged-bar improve" style="height:${Math.max(14,improve/max*205)}px" title="${team} · 인당 5S 개선건수 ${improve.toFixed(1)}건/인"></div></div><div class="merged-bar-wrap"><span>${standard.toFixed(1)}</span><div class="merged-bar standard" style="height:${Math.max(14,standard/max*205)}px" title="${team} · 인당 5S 표준화 개선건수 ${standard.toFixed(1)}건/인"></div></div></div><strong>${team}</strong></div>`).join('')}</div></article>`;
}

(function injectDashboardScopeStyles(){
  if(document.getElementById('dashboardScopeStyle'))return;
  const style=document.createElement('style');style.id='dashboardScopeStyle';style.textContent=`
  .dashboard-filter label:has(#monthFilter){position:relative}.period-filter-hint{font-size:9px;color:#98a2b3;font-weight:600;margin-top:2px}.dashboard-scope-badge{margin:-7px 0 16px;padding:9px 14px;border:1px solid #d9e5ec;border-left:4px solid #087fb1;border-radius:8px;background:#f8fbfd;display:flex;align-items:center;gap:10px;font-size:11px;color:#667085}.dashboard-scope-badge span{font-weight:800;color:#087fb1}.dashboard-scope-badge strong{font-size:12px;color:#1d2939}.dashboard-scope-badge em{font-style:normal;margin-left:auto;color:#475467}.metric-grid-merged{display:block!important;margin-bottom:18px}.merged-productivity-panel{width:100%}.merged-productivity-head{align-items:flex-end}.merged-legend{display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-size:11px;color:#667085}.merged-legend span{display:flex;align-items:center;gap:6px}.merged-legend b{font-size:10px;border:1px solid #e1e7ee;border-radius:99px;padding:4px 8px;background:#f8fafc}.legend-improve,.legend-standard{display:inline-block;width:11px;height:11px;border-radius:3px}.legend-improve{background:#48779a}.legend-standard{background:#6f9d71}.merged-productivity-chart{height:300px;padding:26px 38px 20px;display:flex;align-items:flex-end;gap:34px;background:linear-gradient(to top,#fafbfd,#fff)}.merged-team-group{flex:1;min-width:115px;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}.merged-bars{height:230px;width:100%;display:flex;align-items:flex-end;justify-content:center;gap:10px;border-bottom:1px solid #d5dde6;background:repeating-linear-gradient(to top,transparent 0,transparent 49px,#edf1f5 50px)}.merged-bar-wrap{height:100%;width:42px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}.merged-bar-wrap>span{font-size:11px;font-weight:800;color:#344054}.merged-bar{width:34px;border-radius:5px 5px 0 0}.merged-bar.improve{background:#48779a}.merged-bar.standard{background:#6f9d71}.merged-team-group>strong{margin-top:10px;font-size:11px;color:#475467;white-space:nowrap}@media(max-width:900px){.dashboard-scope-badge{align-items:flex-start;flex-direction:column}.dashboard-scope-badge em{margin-left:0}.merged-productivity-chart{overflow-x:auto;gap:20px;padding-left:20px;padding-right:20px}.merged-team-group{min-width:110px}.merged-productivity-head{align-items:flex-start;flex-direction:column}}`;
  document.head.appendChild(style);
})();

configureDashboardPeriodFilter();
const startMonthInput=document.getElementById('monthFilter');
startMonthInput?.addEventListener('input',()=>{
  const now=getDashboardToday();
  if(startMonthInput.value!==''&&Number(startMonthInput.value)>now.getMonth()+1)startMonthInput.value=String(now.getMonth()+1);
  if(startMonthInput.value!==''&&Number(startMonthInput.value)<1)startMonthInput.value='1';
  updateDashboardScopeText();
});
startMonthInput?.addEventListener('change',()=>{renderCompletion();renderMergedProductivityChart()});
document.getElementById('searchBtn')?.addEventListener('click',()=>{renderCompletion();renderMergedProductivityChart()});
renderCompletion();
renderMergedProductivityChart();
